const { getRandomId } = require("vk-io");
const { clanFromDb } = require("../../api/clan");
const { vkGroup, Keyboard, users, clans, chats } = require("../../main"),
    { vkFromDb } = require("../../api/acc"),
    { fancyTimeFormat, randElement, numberWithCommas, getRandomInt } = require("../../api/utils"),
    { sections } = require("../../api/menu/section"),
    fs = require("fs");

let gun_games,
    globalgame;

try {
    gun_games = require("../../vars/gun_games.json");
    globalgame = require("../../vars/globalgame.json");
} catch (e) {
    gun_games = {};
    globalgame = {
        users: {},
        alives: [],
        dead: {},
        slows: {}
    };
}

setInterval(() => {
    fs.writeFile(__dirname + "/../../vars/gun_games.json", JSON.stringify(gun_games), () => { });
    fs.writeFile(__dirname + "/../../ars/globalgame.json", JSON.stringify(globalgame), () => { });
}, 5000); //100000

const distance = [10, 20, 30, 40, 50, 100];

module.exports = [{
    r: /^(?:перестрелки|перестрелка)(?: (.*))?$/i,
    payload: "gun_game",

    async f(msg, user) {

        if (msg.isChat) {
            if (!chats[msg.chatId].settings.games.gun_game) return;
        }

        if ((msg.type == "cmd" && msg.match[1] == "покинуть") || (msg.type == "payload" && msg.params?.leave)) {
            let gun_game;

            if (msg.isChat) {
                if (!gun_games[msg.chatId]) return msg.send(`🚫 Перестрелка в этой беседе не запущена`);
                gun_game = gun_games[msg.chatId];
            } else {
                gun_game = globalgame;
            }

            if (!gun_game.users[msg.senderId]) return msg.send(`🚫 Вы и так не подключены к перестрелке`);

            delete gun_game.users[msg.senderId];
            for (let i in gun_game.alives) {
                if (gun_game.alives[i].id == msg.senderId) gun_game.alives.splice(i, 1);
            }
            if (msg.params?.from_menu) {
                msg.send(`${msg.prefix}вы покинули перестрелку ✅`, {
                    keyboard: sections.games()
                });
            } else {
                msg.send(`${msg.prefix}вы покинули перестрелку ✅`);
            }
        } else {
            if (msg.isChat) {
                if (!gun_games[msg.chatId]) {
                    let { profiles } = await vkGroup.api.messages.getConversationMembers({
                        peer_id: msg.peerId
                    });

                    gun_games[msg.chatId] = {
                        users: {},
                        alives: profiles.map(u => { return { id: u.id, hp: 100 } }),
                        dead: {},
                        slows: {}
                    }

                    for (let i in profiles) {
                        gun_games[msg.chatId].users[profiles[i].id] = profiles[i].first_name;
                    }

                    msg.send(`${msg.prefix}перестрелка в этой беседе запущена ✅`);
                } else {
                    let gun_game = gun_games[msg.chatId];
                    if (gun_game.users[msg.senderId]) return msg.send(`${msg.prefix}вы уже присоединились к перестрелке ❌`);

                    gun_game.users[msg.senderId] = true;
                    gun_game.alives.push({ id: msg.senderId, hp: 100 });

                    msg.send(`${msg.prefix}вы присоединились к перестрелке ✅`);
                }
            } else {
                if (globalgame.users[msg.senderId]) return msg.send(`${msg.prefix}вы уже присоединились к глобальной перестрелке ❌`);

                globalgame.users[msg.senderId] = true;
                globalgame.alives.push({ id: msg.senderId, hp: 100 });

                let params = {};

                if (user.menu) {
                    params = {
                        keyboard: Keyboard.keyboard([
                            Keyboard.textButton({
                                label: "💥 Выстрелить",
                                payload: {
                                    command: "gungame_shot"
                                },
                                color: Keyboard.NEGATIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: "🚪 Покинуть перестрелку",
                                payload: {
                                    command: "gun_game",
                                    params: { leave: true, from_menu: true },
                                    color: Keyboard.POSITIVE_COLOR
                                }
                            })
                        ])
                    }
                }

                msg.send(`${msg.prefix}вы присоединились к глобальной перестрелке ✅`, params);
            }
        }
    }
},
{
    r: /^(?:бах|бум|бух|бдыщь)(?: (.*))?$/i,
    payload: "gungame_shot",

    async f(msg, user) {

        if (msg.isChat) {
            if (!chats[msg.chatId].settings.games.gun_game) return;
        }

        if (!user.fgun_id || !user.guns[user.fgun_id]) return msg.send(`🚫 У вас нет оружия`, {
            keyboard: Keyboard.keyboard([
                Keyboard.textButton({
                    label: '🔫 Открыть кейс',
                    payload: {
                        command: 'case',
                        params: {
                            type: 1
                        }
                    },
                    color: Keyboard.POSITIVE_COLOR
                })
            ]).inline()
        });

        let gun_game,
            time = +new Date(),
            infinity_pt = false;

        if (msg.isChat) {
            if (!gun_games[msg.chatId]) return msg.send(`🚫 Перестрелка в этой беседе не запущена`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '🔫 Начать перестрелку',
                        payload: {
                            command: 'gun_game'
                        },
                        color: Keyboard.POSITIVE_COLOR
                    })
                ]).inline()
            });
            if (!gun_games[msg.chatId].users[msg.senderId]) return msg.send(`🚫 Сперва подключитесь к перестрелке`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '🔫 Подключиться',
                        payload: {
                            command: 'gun_game'
                        },
                        color: Keyboard.POSITIVE_COLOR
                    })
                ]).inline()
            });
            gun_game = gun_games[msg.chatId];
        } else {
            if (!globalgame.users[msg.senderId]) return msg.send(`🚫 Сперва подключитесь к перестрелке`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '🔫 Подключиться',
                        payload: {
                            command: 'gun_game'
                        },
                        color: Keyboard.POSITIVE_COLOR
                    })
                ]).inline()
            });
            gun_game = globalgame;
        }

        if (gun_game.dead[msg.senderId]) {
            if (gun_game.dead[msg.senderId].time > time) {
                let killer_id = gun_game.dead[msg.senderId].by;
                await vkFromDb(killer_id);
                return msg.send(`🚫 Вы погибли от @id${killer_id} (${users[killer_id].nick})\n⏳ Подождите: ${fancyTimeFormat(Math.floor((gun_game.dead[msg.senderId].time - (time)) / 1000))}`);
            } else {
                delete gun_game.dead[msg.senderId];
                gun_game.alives.push({ id: msg.senderId, hp: 100 });
            }
        }


        if (gun_game.slows[msg.senderId]) {
            if (gun_game.slows[msg.senderId] > time) {
                return msg.send(`🔫 Перезарядка. Подождите: ${fancyTimeFormat(Math.floor((gun_game.slows[msg.senderId] - (time)) / 1000))}`);
            } else {
                delete gun_game.slows[msg.senderId];
            }
        }

        let haveBoost = false;
        if (user.clan != null) {
            if (clans[user.clan].bpc.indexOf(2) != -1) haveBoost = true;
            if (clans[user.clan].bpc.indexOf(3) != -1) infinity_pt = true;
        }

        if (user.status.type < 3) user.captcha.to++;
        if ((user.captcha.to >= 7 && user.status.type == 0) || (user.captcha.to >= 15 && user.status.type == 1)) {

            if (user.captcha.value == null) {
                let int1 = getRandomInt(0, 30),
                    int2 = getRandomInt(0, 30);
                let rnds = getRandomInt(0, 2),
                    rndsm;
                switch (rnds) {
                    case 0:
                        rndsm = "+";
                        break;
                    case 1:
                        rndsm = "-";
                        break;
                    case 2:
                        rndsm = "*";
                        break;
                }
                user.captcha.value = eval(int1 + rndsm + int2);
                user.captcha.primer = {
                    int1: int1,
                    int2: int2,
                    rndsm: rndsm
                };
                return msg.send(`${msg.prefix}реши: ${int1 + rndsm + int2}\n✏ Бах [ответ]`);
            }

            if (msg.match[1] != user.captcha.value) return msg.send(`${msg.prefix}реши: ${user.captcha.primer.int1 + user.captcha.primer.rndsm + user.captcha.primer.int2}\n✏ Бах [ответ]`);

            user.captcha = {
                value: null,
                tried: 0,
                to: 0
            };
        }

        let alives = gun_game.alives.filter(u => u.id != msg.senderId);
        if (alives.length == 0) return msg.send(`🚫 В перестрелке мало игроков\n👥 Игроков: ${alives.length + 1}`);

        let victim = randElement(alives);
        await vkFromDb(victim.id);

        let rDistance = randElement(distance),
            gtype = user.guns[user.fgun_id].type,
            bulletShot,
            bulletHit;

        if (user[gtype + "_patrons"] == 0) return msg.send(`🚫 У вас нет патронов`);

        if (gtype == "snipe") {
            if (rDistance >= 10) {
                rDistance = rDistance / 5;
            } else {
                rDistance = rDistance * 100;
            }
        } else if (gtype == "shotgun") {
            rDistance = rDistance * 2;
        } else if (gtype == "machine_gun") {
            rDistance = rDistance * 2;
        }

        let pt, pt_max;

        if (infinity_pt) {
            bulletShot = user.guns[user.fgun_id].max_patrons;
        } else {
            pt = user[gtype + "_patrons"];
            pt_max = user.guns[user.fgun_id].max_patrons;
            bulletShot = pt > pt_max ? pt_max : pt;
            user[gtype + "_patrons"] -= bulletShot;
        }

        let skill = user.skill[0][gtype],
            onePercentHit = bulletShot / 100

        bulletHit = Math.round(onePercentHit * (skill < 10 ? 10 : skill));

        if (skill != 100) {
            user.skill[0][gtype] += 0.5;
        }

        let damage = Math.round(user.guns[user.fgun_id].damage / (rDistance / 3)),
            takeHp = bulletHit * damage,
            postFix = "";

        if ((victim.hp - takeHp) <= 0) {
            postFix = "\n💀 Противник мертв. Вы получаете 1,000$";

            if (user.clan != null) {
                let rate = 1;
                if (user.status.type == 1) {
                    rate++;
                } else if (user.status.type > 1) {
                    rate += 2;
                }
                if (clans[user.clan].bpc.indexOf(1) != -1) rate = rate * 2;

                if (user.newYear && user.newYear.activeCoupons["bah"]) {
                    if (user.newYear.activeCoupons["bah"] + 3600000 > +new Date()) {
                        rate = rate * 2;
                    } else {
                        delete user.newYear.activeCoupons["bah"];
                    }
                }

                clans[user.clan].rating += rate;
                clans[user.clan].members[user.vk].rate += rate;
                if (rate != 1) {
                    postFix += "\n🆙 Рейтинг клана повышен на " + rate + " очка\n🏆 Рейтинг: " + clans[user.clan].rating;
                } else {
                    postFix += "\n🆙 Рейтинг клана повышен\n🏆 Рейтинг: " + clans[user.clan].rating;
                }
            }

            for (let i in gun_game.alives) {
                if (gun_game.alives[i].id == victim.id) {
                    gun_game.alives.splice(i, 1);
                }
            }

            let timeDead = 120;
            if (user.status.type > 1) timeDead = 15;
            if (user.status.type == 1) timeDead = 30;
            if (users[victim.id]?.clan != null) {
                await clanFromDb(users[victim.id].clan);
                if (clans[users[victim.id].clan].bpc.indexOf(6) != -1) timeDead = Math.floor(timeDead / 2);
            }

            gun_game.dead[victim.id] = {
                "by": msg.senderId,
                "time": (+new Date() + timeDead * 1000)
            };

            user.money += 1000;

        } else {
            for (let i in gun_game.alives) {
                if (gun_game.alives[i].id == victim.id) {
                    gun_game.alives[i].hp = victim.hp - takeHp
                }
            }
        }

        if (user.status.type == 0) {
            if (haveBoost) gun_game.slows[msg.senderId] = time + 7500; else gun_game.slows[msg.senderId] = time + 15000;
        } else if (user.status.type == 1) {
            if (haveBoost) gun_game.slows[msg.senderId] = time + 2500; else gun_game.slows[msg.senderId] = time + 5000;
        }

        vkGroup.api.messages.send({
            message: `@id${user.vk} (${user.nick}) ${user.clan ? `[${clans[user.clan].name}]` : ""} VS @id${victim.id} (${users[victim.id] ? users[victim.id].nick : gun_game.users[victim.id]})
❇ Дистанция: ${rDistance} метров
👋 В руках: ${user.guns[user.fgun_id].name}
Ⓜ Тип оружия: ${gtype.replace(/machine_gun/gi, "Пулемет").replace(/pistol_automatic/gi, "Самозарядный пистолет").replace(/automatic/gi, "Винтовка").replace(/pistol/gi, "Пистолет").replace(/snipe/gi, "Снайперская винтовка").replace(/shotgun/gi, "Дробовик")}
🆙 Скилл: ${user.skill[0][gtype]}%
🔸 Патронов выпущено: ${bulletShot}
🅿 Патронов осталось: ${infinity_pt ? 'Бесконечно' : numberWithCommas(user[gtype + "_patrons"])}
🎯 Попало: ${bulletHit}
🔫 Урон: ${takeHp}
👤 У @id${victim.id} (противника) осталось: ${victim.hp - takeHp < 0 ? 0 : victim.hp - takeHp} ❤${postFix}`,
            disable_mentions: 1,
            peer_ids: (msg.isChat ? msg.peerId : `${msg.senderId}`), //, ${victim.id}
            random_id: getRandomId()
        });
    }
}];