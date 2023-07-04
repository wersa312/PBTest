const { getRandomId } = require("vk-io");
const { registerClan, clanFromDb } = require("../../api/clan"),
    { chunks, firstLetterToUpper, antiBan, numberWithCommas, dateFormat, numberToSmile } = require("../../api/utils"),
    { vkFromDb, vkId } = require("../../api/acc"),
    { log, logClan } = require("../../api/logs"),
    { users, clans, vkGroup, Keyboard } = require("../../main"),
    { clan_bis, clan_boost } = require("../../vars/clan.json"),
    { sections } = require("../../api/menu/section");

module.exports = [{

    r: /^к+л+а+н+$/i,
    payload: "clan_info",
    async f(msg, user) {
        if (!user.clan) return msg.send("🚫 У вас нет клана\n✏ Чтобы основать, введите \"Клан создать [название]\"");

        let buttons = [
            Keyboard.textButton({
                label: '👥 Участники',
                payload: {
                    command: 'clan_members',
                    params: {
                        n: 0
                    }
                },
                color: Keyboard.SECONDARY_COLOR
            }),
            Keyboard.textButton({
                label: '⛔ Покинуть',
                payload: {
                    command: 'clan_leave',
                    params: {
                        accept: false
                    },
                    toId: msg.senderId
                },
                color: Keyboard.NEGATIVE_COLOR
            })],
            clan = clans[user.clan];

        if (clan.members[msg.senderId].rank != "участник" && msg.isFromUser) {
            buttons.unshift(
                Keyboard.textButton({
                    label: '✏️ Переименовать',
                    payload: {
                        command: 'clan_rename'
                    },
                    color: Keyboard.SECONDARY_COLOR
                }),
                Keyboard.textButton({
                    label: '💰 Выдать зарплату',
                    payload: {
                        command: 'clan_payclan'
                    },
                    color: Keyboard.POSITIVE_COLOR
                })
            )
        }

        await vkFromDb(clan.creator);

        let params = {
            keyboard: Keyboard.keyboard(buttons).inline()
        }
        if (msg.type == "payload" && msg.params == "no_buttons") {
            params = {}
        }

        msg.send(`🛡 Клан @id${clan.creator} (${clan.name})
🆔 ID: ${user.clan}
👤 Глава: @id${clan.creator} (${users[clan.creator].nick})
👥 Участников: ${Object.keys(clan.members).length}
🔥 Рейтинг: ${clan.rating}
💰 Казна: ${numberWithCommas(clan.bank)}$
🎲 Очки: ${numberWithCommas(clan.points)}
💼 Бизнесы: ${(clan.boost == null ? "отсутствуют" : clan.boost.biz.map(c => clan_bis[c].emoji + " " + clan_bis[c].name).join(", "))}
⚡ Возможности: ${(clan.bpc.length == 0 ? "отсутствуют" : clan.bpc.map(c => clan_boost[c].emoji + " " + clan_boost[c].name).join(", "))}

📆 Клан создан: ${dateFormat(new Date(clan.reg_date))}`, params);
    }
},
{

    r: /^к+л+а+н+ у+ч+а+с+т+н+и+к+и+( [0-9])?/i,
    payload: "clan_members",
    async f(msg, user) {
        if (!user.clan) return msg.send("🚫 У вас нет клана\n✏ Чтобы основать, введите \"Клан создать [название]\"");

        let members = [],
            clan = clans[user.clan],
            params = {},
            postfix = "",
            listn,
            n = 0;

        for (let i in clan.members) {
            await vkFromDb(i);
            n++;
            members.push(`${numberToSmile(n)}. @id${i} (${users[i].nick}) | ${firstLetterToUpper(clan.members[i].rank)} | ${clan.members[i].rate}🔥`);
        }

        members = chunks(members, 20);

        if (msg.type == "payload") {
            listn = msg.params.n;
        } else if (msg.match[1]) {
            listn = parseInt(msg.match[1]) - 1;
        } else {
            listn = 0;
        }

        if (members[1]) {
            postfix = '\n❔ Используйте кнопки снизу, чтобы пролистывать список участников'
            if (listn == 0) {
                params = {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: '▶',
                            payload: {
                                command: 'clan_members',
                                params: {
                                    n: 1
                                }
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]).inline()
                };
            } else if (listn != members.length - 1) {
                params = {
                    keyboard: Keyboard.keyboard([[
                        Keyboard.textButton({
                            label: '◀',
                            payload: {
                                command: 'clan_members',
                                params: {
                                    n: listn - 1
                                }
                            },
                            color: Keyboard.PRIMARY_COLOR
                        }),
                        Keyboard.textButton({
                            label: '▶',
                            payload: {
                                command: 'clan_members',
                                params: {
                                    n: listn + 1
                                }
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]]).inline()
                };
            } else {
                params = {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: '◀',
                            payload: {
                                command: 'clan_members',
                                params: {
                                    n: listn - 1
                                }
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]).inline()
                };
            }
        }

        msg.send(`🛡 Список участников клана "${clan.name}":
${members[listn].join("\n")}
${postfix}`, params);
    }
},
{

    r: /^к+л+а+н+ создать( (.*))?/i,
    scene: 'clan_create',
    async f(msg, user) {
        if (user.clan) return msg.send("🚫 У вас есть клан");
        if (user.money < 1000000) return msg.send("🚫 Не хватает денег\n💸 Стоимость: 1,000,000$\n💰 У вас на руках: " + numberWithCommas(user.money) + "$");
        let name;
        if (msg.type == "scene") {
            if (!msg.hasText) return msg.send("🚫 Вы не ввели название\n✏ Для отмены, введите \"Отмена\"");
            if ((/^отмена/i).test(msg.text)) {
                msg.send("🚫 Отменено");
                return user.scene = null;
            }
            name = msg.text;
            user.scene = null;
        } else {
            if (!msg.match[2]) return msg.send("🚫 Вы не ввели название\n✏ Клан создать [название]");
            name = msg.match[2];
        }
        name = antiBan(name).replace(/(\[|\]|\@|\(|\)|\*)/g, "");
        if (name.length > 16) return msg.send(`🚫 Не длиннее чем 16 символов`);
        if (name.length < 1) return msg.send(`🚫 Невалидное название`);

        let params = {}, str = await registerClan(msg.senderId, name);

        if (user.menu && msg.isFromUser) params = { keyboard: sections.clan(msg.senderId, clans[user.clan]) };

        msg.send(str, params);
    }
},
{
    payload: "clan_create",

    f(msg, user) {
        if (user.clan) return msg.send("🚫 У вас есть клан. Сперва покиньте", {
            keyboard: Keyboard.keyboard([
                Keyboard.textButton({
                    label: "⛔ Покинуть",
                    payload: {
                        command: "clan_leave"
                    },
                    color: Keyboard.NEGATIVE_COLOR
                })
            ]).inline()
        });
        if (user.money < 1000000) return msg.send("🚫 Не хватает денег\n💸 Стоимость: 1,000,000$\n💰 У вас на руках: " + numberWithCommas(user.money) + "$");
        user.scene = "clan_create";
        msg.send('✏ Введите название для будущего клана\n🚫 Для отмены, введите "Отмена"');
    }
},
{

    r: /^к+л+а+н+ п+р+и+г+л+а+с+и+т+ь+( ([^\s]+))?/i,
    async f(msg, user) {
        if (!user.clan) return msg.send("🚫 У вас нет клана");
        if (!msg.match[1] && !msg.hasReplyMessage) return msg.send(`🚫 Клан пригласить [ID/Ссылка]`);

        let id = msg.hasReplyMessage ? msg.replyMessage.senderId : await vkId(msg.match[2]), clan = clans[user.clan];
        await vkFromDb(id);
        if (!users[id]) return msg.send(`🚫 Игрок не найден`);

        if (users[id].clan) return msg.send(`🚫 Игрок уже состоит в клане`);

        let clanid = user.clan + "";

        if (users[id].other[clanid] != null) return msg.send("🚫 Игрока уже приглашали в этот клан");

        users[id].other[clanid] = {
            author: msg.senderId
        }
        msg.send(`🛡 @id${id} (${users[id].nick}) приглашен в клан "${clan.name}"`);
        logClan(clanid, { type: "invite", params: { by: msg.senderId, to: id } });
        vkGroup.api.messages.send({
            user_id: id,
            message: `🛡 @id${msg.senderId} (${user.nick}) пригласил вас в клан "${clan.name}"`,
            keyboard: Keyboard.keyboard([
                Keyboard.textButton({
                    label: '📲 Принять',
                    payload: {
                        command: 'clan_accept',
                        params: {
                            id: clanid
                        }
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            ]).inline(),
            random_id: getRandomId()
        }).catch(() => { });
    }
},
{

    r: /^к+л+а+н+ п+р+и+н+я+т+ь+( [0-9]+)?/i,
    payload: "clan_accept",
    async f(msg, user) {
        if (user.clan) return msg.send("🚫 У вас уже есть клан\n✏ Покиньте клан, написав: \"Клан покинуть\"");

        let clanid;
        if (msg.type == "payload") {
            clanid = msg.params.id;
        } else if (msg.match[1]) {
            clanid = parseInt(msg.match[1]);
        } else {
            return msg.send("🚫 Вы не ввели айди клана\n✏ Клан принять [ID]");
        }

        if (user.other[clanid] == null) return msg.send("🚫 Вас не приглашали в этот клан");

        let clan = clans[clanid];

        await clanFromDb(clanid);
        await vkFromDb(user.other[clanid].author);

        if (clan.name == "deleted") return msg.send("🚫 Этот клан уже удален");
        if (Object.keys(clan.members).length >= 100) return msg.send("🚫 Клан переполнен");

        logClan(clanid, { type: "accept_invite", params: { id: msg.senderId, by: user.other[clanid].author } });

        vkGroup.api.messages.send({
            user_ids: Object.keys(clan.members).join(","),
            message: `🛡 @id${msg.senderId} (${user.nick}) вступил в клан
✉ Пригласил: @id${user.other[clanid].author} (${users[user.other[clanid].author].nick})`,
            random_id: getRandomId()
        });
        msg.send("🛡 Приглашение принято");

        user.other = {};
        user.clan = clanid;
        clan.members[msg.senderId] = {
            rank: "участник",
            rate: 0,
            rateweek: 0,
            joindate: +new Date()
        }
    }
},
{

    payload: "clan_invites",
    r: /^клан приглашения(?: (.*))?$/i,
    async f(msg, user) {
        if (msg.type == "cmd" && msg.match[1] == "отключить") {
            if (user.status.type == 0) return msg.send("💻 Данная команда доступна только с V.I.P. и выше", {
                attachment: "market-151782797_1753856"
            });
            if (user.clan_dis_invite) {
                msg.send("⛔ Вас и так, не могут приглашать в кланы");
            } else {
                user.clan_dis_invite = true;
                msg.send("⛔ Теперь никто не сможет пригласить вас в клан");
            }
        } else if (msg.type == "cmd" && msg.match[1] == "включить") {
            if (user.status.type == 0) return msg.send("💻 Данная команда доступна только с V.I.P. и выше", {
                attachment: "market-151782797_1753856"
            });
            if (user.clan_dis_invite) {
                delete user.clan_dis_invite;
                msg.send("✅ Теперь вас могут пригласить в клан");
            } else {
                msg.send("✅ Вас и так, могут приглашать в кланы");
            }
        } else {
            let invites = [];
            for (let i in user.other) {
                await clanFromDb(i);
                if (clans[i].name != "deleted") {
                    await vkFromDb(user.other[i].author);
                    invites.push(`${numberToSmile(i)} ${clans[i].name} - @id${user.other[i].author} (${users[user.other[i].author].nick})`);
                }
            }
            if (invites.length == 0) return msg.send(msg.prefix + "вас пока никто не приглашал в клан ");
            msg.send(msg.prefix + "приглашения:\n" + invites.join("\n") + '\n\n❔ Чтобы принять, введите "Клан принять [номер]"', {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "🧹 Очистить",
                        payload: {
                            command: "clan_clear"
                        },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                ]).inline()
            });
        }
    }
},
{
    payload: "clan_clear",

    f(msg, user) {
        user.other = {};
        msg.send(msg.prefix + "все приглашения отклонены");
    }
},
{
    r: /^клан переименовать( (.*))?/i,
    scene: "clan_rename",

    f(msg, user) {
        if (!user.clan) return msg.send("🚫 У вас нет клана");

        let clan = clans[user.clan],
            text,
            buffclan = { ...clan };

        if (clan.members[msg.senderId].rank == "участник") return msg.send("🚫 Могут переименовать только руководители клана");
        if (msg.type == "scene") {
            if (!msg.hasText) return msg.send("🚫 Вы не ввели название\n✏ Для отмены, введите \"Отмена\"");
            if ((/^отмена/i).test(msg.text)) {
                msg.send("🚫 Отменено");
                return user.scene = null;
            }
            text = msg.text;
            user.scene = null;
        } else {
            if (!msg.match[2]) return msg.send("🚫 Вы не ввели название\n✏ Клан переименовать [название]");
            text = msg.match[2];
        }

        text = antiBan(text, "").replace(/(\[|\]|\@|\(|\)|\*)/g, "");
        if (!text.length) return msg.send("🚫 Укажите валидное название");
        if (text.length > 16) return msg.send("🚫 Не длиннее чем 16 символов");
        clan.name = text;

        msg.send("🛡 Клан переименован в \"" + clan.name + "\"");
        logClan(user.clan, { type: "rename", params: { id: msg.senderId, new_name: clan.name, old_name: buffclan.name } });
        vkGroup.api.messages.send({
            user_ids: Object.keys(clan.members).join(","),
            message: `🛡 @id${msg.senderId} (${user.nick}) переименовал клан
✏ Новое название: ${clan.name}`,
            random_id: getRandomId()
        });
    }
},
{
    payload: "clan_rename",

    f(msg, user) {
        if (!user.clan) return msg.send("🚫 У вас нет клана");
        user.scene = "clan_rename";
        msg.send('✏ Введите новое название\n🚫 Для отмены, введите "Отмена"');
    }
},
{
    r: /^клан повысить( ([^\s]+))?/i,
    payload: "clan_rank_up",

    async f(msg, user) {
        if (!user.clan) return msg.send("🚫 У вас нет клана");
        if (clans[user.clan].members[msg.senderId].rank != "основатель") return msg.send("🚫 Только основатель может повышать");

        let bufid;
        if (msg.type == "payload") {
            bufid = msg.params.id;
        } else {
            if (!msg.match[2]) return msg.send("🚫 Вы не указали, кого повышать\n✏ Клан повысить [ID/ссылка]");
            bufid = msg.match[2];
        }

        let clan = clans[user.clan], id = await vkId(bufid);
        await vkFromDb(id);
        if (!users[id]) return msg.send("🚫 Вы не указали, кого повысить или данный игрок не зарегистрирован\n✏ Клан повысить [ID/ссылка]");
        if (!clan.members[id]) return msg.send("🚫 Данный игрок не состоит в вашем клане");
        if (clan.members[id].rank == "основатель") return msg.send("🚫 Вы не можете повысить себя");

        if (clan.members[id].rank == "руководитель") {
            msg.send(`❗ Вы передаете главу клана игроку @id${id} (${users[id].nick}), подтвердите кнопкой снизу\n❗ Данное действие не отменить`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '❗ ПОДТВЕРЖДАЮ',
                        payload: {
                            command: 'clan_give_owner',
                            params: {
                                id: id
                            },
                            toId: msg.senderId
                        },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                ]).inline()
            });
        } else {
            clan.members[id].rank = "руководитель";
            logClan(user.clan, { type: "clan_member_change_rank", params: { by: msg.senderId, to: id, new_rank: "руководитель" } });
            msg.send(`🛡 Вы повысили @id${id} (${users[id].nick})`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '❗ Отменить',
                        payload: {
                            command: 'clan_rank_down',
                            params: {
                                id: id
                            },
                            toId: msg.senderId
                        },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                ]).inline()
            });
        }
    }
},
{
    r: /^клан понизить( ([^\s]+))?/i,
    payload: "clan_rank_down",

    async f(msg, user) {
        if (!user.clan) return msg.send("🚫 У вас нет клана");
        if (clans[user.clan].members[msg.senderId].rank != "основатель") return msg.send("🚫 Только основатель может понижать");

        let bufid;
        if (msg.type == "payload") {
            bufid = msg.params.id;
        } else {
            if (!msg.match[2]) return msg.send("🚫 Вы не указали, кого понизить\n✏ Клан понизить [ID/ссылка]");
            bufid = msg.match[2];
        }

        let clan = clans[user.clan], id = await vkId(bufid);
        await vkFromDb(id);
        if (!users[id]) return msg.send("🚫 Вы не указали, кого понизить или данный игрок не зарегистрирован\n✏ Клан понизить [ID/ссылка]");
        if (!clan.members[id]) return msg.send("🚫 Данный игрок не состоит в вашем клане");
        if (id == msg.senderId) return msg.send("🚫 Вы не можете себя понизить");

        if (clan.members[id].rank == "участник") {
            msg.send(`❗ Участник @id${id} (${users[id].nick}) имеет минимальный статус`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '🧹 Выгнать',
                        payload: {
                            command: 'clan_kick',
                            params: {
                                id: id
                            },
                            toId: msg.senderId
                        },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                ]).inline()
            });
        } else if (clan.members[id].rank == "основатель") {
            msg.send(`❗ Главу клана нельзя понизить`);
        } else {
            clan.members[id].rank = "участник";
            logClan(user.clan, { type: "clan_member_change_rank", params: { by: msg.senderId, to: id, new_rank: "участник" } });
            msg.send(`🛡 Вы понизили @id${id} (${users[id].nick})`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '❗ Отменить',
                        payload: {
                            command: 'clan_rank_up',
                            params: {
                                id: id
                            },
                            toId: msg.senderId
                        },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                ]).inline()
            });
        }
    }
},
{
    r: /^клан выгнать( ([^\s]+))?/i,
    payload: "clan_kick",

    async f(msg, user) {
        if (!user.clan) return msg.send("🚫 У вас нет клана");
        if (clans[user.clan].members[msg.senderId].rank == "участник") return msg.send("🚫 Только руководители могут исключать");

        let bufid;
        if (msg.type == "payload") {
            bufid = msg.params.id;
        } else {
            if (!msg.match[2]) return msg.send("🚫 Вы не указали, кого выгнать\n✏ Клан выгнать [ID/ссылка]");
            bufid = msg.match[2];
        }

        let clan = clans[user.clan], id = await vkId(bufid);
        await vkFromDb(id);
        if (!users[id]) return msg.send("🚫 Вы не указали, кого выгнать или данный игрок не зарегистрирован\n✏ Клан выгнать [ID/ссылка]");
        if (!clan.members[id]) return msg.send("🚫 Данный игрок не состоит в вашем клане");
        if (id == msg.senderId) return msg.send("🚫 Вы не можете себя выгнать");
        if (clan.members[id].rank != "участник") return msg.send("🚫 Вы не можете выгнать руководителя/главу");

        logClan(user.clan, { type: "clan_kick", params: { by: msg.senderId, to: id } });
        delete users[id].clan;
        delete clan.members[id];
        msg.send(`🛡 Вы выгнали @id${id} (${users[id].nick}) с клана`);
        vkGroup.api.messages.send({
            user_ids: Object.keys(clan.members).join(","),
            message: `🛡 @id${msg.senderId} (${user.nick}) выгнал с клана участника @id${id} (${users[id].nick})`,
            random_id: getRandomId()
        });
    }
},
{
    payload: "clan_give_owner",

    async f(msg, user) {
        if (!user.clan) return;
        if (clans[user.clan].members[msg.senderId].rank != "основатель") return;

        let id = msg.params.id, clan = clans[user.clan];
        if (!clan.members[id]) return;

        await vkFromDb(id);

        logClan(user.clan, { type: "clan_member_change_rank", params: { by: msg.senderId, to: id, new_rank: "глава" } });
        logClan(user.clan, { type: "clan_member_change_rank", params: { by: msg.senderId, to: msg.senderId, new_rank: "руководитель" } });
        msg.send(`🛡 @id${id} (${users[id].nick}) теперь глава клана\n✉ Вы остались руководителем клана`);
        vkGroup.api.messages.send({
            user_ids: Object.keys(clan.members).join(","),
            message: `🛡 @id${msg.senderId} (${user.nick}) назначил главой клана @id${id} (${users[id].nick})
✉ @id${msg.senderId} (${user.nick}) остался руководителем`,
            random_id: getRandomId()
        });
        clan.members[msg.senderId].rank = "руководитель";
        clan.members[id].rank = "основатель";
        clan.creator = id;
        clan.ownergived = true;
    }
},
{
    r: /^клан (покинуть|выйти)$/i,
    payload: "clan_leave",

    async f(msg, user) {
        if (!user.clan) return msg.send("🚫 У вас нет клана");

        if (msg.type == "payload") {
            if (!msg.params.accept) return msg.send(`❗ Нажмите еще раз кнопку, чтобы подтвердить`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '❗ Покинуть',
                        payload: {
                            command: 'clan_leave',
                            params: {
                                accept: true
                            },
                            toId: msg.senderId
                        },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                ]).inline()
            });
        }

        let clan = clans[user.clan];

        if (clan.members[msg.senderId].rank == "основатель") {
            msg.send(`❗ Покинув клан, вы удалите этот клан. Вы уверены?`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '❗ Покинуть',
                        payload: {
                            command: 'clan_delete',
                            params: {
                                step: 0
                            },
                            toId: msg.senderId
                        },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                ]).inline()
            });
        } else {
            logClan(user.clan, { type: "clan_kick", params: { by: msg.senderId, to: msg.senderId } });
            msg.send(`🛡 Вы покинули клан "${clan.name}"`);
            vkGroup.api.messages.send({
                user_ids: Object.keys(clan.members).join(","),
                message: `🛡 ${firstLetterToUpper(clan.members[msg.senderId].rank)} @id${msg.senderId} (${user.nick}) покинул клан`,
                random_id: getRandomId()
            });

            delete clan.members[msg.senderId];
            delete user.clan;
        }
    }
},
{
    payload: "clan_delete",

    async f(msg, user) {
        if (!user.clan) return;
        if (clans[user.clan].members[msg.senderId].rank != "основатель") return;

        if (msg.params.step == 0) {
            msg.send(`❗ Данное действие не отменить. Вы уверены?`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '❗ Подтверждаю',
                        payload: {
                            command: 'clan_delete',
                            params: {
                                step: 1
                            },
                            toId: msg.senderId
                        },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                ]).inline()
            });
        } else {
            let clan = clans[user.clan];
            await vkGroup.api.messages.send({
                user_ids: Object.keys(clan.members).join(","),
                message: "❗ [id" + msg.senderId + "|" + user.nick + "] закрыл(а) клан ",
                random_id: getRandomId()
            });
            logClan(user.clan, { type: "clan_remove", params: { by: msg.senderId } });
            for (let i in clan.members) {
                await vkFromDb(i);
                users[i].clan = null;
            }
            clan.name = "deleted";
            clan.members = {};
            clan.creator = 1;
            user.clan = null;

            if (msg.isFromUser && user.menu) {
                msg.send("✅ Клан был удален", {
                    keyboard: sections.main_menu()
                });
            } else {
                msg.send("✅ Клан был удален");
            }
        }
    }
},
{
    r: /^клан участник( ([^\s]+))?$/i,

    async f(msg, user) {
        if (!user.clan) return msg.send("🚫 У вас нет клана");
        if (!msg.match[2]) return msg.send("🚫 Вы не указали игрока\n✏ Клан участник [ID/ссылка]");

        let id = await vkId(msg.match[2]),
            clan = clans[user.clan],
            params = {};
        await vkFromDb(id);

        if (!users[id]) return msg.send("🚫 Вы не указали игрока или данный игрок не зарегистрирован\n✏ Клан участник [ID/ссылка]");
        if (!clan.members[id]) return msg.send("🚫 Данный игрок не состоит в вашем клане");

        if (clan.members[msg.senderId].rank != "участник") {
            params = {
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: '🔼 Повысить',
                            payload: {
                                command: 'clan_rank_up',
                                params: {
                                    id: id
                                },
                                toId: msg.senderId
                            },
                            color: Keyboard.POSITIVE_COLOR
                        }),
                        Keyboard.textButton({
                            label: '🔽 Понизить',
                            payload: {
                                command: 'clan_rank_down',
                                params: {
                                    id: id
                                },
                                toId: msg.senderId
                            },
                            color: Keyboard.NEGATIVE_COLOR
                        })
                    ],
                    [
                        Keyboard.textButton({
                            label: '🧹 Исключить',
                            payload: {
                                command: 'clan_kick',
                                params: {
                                    id: id
                                },
                                toId: msg.senderId
                            },
                            color: Keyboard.NEGATIVE_COLOR
                        })
                    ]
                ]).inline()
            }
        }

        msg.send(`🛡 ${firstLetterToUpper(clan.members[id].rank)} @id${id} (${users[id].nick})
🔥 Набитый рейтинг за все время: ${clan.members[id].rate}
📅 Вступил в клан: ${clan.members[id].joindate ? dateFormat(new Date(clan.members[id].joindate)) : "Неизвестно"}`, params); //🔥 Набитый рейтинг за эту неделю: ${clan.members[id].rateweek}
    }
},
{
    r: /^клан (?:пэйклан|зарплата)( ([^\s]+))?/i,
    scene: "clan_payclan",
    payload: "clan_payclan",

    async f(msg, user) {
        if (!user.clan) return msg.send("🚫 У вас нет клана");
        if (clans[user.clan].members[msg.senderId].rank == "участник") return msg.send("🚫 Только руководитель клана может использовать эту команду");

        let money,
            clan = clans[user.clan];;

        if (msg.type == "payload") {
            user.scene = "clan_payclan";
            return msg.send("✏ Введите количество денег для выдачи зарплаты\n💰 Казна: " + numberWithCommas(clan.bank) + "$\n🚫 Для отмены, введите \"Отмена\"");
        } else if (msg.type == "scene") {
            if ((/^отмена/i).test(msg.text)) {
                msg.send("🚫 Отменено");
                return user.scene = null;
            }
            money = msg.text;
        } else {
            if (!msg.match[1]) return msg.send("🚫 Вы не указали количество денег\n✏ Клан пэйклан [сумма]");
            money = msg.match[2];
        }

        money = parseInt(money.replace(/все|всё/, clan.bank).replace(/(k|к)/gi, "000"));
        if (isNaN(money)) return msg.send("🚫 Вы неправильно указали количество денег\n💰 Казна: " + numberWithCommas(clan.bank) + "$\n✏ Клан пэйклан [сумма]");

        if (clan.bank < money) return msg.send("🚫 В казне не хватает денег, укажите число меньше\n💰 Казна: " + numberWithCommas(clan.bank) + "$\n✏ Клан пэйклан [сумма]");
        if (money < 1000) return msg.send("🚫 Не меньше чем 1000$");

        let money_per_user = Math.floor(money / Object.keys(clan.members).length);
        for (let i in clan.members) {
            await vkFromDb(i);
            users[i].money += money_per_user;
            log(msg.senderId, `Получил зп клана ${money_per_user}$`);
        }
        clan.bank -= money;

        logClan(user.clan, { type: "clan_pay", params: { by: msg.senderId, money: money, per_money: money_per_user, count_users: Object.keys(clan.members).length } });
        msg.send(`🛡 Вы выдали зарплату клану ${numberWithCommas(money)}$
💰 Каждому участнику выдано ${numberWithCommas(money_per_user)}$`);
        vkGroup.api.messages.send({
            user_ids: Object.keys(clan.members).join(","),
            message: `🛡 ${firstLetterToUpper(clan.members[msg.senderId].rank)} @id${msg.senderId} (${user.nick})
💰 Каждому участнику выдано ${numberWithCommas(money_per_user)}$`,
            random_id: getRandomId()
        });
    }
},
{
    r: /^клан пополнить( ([^\s]+))?/i,

    f(msg, user) {
        if (!user.clan) return msg.send("🚫 Вы не состоите в клане");
        if (user.banpay) return msg.send("🚫 Вам заблокированы переводы денег");
        if (((+new Date() - (+new Date(clans[user.clan].reg_date))) / 1000) < 604800) return msg.send("🚫 Клану должно быть больше недели");
        if (Object.keys(clans[user.clan].members).length < 10) return msg.send("🚫 В клане должно быть более 10 участников");

        if (user.status.type < 3 && user.limitpay == null) {
            if (user.status.type == 0 && user.limit == 3) {
                if ((+new Date() - user.limtime) / 1000 < 21600) return msg.send(`🚫 Не больше чем 3 перевода в 6 часов
🕒 Ждать еще: ${fancyTimeFormat(Math.floor(21600 - (+new Date() - user.limtime) / 1000))}`);;
                user.limit = 0;
            } else if (user.status.type == 1 && user.limit == 6) {
                if ((+new Date() - user.limtime) / 1000 < 21600) return msg.send(`🚫 Не больше чем 6 переводов в 6 часов
🕒 Ждать еще: ${fancyTimeFormat(Math.floor(21600 - (+new Date() - user.limtime) / 1000))}`);;
                user.limit = 0;
            } else if (user.status.type == 2 && user.limit == 10) {
                if ((+new Date() - user.limtime) / 1000 < 21600) return msg.send(`🚫 Не больше чем 10 переводов в 6 часов
🕒 Ждать еще: ${fancyTimeFormat(Math.floor(21600 - (+new Date() - user.limtime) / 1000))}`);;
                user.limit = 0;
            }
        }

        if (!msg.match[2]) return msg.send("🚫 Вы не указали сумму\n✏ Клан пополнить [сумма]");
        let money = parseInt(msg.match[2].replace(/все|всё/, user.money).replace(/(k|к)/gi, "000"));

        if (isNaN(money)) return msg.send("🚫 Вы не указали правильно сумму\n✏ Клан пополнить [сумма]");
        if (money < 1) return msg.send("🚫 Укажите правильную сумму\n✏ Клан пополнить [сумма]");
        if (money > user.money) return msg.send("🚫 У вас нет столько денег\n💰 На руках: " + numberWithCommas(user.money) + "$");
        if (money > 10000000000 && user.status.type < 100) return msg.send(prefix + "не больше 10млрд за раз");

        log(msg.senderId, `Пополнил казну клана "${clans[user.clan]}" [${user.clan}] на ${numberWithCommas(money)}$ | Баланс: ${numberWithCommas(user.money + money)}$`)
        logClan(user.clan, { type: "pay_to_clan", params: { from_id: msg.senderId, money: money, bmoney: clans[user.clan].bank, amoney: clans[user.clan].bank + money } });

        user.money -= money;
        clans[user.clan].bank += money;

        user.limit++;
        user.limtime = +new Date();

        msg.send(`${msg.prefix}вы пополнили казну клана на ${numberWithCommas(money)}$
💰 На руках: ${numberWithCommas(user.money)}$`);
        vkGroup.api.messages.send({
            user_ids: Object.keys(clans[user.clan].members).join(","),
            message: `🛡 @id${msg.senderId} (${user.nick}) пополнил казну на ${numberWithCommas(money)}$
💰 Казна: ${numberWithCommas(clans[user.clan].bank)}$`,
            random_id: getRandomId()
        });
    }
},
{
    r: /^клан бизнес( [0-9]+)?/i,
    payload: "clan_biss",

    async f(msg, user) {
        if (!user.clan) return msg.send("🚫 Вы не состоите в клане");
        if (msg.type == "payload" || !msg.match[1]) return msg.send(`🛡️ Доступный бизнес:
1⃣. Завод автомобилей
⠀💰 Стоимость: ${numberWithCommas(clan_bis[1].price)}$
⠀💸 Приносит в час: ${numberWithCommas(clan_bis[1].per_hour)}$

2⃣. Завод Foxconn
⠀💰 Стоимость: ${numberWithCommas(clan_bis[2].price)}$
⠀💸 Приносит в час: ${numberWithCommas(clan_bis[2].per_hour)}$

3⃣. Кумысный завод
⠀💰 Стоимость: ${numberWithCommas(clan_bis[3].price)}$
⠀💸 Приносит в час: ${numberWithCommas(clan_bis[3].per_hour)}$

💬 Для покупки, введите: Клан бизнес [номер]`);

        let n = parseInt(msg.match[1]),
            id = user.clan;
        if (clan_bis[n]) {
            if (clans[id].bank < clan_bis[n].price) return msg.send(msg.prefix + "не хватает денег в казне клана\n💰 В казне: " + numberWithCommas(clans[id].bank) + "$");
            if (clans[id].boost == null) clans[id].boost = {
                biz: [],
                lastCheck: +new Date()
            };
            if (clans[id].boost.biz.indexOf(parseInt(n)) != -1) return msg.send(msg.prefix + "данный бизнес уже есть у клана");
            clans[id].bank -= clan_bis[n].price;
            clans[id].boost.biz.push(parseInt(n));
            msg.send(msg.prefix + "вы приобрели клану: " + clan_bis[n].emoji + " " + clan_bis[n].name);
            vkGroup.api.messages.send({
                user_ids: Object.keys(clans[user.clan].members).join(","),
                message: `🛡 @id${msg.senderId} (${user.nick}) купил клану ${clan_bis[n].emoji + " " + clan_bis[n].name}
💰 Казна: ${numberWithCommas(clans[user.clan].bank)}$`,
                random_id: getRandomId()
            });
        }
    }
},
{
    r: /^клан возможности( [0-9]+)?/i,
    payload: "clan_boost",

    async f(msg, user) {
        if (!user.clan) return msg.send("🚫 Вы не состоите в клане");
        if (msg.type == "payload" || !msg.match[1]) return msg.send(`🛡️ Доступные возможности:
⠀1. 🔥 Двойной рейтинг - 10 очков
⠀2. 🔫 Сокращение перезарядки на 2 - 5 очков
⠀3. 🔫 Бесконечные патроны - 10 очков
⠀4. 📈 Умножение прибыли бизнесов клана на 1.5 - 10 очков
⠀5. ❤ 200 HP в перестрелках - 10 очков
⠀6. 💀 Возрождение сокращено на 2 - 5 очков

💬 Для покупки, введите: Клан возможности [номер]`, {
            keyboard: Keyboard.keyboard([
                Keyboard.textButton({
                    label: '❔ Что такое очки клана?',
                    payload: {
                        command: 'guide_clan_boost'
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
            ]).inline()
        });

        let n = parseInt(msg.match[1]),
            id = user.clan;
        if (clan_boost[n]) {
            if (clans[id].points < clan_boost[n].price) return msg.send(msg.prefix + "не хватает очков клана\n🎲 Очков: " + numberWithCommas(clans[id].points));
            if (clans[id].bpc == null) clans[id].bpc = [];
            if (clans[id].bpc.indexOf(parseInt(n)) != -1) return msg.send(msg.prefix + "данная способность уже есть у клана");
            clans[id].points -= clan_boost[n].price;
            clans[id].bpc.push(parseInt(n));
            msg.send(msg.prefix + "клан успешно приобрел способность: " + clan_boost[n].emoji + " " + clan_boost[n].name);
            vkGroup.api.messages.send({
                user_ids: Object.keys(clans[user.clan].members).join(","),
                message: `🛡 @id${msg.senderId} (${user.nick}) купил клану способность: "${clan_boost[n].emoji + " " + clan_boost[n].name}"
💰 Очков клана: ${numberWithCommas(clans[user.clan].points)}`,
                random_id: getRandomId()
            });
        }
    }
}];