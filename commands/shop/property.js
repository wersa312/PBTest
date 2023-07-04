const { log } = require("../../api/logs");
const { numberToSmile, numberWithCommas } = require("../../api/utils");

const houses = require("./propertys/houses.json"),
    flies = require("./propertys/flies.json"),
    yakthas = require("./propertys/yakhta.json");

module.exports = [
    {
        r: /^имуществ(?:о|а)$/i,
        f(msg) {
            msg.send(`🏘 Виды имуществ:
⠀⠀🏠 Дома
⠀⠀✈ Самолеты
⠀⠀🚗 Машины
⠀⠀🛥 Яхты

🔎 Для покупки, введите название вида имущества.`);
        }
    },

    {
        r: /^дом(?:а)?(?: ([0-9]+))?/i,
        f(msg, user) {
            if (!msg.match[1]) return msg.send((`${msg.prefix}дома для покупки:\n`) +
                (houses.map((house, i) => `⠀⠀${numberToSmile(i + 1)} ${house.name} - ${numberWithCommas(house.price)}${house.type == "$" ? '$' : ' золота'}`).join("\n")) +
                (`\n\n🔎 Для покупки, введите: Дом [номер]`));

            let id = Number(msg.match[1]) - 1;
            if (!houses[id]) return msg.send(`🚫 Дома с таким номером не существует`);

            let house = houses[id],
                mn_type = house.type == "$" ? 'money' : 'gold',
                bMoney = user[mn_type],
                postfix = '';

            if (!user[mn_type]) user[mn_type] = 0;

            if (user[mn_type] < house.price) return msg.send(`🚫 У вас не хватает денег\n` +
                `💸 Стоимость дома: ${numberWithCommas(house.price)}${house.type == "$" ? '$' : ' золота'}\n` +
                `💰 Ваш баланс: ${numberWithCommas(user[mn_type])}${house.type == "$" ? '$' : ' золота'}`);

            if (user.property == null) user.property = {};
            if (user.property.houses) {
                /*if (user.property.houses.price) {
                    user[mn_type] += (user.property.houses.price / 2);
                    postfix = `💸 За ваш старый дом возвращено ${numberWithCommas(user.property.houses.price / 2)}${user.property.houses.type == "$" ? '$' : ' золота'}`;
                }*/
                delete user.property.houses;
            }

            user.property.houses = house;
            user[mn_type] -= house.price;
            log(msg.senderId, `Купил дома за ${numberWithCommas(house.price)}${house.type == "$" ? '$' : ' золота'}`);
            msg.send(`${msg.prefix}вы приобрели "${house.name}" за ${numberWithCommas(house.price)}${house.type == "$" ? '$' : ' золота'}\n` +
                `💰 Ваш баланс: ${numberWithCommas(user[mn_type])}${house.type == "$" ? '$' : ' золота'}\n` + postfix);
        }
    },

    {
        r: /^самол(?:е|ё)т(?:ы)?(?: ([0-9]+))?/i,
        f(msg, user) {
            if (!msg.match[1]) return msg.send((`${msg.prefix}самолеты для покупки:\n`) +
                (flies.map((fly, i) => `⠀⠀${numberToSmile(i + 1)} ${fly.name} - ${numberWithCommas(fly.price)}${fly.type == "$" ? '$' : ' золота'}`).join("\n")) +
                (`\n\n🔎 Для покупки, введите: Самолет [номер]`));

            let id = Number(msg.match[1]) - 1;
            if (!flies[id]) return msg.send(`🚫 Самолета с таким номером не существует`);

            let fly = flies[id],
                mn_type = fly.type == "$" ? 'money' : 'gold',
                bMoney = user[mn_type],
                postfix = '';

            if (!user[mn_type]) user[mn_type] = 0;

            if (user[mn_type] < fly.price) return msg.send(`🚫 У вас не хватает денег\n` +
                `💸 Стоимость самолета: ${numberWithCommas(fly.price)}${fly.type == "$" ? '$' : ' золота'}\n` +
                `💰 Ваш баланс: ${numberWithCommas(user[mn_type])}${fly.type == "$" ? '$' : ' золота'}`);

            if (user.property == null) user.property = {};
            if (user.property.fly) {
                /*if (user.property.fly.price) {
                    user[mn_type] += (user.property.fly.price / 2);
                    postfix = `💸 За ваш старый самолет возвращено ${numberWithCommas(user.property.fly.price / 2)}${user.property.fly.type == "$" ? '$' : ' золота'}`;
                }*/
                delete user.property.fly;
            }

            user.property.fly = fly;
            user[mn_type] -= fly.price;
            log(msg.senderId, `Купил самолет за ${numberWithCommas(fly.price)}${fly.type == "$" ? '$' : ' золота'}`);
            msg.send(`${msg.prefix}вы приобрели "${fly.name}" за ${numberWithCommas(fly.price)}${fly.type == "$" ? '$' : ' золота'}\n` +
                `💰 Ваш баланс: ${numberWithCommas(user[mn_type])}${fly.type == "$" ? '$' : ' золота'}\n` + postfix);
        }
    },

    {
        r: /^яхт(?:а|ы)?(?: ([0-9]+))?/i,
        f(msg, user) {
            if (!msg.match[1]) return msg.send((`${msg.prefix}яхты для покупки:\n`) +
                (yakthas.map((yakhta, i) => `⠀⠀${numberToSmile(i + 1)} ${yakhta.name} - ${numberWithCommas(yakhta.price)}${yakhta.type == "$" ? '$' : ' золота'}`).join("\n")) +
                (`\n\n🔎 Для покупки, введите: Яхта [номер]`));

            let id = Number(msg.match[1]) - 1;
            if (!yakthas[id]) return msg.send(`🚫 Яхты с таким номером не существует`);

            let yakhta = yakthas[id],
                mn_type = yakhta.type == "$" ? 'money' : 'gold',
                bMoney = user[mn_type],
                postfix = '';

            if (!user[mn_type]) user[mn_type] = 0;

            if (user[mn_type] < yakhta.price) return msg.send(`🚫 У вас не хватает денег\n` +
                `💸 Стоимость яхты: ${numberWithCommas(yakhta.price)}${yakhta.type == "$" ? '$' : ' золота'}\n` +
                `💰 Ваш баланс: ${numberWithCommas(user[mn_type])}${yakhta.type == "$" ? '$' : ' золота'}`);

            if (user.property == null) user.property = {};
            if (user.property.yakhta) {
                /*if (user.property.yakhta.price) {
                    user[mn_type] += (user.property.yakhta.price / 2);
                    postfix = `💸 За вашу старую яхту возвращено ${numberWithCommas(user.property.yakhta.price / 2)}${user.property.yakhta.type == "$" ? '$' : ' золота'}`;
                }*/
                delete user.property.yakhta;
            }

            user.property.yakhta = yakhta;
            user[mn_type] -= yakhta.price;
            log(msg.senderId, `Купил яхту за ${numberWithCommas(yakhta.price)}${yakhta.type == "$" ? '$' : ' золота'}`);
            msg.send(`${msg.prefix}вы приобрели "${yakhta.name}" за ${numberWithCommas(yakhta.price)}${yakhta.type == "$" ? '$' : ' золота'}\n` +
                `💰 Ваш баланс: ${numberWithCommas(user[mn_type])}${yakhta.type == "$" ? '$' : ' золота'}\n` + postfix);
        }
    }
]