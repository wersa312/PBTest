const { timeFormat, randElement, getRandomInt, numberWithCommas, numberToSmile } = require("../../api/utils"),
    { Keyboard } = require("../../main");

const bonus = {
    unluck: [
        {
            type: "money",
            range: [1000, 10000]
        },
        {
            type: "money",
            range: [10000, 100000]
        },
        {
            type: "money",
            range: [100000, 1000000]
        },
        {
            type: "money",
            range: [1000000, 10000000]
        },
        {
            type: "money",
            range: [10000000, 100000000]
        },
        {
            type: "coins",
            range: [1000, 6000]
        }
    ],
    common: [
        {
            type: "coins",
            range: [5000, 10000]
        },
        {
            type: "coins",
            range: [5000, 15000]
        },
        {
            type: "gold",
            range: [1, 500]
        },
        {
            type: "gold",
            range: [5, 200]
        }
    ],
    epic: [
        {
            type: "vip_case",
            range: [1, 3]
        },
        /*{
            type: "free_im",
            im: "house"
        },
        {
            type: "free_im",
            im: "fly"
        },*/
        {
            type: "gold",
            range: [500, 1000]
        },
        {
            type: "gold",
            range: [300, 1200]
        }
    ],
    grand: [
        {
            type: "gun",
            gun: {
                name: "LEGENDARY AWP",
                type: "snipe",
                damage: 200,
                max_patrons: 10,
                count: 1
            }
        },
        {
            type: "gold",
            range: [1000, 5000]
        }
    ]
}

module.exports = {
    payload: "bonus",
    r: /^бонус( .*)?$/i,
    payload: "bonus",

    async f(msg, user) {
        if (!user.bonustime) user.bonustime = 0;
        if (!user.bonusinv) user.bonusinv = {};

        let inventar = false;
        if (msg.type == "cmd" && msg.match[1] == " инвентарь") inventar = true;
        if (msg.type == "payload" && msg.params["inv"]) inventar = true;

        if (inventar) {
            let inv = [];
            for (let i in user.bonusinv) {
                /* 
                if (i == "car") inv.push("🚗 Бесплатное открытие кейса с автомобилями x" + user.bonusinv[i]);
                if (i == "gun_case") inv.push("🔫 Бесплатное открытие кейса с оружиями x" + user.bonusinv[i]);
                if (i == "house") inv.push("🏠 Бесплатный любой дом x" + user.bonusinv[i]);
                if (i == "fly") inv.push("✈ Бесплатный любой самолет x" + user.bonusinv[i]);
                if (i == "cancel_stav") inv.push("✈ Бесплатный любой самолет x" + user.bonusinv[i]);
                */
                if (i == "vip_case") inv.push("🔫 Бесплатное открытие V.I.P. кейса с оружиями x" + user.bonusinv[i]);
            }
            inv = inv.map((item, index) => numberToSmile(index + 1) + ". " + item)
            return msg.send(`${msg.prefix}Ваш бонусный инвентарь:
${inv.length == 0 ? "🚫 Инвентарь пуст" : "⠀" + inv.join("\n⠀")}`);
        }

        if ((+new Date() - user.bonustime) / 1000 < 86400) return msg.send(`🎁 Вы уже забрали свой бонус
🕒 Следующий бонус можно забрать через ${timeFormat(86400 - Math.floor((+new Date() - user.bonustime) / 1000))}`);

        user.bonustime = +new Date();

        let rand = getRandomInt(0, 10000), type, prize, prizestr;

        if (rand <= 100) {
            type = "grand";
        } else if (rand < 2900) {
            type = "epic";
        } else if (rand < 7000) {
            type = "common";
        } else {
            type = "unluck";
        }

        prize = randElement(bonus[type]);

        if (prize.type == "money") {
            let giftmoney = getRandomInt(prize.range[0], prize.range[1]);
            user.money += giftmoney;
            prizestr = numberWithCommas(giftmoney) + "$\n💰 Баланс: " + numberWithCommas(user.money) + "$";
        } else if (prize.type == "coins") {
            let giftmoney = getRandomInt(prize.range[0], prize.range[1]);
            user.coins += giftmoney;
            prizestr = numberWithCommas(giftmoney) + " pockecoins\n💳 Баланс: " + numberWithCommas(user.coins) + " pockecoins";
        } else if (prize.type == "gold") {
            let giftmoney = getRandomInt(prize.range[0], prize.range[1]);
            user.gold += giftmoney;
            prizestr = numberWithCommas(giftmoney) + " pockegold\n⚜️ Баланс: " + numberWithCommas(user.gold) + " pockegold";
        } else if (prize.type == "car") {
            let giftcar = getRandomInt(prize.range[0], prize.range[1]);
            if (user.bonusinv["car"]) {
                user.bonusinv["car"] += giftcar;
            } else {
                user.bonusinv["car"] = giftcar;
            }
            prizestr = giftcar + "x бесплатных открытий кейсов с автомобилями";
        } else if (prize.type == "gun_case") {
            let gun_case = getRandomInt(prize.range[0], prize.range[1]);
            if (user.bonusinv["gun_case"]) {
                user.bonusinv["gun_case"] += gun_case;
            } else {
                user.bonusinv["gun_case"] = gun_case;
            }
            prizestr = gun_case + "x бесплатных открытий кейсов с оружиями";
        } else if (prize.type == "vip_case") {
            let vip_case = getRandomInt(prize.range[0], prize.range[1]);
            if (user.bonusinv["vip_case"]) {
                user.bonusinv["vip_case"] += vip_case;
            } else {
                user.bonusinv["vip_case"] = vip_case;
            }
            prizestr = vip_case + "x бесплатных открытий кейсов с V.I.P. оружиями";
        } else if (prize.type == "free_im") {
            if (user.bonusinv[prize.im]) {
                user.bonusinv[prize.im]++;
            } else {
                user.bonusinv[prize.im] = 1;
            }
            prizestr = prize.im.replace("house", "🏡 Бесплатный любой дом").replace("fly", "✈ Бесплатный любой самолет").replace("cancel_stav", "Отмены одной ставки");
        } else if (prize.type == "gun") {
            if (user.guns[prize.gun.name]) {
                user.guns[prize.gun.name].count++;
            } else {
                user.guns[prize.gun.name] = prize.gun;
            }
            prizestr = "🔫 " + prize.gun.name;
        }
        msg.send(`🎁 Ваш бонус: ${prizestr}`, {
            keyboard: Keyboard.keyboard([
                Keyboard.textButton({
                    label: '💼 Инвентарь',
                    payload: {
                        command: 'bonus',
                        params: {
                            inv: true
                        }
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
            ]).inline()
        });
    }
}