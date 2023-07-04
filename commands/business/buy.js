const { log } = require("../../api/logs");
const business = require("./api/business.json");
const { numberWithCommas, declOfNum } = require("../../api/utils");

const AZS_PRICE = 10000000;
const MAGAZ_PRICE = 1000000;
const BORDEL_PRICE = 1000000;
const FABRIC_PRICE = 100000;

module.exports = [
    {
        r: /^(купить бизнес$|купить бизнес (?!(азс|бордель|магаз|магазин|фабрика)))/i,
        f(msg, user) {
            msg.send(`${msg.prefix}доступные бизнесы для покупки:\n` +
                (Object.keys(business).filter(b => business[b].price).map(id => {
                    let b = business[id];
                    return `⠀${b.price < user.money ? '🔹' : '🔸'} ${b.name} - ${numberWithCommas(b.price)}$`
                }).join("\n")) +
                `\n\n🛒 Для приобретения бизнеса, введите: Купить бизнес [название]`);
        }
    },
    {
        r: /^купить бизнес азс( [0-9]+)?$/i,
        f(msg, user) {
            let count = msg.match[1] ? Number(msg.match[1]) : 1;
            if (count < 1) count = 1;

            if (!user.business["азс"]) user.business["азс"] = {
                tax: 0,
                count: 0,
                time: +new Date(),
                money: 0,
                fuel: 0
            };

            let maxBis;
            if (!user.status.type) {
                maxBis = 100;
            } else if (user.status.type == 1) {
                maxBis = 150;
            } else {
                maxBis = 200;
            }
            let limit = maxBis - user.business["азс"].count;
            if (maxBis < (user.business["азс"].count + count)) count = limit;
            if (!count) return msg.send(`🚫 Ваш статус не позволяет купить больше ${maxBis} азс${maxBis != 200 ? '\n🛒 Расширьте свои возможности на сайте pocketbot.ru' : ''}`);

            if ((count * AZS_PRICE) > user.money) {
                if (!user.business["азс"].count) delete user.business["азс"];
                return msg.send(`🚫 Вам не хватает ${numberWithCommas((count * AZS_PRICE) - user.money)}$\n` +
                    (`💸 ${count} АЗС стоит ${numberWithCommas(count * AZS_PRICE)}$\n`) +
                    (`💰 Ваш баланс: ${numberWithCommas(user.money)}$`)
                );
            }

            user.money -= count * AZS_PRICE;
            user.business["азс"].count += count;
            log(msg.senderId, `Купил бизнес "АЗС" в количестве ${count}шт.`);

            msg.send(`💲 Вы приобрели ${count != 1 ? `${count} ` : ''}АЗС за ${numberWithCommas(count * AZS_PRICE)}$\n` +
                (`⛽ В вашей сети АЗС: ${user.business["азс"].count} бизнеса\n`) +
                (`💰 Баланс: ${numberWithCommas(user.money)}$`));
        }
    },

    {
        r: /^купить бизнес магаз(?:ин)?( [0-9]+)?$/i,
        f(msg, user) {
            let count = msg.match[1] ? Number(msg.match[1]) : 1;
            if (count < 1) count = 1;

            if (!user.business["магаз"]) user.business["магаз"] = {
                tax: 0,
                count: 0,
                time: +new Date(),
                money: 0,
                items: 0
            };

            let maxBis;
            if (!user.status.type) {
                maxBis = 100;
            } else if (user.status.type == 1) {
                maxBis = 150;
            } else {
                maxBis = 200;
            }
            let limit = maxBis - user.business["магаз"].count;
            if (maxBis < (user.business["магаз"].count + count)) count = limit;
            if (!count) return msg.send(`🚫 Ваш статус не позволяет купить больше ${maxBis} магазина${maxBis != 200 ? '\n🛒 Расширьте свои возможности на сайте pocketbot.ru' : ''}`);

            if ((count * MAGAZ_PRICE) > user.money) {
                if (!user.business["магаз"].count) delete user.business["магаз"];
                return msg.send(`🚫 Вам не хватает ${numberWithCommas((count * MAGAZ_PRICE) - user.money)}$\n` +
                    (`💸 ${count} магазин(а) стоит ${numberWithCommas(count * MAGAZ_PRICE)}$\n`) +
                    (`💰 Ваш баланс: ${numberWithCommas(user.money)}$`)
                );
            }

            user.money -= count * MAGAZ_PRICE;
            user.business["магаз"].count += count;
            log(msg.senderId, `Купил бизнес "Магазин" в количестве ${count}шт.`);

            msg.send(`💲 Вы приобрели ${count != 1 ? `${count} ` : ''}${declOfNum(count, ["магазин", "магазина", "магазинов"])} за ${numberWithCommas(count * MAGAZ_PRICE)}$\n` +
                (`⛽ В вашей сети магазинов: ${user.business["магаз"].count} бизнеса\n`) +
                (`💰 Баланс: ${numberWithCommas(user.money)}$`));
        }
    },

    {
        r: /^купить бизнес бордель( [0-9]+)?$/i,
        f(msg, user) {
            let count = msg.match[1] ? Number(msg.match[1]) : 1;
            if (count < 1) count = 1;

            if (!user.business["бордель"]) user.business["бордель"] = {
                tax: 0,
                count: 0,
                time: +new Date(),
                money: 0,
                items: 0
            };

            let maxBis;
            if (!user.status.type) {
                maxBis = 50;
            } else if (user.status.type == 1) {
                maxBis = 100;
            } else {
                maxBis = 150;
            }
            let limit = maxBis - user.business["бордель"].count;
            if (maxBis < (user.business["бордель"].count + count)) count = limit;
            if (!count) return msg.send(`🚫 Ваш статус не позволяет купить больше ${maxBis} борделя${maxBis != 150 ? '\n🛒 Расширьте свои возможности на сайте pocketbot.ru' : ''}`);

            if ((count * BORDEL_PRICE) > user.money) {
                if (!user.business["бордель"].count) delete user.business["бордель"];
                return msg.send(`🚫 Вам не хватает ${numberWithCommas((count * BORDEL_PRICE) - user.money)}$\n` +
                    (`💸 ${count} ${declOfNum(count, ["бордель", "борделя", "борделей"])} стоит ${numberWithCommas(count * BORDEL_PRICE)}$\n`) +
                    (`💰 Ваш баланс: ${numberWithCommas(user.money)}$`)
                );
            }

            user.money -= count * BORDEL_PRICE;
            user.business["бордель"].count += count;
            log(msg.senderId, `Купил бизнес "Бордель" в количестве ${count}шт.`);

            msg.send(`💲 Вы приобрели ${count != 1 ? `${count} ` : ''} ${declOfNum(count, ["бордель", "борделя", "борделей"])} за ${numberWithCommas(count * BORDEL_PRICE)}$\n` +
                (`⛽ В вашей сети борделей: ${user.business["бордель"].count} бизнеса\n`) +
                (`💰 Баланс: ${numberWithCommas(user.money)}$`));
        }
    },

    {
        r: /^купить бизнес фабрика( [0-9]+)?$/i,
        f(msg, user) {
            if (!user.newYear) return;

            let count = msg.match[1] ? Number(msg.match[1]) : 1;
            if (count < 1) count = 1;

            if (!user.business["фабрика"]) user.business["фабрика"] = {
                tax: 0,
                count: 0,
                time: +new Date(),
                money: 0,
                items: 0
            };

            let maxBis;
            if (!user.status.type) {
                maxBis = 50;
            } else if (user.status.type == 1) {
                maxBis = 100;
            } else {
                maxBis = 150;
            }
            let limit = maxBis - user.business["фабрика"].count;
            if (maxBis < (user.business["фабрика"].count + count)) count = limit;
            if (count < 1) return;
            if (!count) return msg.send(`🚫 Ваш статус не позволяет купить больше ${maxBis} фабрик${maxBis != 150 ? '\n🛒 Расширьте свои возможности на сайте pocketbot.ru' : ''}`);

            if ((count * FABRIC_PRICE) > user.newYear.coins) {
                if (!user.business["фабрика"].count) delete user.business["фабрика"];
                return msg.send(`🚫 Вам не хватает ${numberWithCommas((count * FABRIC_PRICE) - user.newYear.coins)} ❄\n` +
                    (`💸 ${count} ${declOfNum(count, ["фабрик", "фабрики", "фабрик"])} стоит ${numberWithCommas(count * FABRIC_PRICE)} ❄\n`) +
                    (`💰 Ваш баланс: ${numberWithCommas(user.newYear.coins)} ❄`)
                );
            }

            user.newYear.coins -= count * FABRIC_PRICE;
            user.business["фабрика"].count += count;
            log(msg.senderId, `Купил бизнес "фабрика" в количестве ${count}шт.`);

            msg.send(`💲 Вы приобрели ${count != 1 ? `${count} ` : ''}${declOfNum(count, ["фабрику", "фабрика", "фабрик"])} за ${numberWithCommas(count * FABRIC_PRICE)} ❄\n` +
                (`⛽ В вашей сети фабрик: ${user.business["фабрика"].count} бизнеса\n`) +
                (`💰 Баланс: ${numberWithCommas(user.newYear.coins)} ❄`));
        }
    }
]