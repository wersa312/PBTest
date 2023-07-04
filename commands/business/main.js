const { log } = require("../../api/logs");
const { numberWithCommas } = require("../../api/utils");
const { Keyboard } = require("../../main");
const business = require("./api/business.json");
const { updateBis } = require("./api/main");

module.exports = [
    {
        r: /^бизнес$/i,
        payload: "business",
        /**
         * 
         * @param {import("vk-io").MessageContext} msg 
         * @param {*} user 
         */
        f(msg, user) {
            if (!Object.keys(user.business).length) return msg.send(`${msg.prefix}у вас нет бизнесов. Доступные бизнесы для покупки:\n` +
                (Object.keys(business).filter(b => business[b].price).map(id => {
                    let b = business[id];
                    return `⠀${b.price < user.money ? '🔹' : '🔸'} ${b.name} - ${numberWithCommas(b.price)}$`
                }).join("\n")) +
                `\n\n🛒 Для приобретения бизнеса, введите: Купить бизнес [название]`);

            let mayToBuy = Object.keys(business).filter(b => {
                if (business[b].price && !user.business[b]) return true; else return false;
            }).length;

            let buttons = [
                Object.keys(user.business).map(id => Keyboard.textButton({
                    label: business[id].name,
                    payload: {
                        command: "business_info",
                        params: id
                    }
                })),
                [
                    Keyboard.textButton({
                        label: '💵 Оплатить налоги',
                        payload: {
                            command: "business_tax"
                        },
                        color: Keyboard.PRIMARY_COLOR
                    }),
                    Keyboard.textButton({
                        label: '💰 Собрать прибыль',
                        payload: {
                            command: "business_collect"
                        },
                        color: Keyboard.POSITIVE_COLOR
                    })
                ]
            ];

            if (user.menu && msg.isFromUser) {
                buttons.push([
                    Keyboard.textButton({
                        label: "◀ Назад",
                        payload: {
                            command: 'profile'
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ]);
            }

            let boost = false;

            if (user.newYear && user.newYear.activeCoupons["business"]) {
                if (user.newYear.activeCoupons["business"] + 3600000 > +new Date()) {
                    boost = true;
                } else {
                    delete user.newYear.activeCoupons["business"];
                }
            }

            msg.send(
                `${msg.prefix}ваши бизнесы:\n` +
                (Object.keys(user.business).map(id => {
                    updateBis(user.business[id], boost);
                    return `⠀${business[id].name}\n` +
                        `⠀⠀🔹 Количество: ${user.business[id].count}\n` +
                        `⠀⠀📦 Товара: ${numberWithCommas(user.business[id][(user.business[id].items != null ? 'items' : 'fuel')])}\n` +
                        `⠀⠀💰 Прибыль: ${numberWithCommas(user.business[id].money)}$\n` +
                        `⠀⠀💵 Налоги: ${numberWithCommas(Math.round(user.business[id].tax))}$/1,000,000$`;
                }).join("\n\n")),
                {
                    keyboard: Keyboard.keyboard(buttons).inline(!(user.menu && msg.isFromUser))
                }
            );
        }

    },

    {
        payload: "business_tax",
        r: /^бизнес налоги$/i,
        f(msg, user) {
            let bizes = Object.keys(user.business);

            if (!bizes.length) return msg.send(`🚫 У вас нет бизнеса`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "💼 Бизнесы",
                        payload: {
                            command: "business"
                        }
                    })
                ]).inline()
            });

            let boost = false;

            if (user.newYear && user.newYear.activeCoupons["business"]) {
                if (user.newYear.activeCoupons["business"] + 3600000 > +new Date()) {
                    boost = true;
                } else {
                    delete user.newYear.activeCoupons["business"];
                }
            }

            let taxes = 0;
            for (let i in bizes) {
                updateBis(user.business[bizes[i]], boost);
                taxes += Math.round(user.business[bizes[i]].tax);
            }

            if (taxes > user.money) return msg.send(`🚫 Не хватает денег. Налогов на сумму ${numberWithCommas(taxes)}$\n💸 Ваш баланс: ${numberWithCommas(user.money)}$`);

            user.money -= taxes;
            for (let i in bizes) {
                user.business[bizes[i]].tax = 0;
            }

            log(msg.senderId, `Оплатил налоги ${numberWithCommas(taxes)}$`);
            msg.send(`✅ Налоги на сумму $${numberWithCommas(taxes)} оплачены`);
        }
    },

    {
        payload: "business_collect",
        r: /^бизнес собрать$/i,
        f(msg, user) {
            let bizes = Object.keys(user.business);
            let postFix = ``;

            if (!bizes.length) return msg.send(`🚫 У вас нет бизнеса`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "💼 Бизнесы",
                        payload: {
                            command: "business"
                        }
                    })
                ]).inline()
            });

            let money = 0;
            for (let i in bizes) {
                if (!isNaN(user.business[bizes[i]].money)) money += Math.round(user.business[bizes[i]].money);
            }

            let boost = false;

            if (user.newYear) {
                if (user.newYear.activeCoupons["business"]) {
                    if (user.newYear.activeCoupons["business"] + 3600000 > +new Date()) {
                        boost = true;
                    } else {
                        delete user.newYear.activeCoupons["business"];
                    }
                }
                if (user.business["фабрика"]) {
                    if (!user.business["фабрика"].givedSnow) user.business["фабрика"].givedSnow = 0;
                    if (user.business["фабрика"].givedSnow + 3600000 < +new Date()) {
                        user.business["фабрика"].givedSnow = +new Date();
                        let toGive = (6000 * user.business["фабрика"].count);
                        user.newYear.coins += toGive;
                        postFix = `\n❄ Получено ${numberWithCommas(toGive)} снежинок с фабрик`
                    }
                }
            }

            user.money += money;
            for (let i in bizes) {
                user.business[bizes[i]].money = 0;
            }

            log(msg.senderId, `Получил ${numberWithCommas(money)}$ с бизнесов`);
            msg.send(`${money > 0 ? `✅ Прибыль $${numberWithCommas(money)} с бизнесов собрана` : '❌ Прибыли нет'}${postFix}`);
        }
    },

    {
        payload: "business_info",
        r: /^бизнес ([\S]+)$/i,
        f(msg, user) {
            let biz_type;
            if (msg.type == "cmd") {
                if (/магаз/.test(msg.match[1])) {
                    biz_type = "магаз";
                } else {
                    biz_type = msg.match[1];
                }
            } else {
                biz_type = msg.params;
            }

            biz_type = biz_type.toLowerCase();

            if (biz_type == "налоги" || biz_type == "собрать") return;

            if (!user.business[biz_type]) return msg.send(`🚫 У вас нет такого бизнеса`);

            let boost = false;

            if (user.newYear && user.newYear.activeCoupons["business"]) {
                if (user.newYear.activeCoupons["business"] + 3600000 > +new Date()) {
                    boost = true;
                } else {
                    delete user.newYear.activeCoupons["business"];
                }
            }

            updateBis(user.business[biz_type], boost);
            msg.send(`💲 Информация о бизнесе ${business[biz_type].name}\n` +
                `⠀⠀🔹 Количество: ${user.business[biz_type].count}\n` +
                `⠀⠀📦 Товара: ${numberWithCommas(user.business[biz_type][(user.business[biz_type].items != null ? 'items' : 'fuel')])}\n` +
                `⠀⠀💰 Прибыль: ${numberWithCommas(user.business[biz_type].money)}$\n` +
                `⠀⠀💵 Налоги: ${numberWithCommas(Math.round(user.business[biz_type].tax))}$/1,000,000$\n\n` +
                `📦 Для закупки товара используйте команду: Бизнес ${biz_type} товар [кол-во]`);
        }
    },

    {
        r: /^бизнес ([\S]+) товар ([\S]+)$/i,
        f(msg, user) {
            let biz_type;
            if (/магаз/.test(msg.match[1])) {
                biz_type = "магаз";
            } else {
                biz_type = msg.match[1].toLowerCase();
            }

            if (!user.business[biz_type]) return msg.send(`🚫 У вас нет такого бизнеса`);

            let boost = false;

            if (user.newYear && user.newYear.activeCoupons["business"]) {
                if (user.newYear.activeCoupons["business"] + 3600000 > +new Date()) {
                    boost = true;
                } else {
                    delete user.newYear.activeCoupons["business"];
                }
            }

            updateBis(user.business[biz_type], boost);

            let tovars = parseInt(msg.match[2].replace(/(к|k)/gi, "000"));
            if (isNaN(tovars) || tovars < 1) return msg.send(`🚫 Количества товара введено неверно`);

            let cost = tovars * 10;
            if (cost > user.money) return msg.send(`🚫 ${numberWithCommas(tovars)} товара стоит ${numberWithCommas(cost)}$\n` +
                `💰 Ваш баланс: ${numberWithCommas(user.money)}$`);

            let tovar_type = (user.business[biz_type].items != null ? 'items' : 'fuel');

            user.business[biz_type][tovar_type] += tovars;
            user.money -= cost;

            log(msg.senderId, `Купил товаров на ${numberWithCommas(cost)}$`);
            msg.send(`💸 Приобретено ${numberWithCommas(tovars)} товара за ${numberWithCommas(cost)}$\n` +
                `📦 Товара: ${numberWithCommas(user.business[biz_type][tovar_type])}\n` +
                `💰 Ваш баланс: ${numberWithCommas(user.money)}$`);
        }
    }
]