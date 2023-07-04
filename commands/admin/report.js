const { getRandomId } = require("vk-io");
const { sendPush } = require("../../api/sendPush");
const { db, vkGroup, Keyboard, users } = require("../../main"),
    { timeFormat, antiBan, randElement } = require("../../api/utils"),
    { getAdmins, getRepAdmins } = require("../../api/admin_utils"),
    { vkFromDb, vkId } = require("../../api/acc");

async function answerRep(msg, id) {

    let [report] = await db.collection("reports").find({ id: id }).toArray();

    msg.text = msg.text.replace(/\*амнистия\*/gi, "https://vk.cc/azDbWE").replace(/\*лимитка\*/i, "https://vk.cc/azDdis")

    await vkFromDb(report.vk);

    let attachments = [];
    if (msg.hasAttachments) {
        for (let el of msg.attachments) {
            if (el.type == "photo") {
                let photo = await vkGroup.upload.messagePhoto({
                    source: {
                        value: el.largeSizeUrl
                    },
                    peer_id: report.msg.peer_id
                });
                attachments.push(photo);
            } else {
                attachments.push(`${el.type}${el.ownerId}_${el.id}_${el.accessKey}`);
            }
        }
    }

    vkGroup.api.messages.send({
        user_ids: await getRepAdmins(),
        message: `📤 @id${msg.senderId} (${users[msg.senderId].nick}) ответил на @id${report.vk} (репорт) #${id}: ${msg.text ? msg.text : ""}`,
        random_id: getRandomId(),
        forward: JSON.stringify({
            peer_id: report.msg.peerId,
            conversation_message_ids: report.msg.id
        })
    });

    await vkGroup.api.messages.send({
        peer_ids: (2e9 < report.msg.peerId ? (report.msg.peerId + "," + report.vk) : report.msg.peerId),
        message: `📢 На вашу жалобу пришел ответ
✉ Ответ: ${msg.text ? msg.text : ""}`,
        keyboard: Keyboard.keyboard([[
            Keyboard.textButton({
                label: '👍🏻',
                payload: {
                    command: 'user_report_respond',
                    params: {
                        id: id,
                        positive: true
                    },
                    toId: report.vk
                },
                color: Keyboard.POSITIVE_COLOR
            }),
            Keyboard.textButton({
                label: '👎🏻',
                payload: {
                    command: 'user_report_respond',
                    params: {
                        id: id,
                        positive: false
                    },
                    toId: report.vk
                },
                color: Keyboard.NEGATIVE_COLOR
            })
        ]]).inline(),
        attachment: attachments,
        random_id: getRandomId(),
        forward: JSON.stringify({
            peer_id: report.msg.peerId,
            conversation_message_ids: report.msg.id
        })
    });
}

module.exports = [
    {
        payload: "report",

        async f(msg, user) {
            user.scene = "report";
            msg.send(`✏ Введите следующим сообщением вопрос администраторам`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "◀ В меню",
                        payload: {
                            command: "menu",
                            params: "main_menu"
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ])
            });
        }
    },
    {
        r: /^([Жж]алоба|report|[Рр]епорт|[Рр]еп)( ([\s\S]+))?$/i,
        scene: "report",

        /**
         * 
         * @param {import("vk-io").MessageContext} msg 
         */
        async f(msg, user) {

            if (msg.type == "scene" && !msg.hasText) return msg.send("🚫 Вы не указали свою жалобу\n✏ Введите следующим текстом жалобу");
            if (msg.type == "cmd" && !msg.match[2]) return msg.send("🚫 Вы не указали свою жалобу\n✏ Жалоба [текст]");

            if (user.banrep) {
                if (user.banrep["time"]) {
                    if (user.banrep["time"] > +new Date()) return msg.send(`${msg.prefix}Вам запрещено писать в репорт
🕒 Подождите ${timeFormat(user.banrep["time"])}`);
                    delete user.banrep;
                } else {
                    return msg.send(`${msg.prefix}Вам запрещено писать в репорт`);
                }
            }

            if (user.timeOfReport && user.timeOfReport + 30000 > +new Date()) return msg.send("🚫 Подождите 30 секунд перед отправкой новой жалобы");
            user.timeOfReport = +new Date();

            let { id } = await db.collection('reports').findOne({}, { sort: { id: -1 }, projection: { id: 1 } }),
                admins = await getRepAdmins(),
                adminsVK = await vkGroup.api.users.get({ user_ids: admins.join(","), fields: "online" });

            if (id == null) id = 0;
            id++;
            adminsVK = adminsVK.filter(admin => admin.online).length;

            msg.send(`${msg.prefix}ваш вопрос отправлен агентам.\n📱 Агентов в сети: ${adminsVK}\n⏳ Ожидайте ответа`);

            await db.collection("reports").insertOne({
                id: id,
                vk: user.vk,
                msg: {
                    peerId: msg.peerId,
                    id: msg.conversationMessageId
                },
                admin: -1,
                closed: false,
                liked: null
            });

            let chat;

            if (msg.isChat) {
                let { items } = await vkGroup.api.messages.getConversationsById({ peer_ids: msg.peerId });
                [chat] = items;
            }

            vkGroup.api.messages.send({
                peer_ids: admins.join(","),
                message: `${msg.isChat ? `[БЕСЕДА${chat?.chat_settings.title ? ` "${chat?.chat_settings.title}" ` : " "}#chat${msg.chatId}]` : `[ЛС]`}
🔎 Номер жалобы: ${id}
🆔 [id${msg.senderId}|${user.nick}]: ${msg.senderId} #report${msg.senderId}
🆔 Айди игрока: ${user.fake_id}`,
                forward: JSON.stringify({
                    peer_id: msg.peerId,
                    conversation_message_ids: msg.conversationMessageId
                }),
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: '✏ Ответить',
                            payload: {
                                command: 'adm_report_respond',
                                params: id
                            },
                            color: Keyboard.POSITIVE_COLOR
                        })
                    ],
                    [
                        Keyboard.textButton({
                            label: '🚫 Закрыть',
                            payload: {
                                command: 'adm_report_close',
                                params: id
                            },
                            color: Keyboard.NEGATIVE_COLOR
                        }),
                        Keyboard.textButton({
                            label: '❌ Забанить',
                            payload: {
                                command: 'adm_report_ban',
                                params: id
                            },
                            color: Keyboard.NEGATIVE_COLOR
                        })
                    ]
                ]).inline(),
                random_id: getRandomId()
            });
        }
    },
    {
        payload: "adm_report_respond",

        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canRep) return;

            let [report] = await db.collection("reports").find({ id: msg.params }).toArray();
            if (!report) return msg.send(`🚫 Данного репорта не существует`);
            if (report.closed) return msg.send(`🚫 Данный репорт уже закрыт`);
            if (report.admin != -1 && report.admin != msg.senderId) {
                await vkFromDb(report.admin);
                return msg.send(`🚫 Этот репорт уже взял @id${report.admin} (${users[report.admin].nick})`);
            }
            await db.collection("reports").updateOne({ id: msg.params }, {
                $set: {
                    admin: msg.senderId,
                    closed: true
                }
            });
            user.scene = "adm_report_respond";
            user.scenerep = msg.params;
            msg.send("✏ Введи ответ следующим сообщением\n🚫 Для отмены, введи \"Отмена\"");

            vkGroup.api.messages.send({
                user_ids: await getRepAdmins(),
                message: `⚠ @id${msg.senderId} (${users[msg.senderId].nick}) взял @id${report.vk} (репорт) #${msg.params}`,
                random_id: getRandomId(),
                forward: JSON.stringify({
                    peer_id: report.msg.peerId,
                    conversation_message_ids: report.msg.id
                })
            });
        }
    },
    {
        scene: "adm_report_respond",

        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canRep) return;

            if (msg.hasText && msg.text.toLowerCase() == "отмена") {
                await db.collection("reports").updateOne({ id: user.scenerep }, {
                    $set: {
                        admin: -1,
                        closed: false
                    }
                });
                delete user.scene;
                delete user.scenerep;
                return msg.send("🚫 Отменено");
            }
            msg.send("✅ Ответ отправлен");
            user.cookie += 500;
            answerRep(msg, user.scenerep);
            delete user.scene;
            delete user.scenerep;
        }
    },
    {
        payload: "adm_report_close",

        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canRep) return;

            let [report] = await db.collection("reports").find({ id: msg.params }).toArray();
            if (!report) return;
            if (report.closed) return msg.send(`🚫 Данный репорт уже закрыт`);
            if (report.admin != -1) {
                await vkFromDb(report.admin);
                return msg.send(`🚫 Этот репорт уже взял @id${report.admin} (${users[report.admin].nick})`);
            }

            await db.collection("reports").deleteOne({ id: msg.params });

            sendPush(await getRepAdmins(), `@id${msg.senderId} (${user.nick}) закрыл репорт #${msg.params}`);

            msg.send("🚫 Репорт закрыт");
        }
    },
    {
        payload: "adm_report_ban",

        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canRep) return;

            let [report] = await db.collection("reports").find({ id: msg.params }).toArray();
            if (!report) return;

            await vkFromDb(report.vk);
            users[report.vk].banrep = true;

            sendPush(await getRepAdmins(), `@id${msg.senderId} (${user.nick}) забанил репорт #${msg.params}.\nИгрок: *id${report.vk}`);
            msg.send("🚫 Выдан бан репорта");
        }
    },
    {
        r: /^unbanrep ([\S]+)/i,
        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canRep) return;
            let id = await vkId(msg.match[1]);
            await vkFromDb(id);
            delete users[id].banrep;

            msg.send("🚫 Снят бан репорта");
        }
    },
    {
        payload: "user_report_respond",

        async f(msg, user) {
            let [report] = await db.collection("reports").find({ id: msg.params.id }).toArray();

            if (report.liked != null) return;

            await db.collection("reports").updateOne({ id: msg.params.id }, {
                $set: {
                    liked: msg.params.positive
                }
            });

            let adm = report.admin;

            await vkFromDb(adm);

            if (adm && users[adm].status.type >= 100) {
                if (!users[adm].techRate) users[adm].techRate = 0
                users[adm].techRate += msg.params.positive ? 10 : -10;
                vkGroup.api.messages.send({
                    peer_id: adm,
                    message: `${msg.params.positive ? '👍🏻' : '👎🏻'} @id${msg.senderId} (${user.nick}) оценил ваш ответ на репорт №${msg.params.id}\n👑 Ваш рейтинг: ${users[adm].techRate}`,
                    random_id: getRandomId(),
                    forward: JSON.stringify({
                        peer_id: report.msg.peerId,
                        conversation_message_ids: report.msg.id
                    })
                });
                msg.send(`${msg.prefix}отзыв о работе администратора отправлен. Спасибо! ${randElement(['♥', '💙', '💚', '💛'])}`);
            }
        }
    },
    {
        r: /^жалобы$/i,
        status: 100,
        async f(msg, user) {
            if (msg.isChat) return;
            if (!user.admin_events.canRep) return;

            let report = await db.collection("reports").findOne({ closed: false });
            if (!report) return msg.send(`Жалоб нет`);

            await vkFromDb(report.vk);

            msg.send(
                `⚠ Жалоба без ответа\n` +
                `🔎 Номер жалобы: ${report.id}\n` +
                `🆔 [id${report.vk}|${users[report.vk].nick}]: ${report.vk} #report${report.vk}\n` +
                `🆔 Айди игрока: ${users[report.vk].fake_id}`,
                {
                    forward: JSON.stringify({
                        peer_id: report.msg.peerId,
                        conversation_message_ids: report.msg.id
                    }),
                    keyboard: Keyboard.keyboard([
                        [
                            Keyboard.textButton({
                                label: '✏ Ответить',
                                payload: {
                                    command: 'adm_report_respond',
                                    params: report.id
                                },
                                color: Keyboard.POSITIVE_COLOR
                            })
                        ],
                        [
                            Keyboard.textButton({
                                label: '🚫 Закрыть',
                                payload: {
                                    command: 'adm_report_close',
                                    params: report.id
                                },
                                color: Keyboard.NEGATIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: '❌ Забанить',
                                payload: {
                                    command: 'adm_report_ban',
                                    params: report.id
                                },
                                color: Keyboard.NEGATIVE_COLOR
                            })
                        ]
                    ]).inline()
                });
        }
    }
];