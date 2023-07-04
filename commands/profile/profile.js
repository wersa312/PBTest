let { users, clans, Keyboard } = require("../../main"),
    { numberWithCommas, statusToStr } = require("../../api/utils"),
    { vkFromDb } = require("../../api/acc"),
    { sections } = require("../../api/menu/section");

function getMarr(id) {
    if (users[id].married != null) {
        let id2 = users[id].married.id;
        if (users[id].married.gay) {
            if (users[id].married.sex == 2) {
                return "⠀🏳‍🌈️ Муж [id" + id2 + "|" + users[id2].nick + "]";
            }
            return "⠀🏳‍🌈️ Жена [id" + id2 + "|" + users[id2].nick + "]";
        }
        if (users[id].married.sex == 2) {
            return "⠀❤ Муж [id" + id2 + "|" + users[id2].nick + "]";
        }
        return "⠀❤ Жена [id" + id2 + "|" + users[id2].nick + "]";
    }
    return false;
}

module.exports = [{

    r: /^(профиль+|profile+)/i,
    payload: "profile",
    async f(msg, user) {
        if (user.married) await vkFromDb(user.married.id);

        let property = [],
            finance = [],
            params = {},
            clanBlock = "",
            azs = user.business["азс"] ? user.business["азс"].count : null,
            magaz = user.business["магаз"] ? user.business["магаз"].count : null,
            bordel = user.business["бордель"] ? user.business["бордель"].count : null,
            zavod = user.business["завод"] ? user.business["завод"].count : null,
            fabric = user.business["фабрика"] ? user.business["фабрика"].count : null;


        if (azs != null) property.push("⛽ АЗС (" + azs + "x)");
        if (magaz != null) property.push("🛍 Магазин (" + magaz + "x)");
        if (bordel != null) property.push("💃 Борделей (" + bordel + "x)");
        if (zavod != null) property.push("🍭 Завод конфеток (" + zavod + "x)");
        if (fabric != null) property.push("🎁 Фабрика подарков (" + fabric + "x)");

        if (user.property != null) {
            if (user.property.yakhta != null) property.push(user.property.yakhta.name);
            if (user.property.houses != null) property.push(user.property.houses.name);
            if (user.property.fly != null) property.push(user.property.fly.name);
            if (user.property.souvenir != null) property.push(user.property.souvenir.name);
        }

        if (user.car != null && user.cars[user.car] == null) delete user.car;
        if (user.car != null) property.push("🚗 " + user.cars[user.car].brand + " " + user.cars[user.car].model);
        if (user.fgun_id) property.push(`🔫 Оружие: ${user.fgun_id}`);

        if (property.length != 0) {
            property = property.map(p => {
                return "⠀" + p
            });
            property.unshift("\nИмущество:");
        }

        if (user.coins != 0) finance.push(`⠀💳 Pockecoins: ${numberWithCommas(user.coins)}`);
        if (user.gold != 0) finance.push(`⠀⚜️ Pockegold: ${numberWithCommas(user.gold)}`);
        if (user.vkcoin != null && user.vkcoin != 0) finance.push(`⠀💠 VK Coin: ${numberWithCommas(user.vkcoin)}`);
        if (user.newYear) finance.push(`⠀❄ Снежинок: ${numberWithCommas(user.newYear.coins)}`);
        if (user.status.type >= 100) {
            if (user.cookie != null && user.cookie != 0) finance.push(`⠀🍪 Печеньки: ${numberWithCommas(user.cookie)}`);
            if (user.techRate != null) finance.push(`⠀📢 Рейтинг репорта: ${numberWithCommas(user.techRate)}`);
        }

        if (msg.isFromUser) {
            if (user.menu) {
                user.scene = null;
                params = {
                    keyboard: sections.profile()
                };
            } else {
                params = {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: '✏️ Сменить ник',
                            payload: {
                                command: 'changeNick'
                            },
                            color: Keyboard.SECONDARY_COLOR
                        })
                    ]).inline()
                };
            }
        }

        if (user.clan) {
            if (clans[user.clan].members[msg.senderId]) {
                clanBlock = `\nРабота:
⠀🛡 Клан: ${clans[user.clan].name}\n⠀🗡 Ранг: ${clans[user.clan].members[msg.senderId].rank}`;
            } else {
                delete user.clan;
            }
        }

        let mntype = "money";
        if (user.status.type >= 2 && user.flip) {
            mntype = "testmoney";
        }

        msg.send(`@id${msg.senderId} (${user.nick}), ваш профиль:
⠀🆔 ID: ${user.shortnick ? user.shortnick : user.fake_id}
⠀💭 Статус: ${user.customstatus != null ? user.customstatus : statusToStr(user.status)}
⠀💰 Денег: ${numberWithCommas(user[mntype])}$
⠀🏧 В банке: ${numberWithCommas(user.bank.money)}$ ${finance.length == 0 ? "" : "\n" + finance.join("\n")} ${getMarr(msg.senderId) ? "\n" + getMarr(msg.senderId) : ""}
${clanBlock}
${property.join("\n")}`, params);
    }
},
{

    r: /^(balance+|баланс+|сч(ё|е)т)/i,
    payload: "balance",
    f(msg, user) {
        let params = {};
        if (msg.isFromUser) {
            params = {
                keyboard: Keyboard.keyboard([Keyboard.textButton({
                    label: '🏧 Снять с банка',
                    payload: {
                        command: 'getMoneyFromBank'
                    },
                    color: Keyboard.SECONDARY_COLOR
                })]).inline()
            };
        }

        let mntype = "money";
        if (user.status.type >= 2 && user.flip) {
            mntype = "testmoney";
        }

        msg.send(`${msg.prefix}информация о балансе:
💰 На руках: ${numberWithCommas(user[mntype])}$
🏧 В банке: ${numberWithCommas(user.bank.money)}$
💳 Pockecoins: ${numberWithCommas(user.coins)}
⚜️ Pockegold: ${numberWithCommas(user.gold)}
💠 VK Coin: ${numberWithCommas(user.vkcoin ? user.vkcoin : 0)}${user.newYear ? `\n❄ Снежинок: ${numberWithCommas(user.newYear.coins)}` : ""}`, params);
    }
}];