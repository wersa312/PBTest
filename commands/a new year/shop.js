const { Keyboard } = require("vk-io");
const { numberToSmile, numberWithCommas } = require("../../api/utils");

const houses = require("./propertys/houses.json"),
    flies = require("./propertys/flies.json"),
    cars = require("./propertys/cars.json"),
    souvenirs = require("./propertys/souvenirs.json");

module.exports = [
    {
        r: /^нмагазин/i,
        f(msg, user) {
            if (!user.newYear) return;

            msg.send(
                `👋 Вы попали в новогодний магазин, мы рады вас видеть! 😍\n` +
                `✅ Вы можете приобрести у нас красивое новогоднее имущество 🎄\n` +
                `⠀🚗 Купить машину командой «Нмашины»\n` +
                `⠀✈ Новогодние самолеты командой «Нсамолеты»\n` +
                `⠀🎁 Красивые сувениры командой «Нсувениры»\n` +
                `⠀🎄 Дома, где случаются чудеса «Ндома»\n` +
                `⠀🌨 Новогодний специальный кейс в команде «кейс»\n`,
                {
                    keyboard: Keyboard.keyboard([
                        [
                            Keyboard.textButton({ label: "🚗", payload: { command: "ny_cars" } }),
                            Keyboard.textButton({ label: "✈", payload: { command: "ny_planes" } })
                        ],
                        [
                            Keyboard.textButton({ label: "🎁", payload: { command: "ny_souv" } }),
                            Keyboard.textButton({ label: "🎄", payload: { command: "ny_houses" } })
                        ]
                    ]).inline()
                });
        }
    },

    {
        r: /^ндом(?:а)?(?: ([0-9]+))?/i,
        payload: "ny_houses",
        f(msg, user) {
            if (!user.newYear) return;

            if (msg.type != "cmd" || !msg.match[1]) return msg.send((`${msg.prefix}дома для покупки:\n`) +
                (houses.map((house, i) => `⠀⠀${numberToSmile(i + 1)} ${house.name} - ${numberWithCommas(house.price)} ❄`).join("\n")) +
                (`\n\n🔎 Для покупки, введите: Ндом [номер]`));

            let id = Number(msg.match[1]) - 1;
            if (!houses[id]) return msg.send(`🚫 Дома с таким номером не существует`);

            let house = houses[id];

            if (user.newYear.coins < house.price) return msg.send(`🚫 У вас не хватает денег\n` +
                `💸 Стоимость дома: ${numberWithCommas(house.price)} ❄\n` +
                `💰 Ваш баланс: ${numberWithCommas(user.newYear.coins)} ❄`);

            if (user.property == null) user.property = {};
            if (user.property.houses) {
                delete user.property.houses;
            }

            user.property.houses = house;
            user.newYear.coins -= house.price;
            msg.send(`${msg.prefix}вы приобрели "${house.name}" за ${numberWithCommas(house.price)} ❄`);
        }
    },

    {
        r: /^нсамол(?:е|ё)т(?:ы)?(?: ([0-9]+))?/i,
        payload: "ny_planes",
        f(msg, user) {
            if (!user.newYear) return;

            if (msg.type != "cmd" || !msg.match[1]) return msg.send((`${msg.prefix}самолеты для покупки:\n`) +
                (flies.map((house, i) => `⠀⠀${numberToSmile(i + 1)} ${house.name} - ${numberWithCommas(house.price)} ❄`).join("\n")) +
                (`\n\n🔎 Для покупки, введите: Нсамолет [номер]`));

            let id = Number(msg.match[1]) - 1;
            if (!flies[id]) return msg.send(`🚫 Самолета с таким номером не существует`);

            let house = flies[id];

            if (user.newYear.coins < house.price) return msg.send(`🚫 У вас не хватает денег\n` +
                `💸 Стоимость самолета: ${numberWithCommas(house.price)} ❄\n` +
                `💰 Ваш баланс: ${numberWithCommas(user.newYear.coins)} ❄`);

            if (user.property == null) user.property = {};
            if (user.property.fly) {
                delete user.property.fly;
            }

            user.property.fly = house;
            user.newYear.coins -= house.price;
            msg.send(`${msg.prefix}вы приобрели "${house.name}" за ${numberWithCommas(house.price)} ❄`);
        }
    },

    {
        r: /^нмашин(?:а|ы)?(?: ([0-9]+))?/i,
        payload: "ny_cars",
        f(msg, user) {
            if (!user.newYear) return;

            if (msg.type != "cmd" || !msg.match[1]) return msg.send((`${msg.prefix}машины для покупки:\n`) +
                (cars.map((house, i) => `⠀⠀${numberToSmile(i + 1)} ${house.name[0]} ${house.name[1]} - ${numberWithCommas(house.price)} ❄`).join("\n")) +
                (`\n\n🔎 Для покупки, введите: Нмашина [номер]`));

            let id = Number(msg.match[1]) - 1;
            if (!cars[id]) return msg.send(`🚫 Машины с таким номером не существует`);
            if (!(user.cars.length < 1 || (user.status.type == 1 && user.cars.length < 3) || ((user.status.type >= 2) && user.cars.length < 10))) return msg.send(`🚫 Ваш гараж полон`);

            let house = cars[id];

            if (user.newYear.coins < house.price) return msg.send(`🚫 У вас не хватает денег\n` +
                `💸 Стоимость машины: ${numberWithCommas(house.price)} ❄\n` +
                `💰 Ваш баланс: ${numberWithCommas(user.newYear.coins)} ❄`);

            if (user.cars == null) user.cars = [];

            user.cars.push({
                brand: house.name[1],
                model: house.name[0],
                class: "event",
                acc: 0.6,
                weight: 3500,
                rare: "newyear",
                price: house.price,
                prob: 0,
                max: 100
            });
            user.newYear.coins -= house.price;
            msg.send(`${msg.prefix}вы приобрели "${house.name[0]} ${house.name[1]}" за ${numberWithCommas(house.price)} ❄`);
        }
    },

    {
        r: /^нсувенир(?:ы)?(?: ([0-9]+))?/i,
        payload: "ny_souv",
        f(msg, user) {
            if (!user.newYear) return;

            if (msg.type != "cmd" || !msg.match[1]) return msg.send((`${msg.prefix}сувениры для покупки:\n`) +
                (souvenirs.map((house, i) => `⠀⠀${numberToSmile(i + 1)} ${house.name} - ${numberWithCommas(house.price)} ❄`).join("\n")) +
                (`\n\n🔎 Для покупки, введите: Нсувенир [номер]`));

            let id = Number(msg.match[1]) - 1;
            if (!souvenirs[id]) return msg.send(`🚫 Сувенира с таким номером не существует`);

            let house = souvenirs[id];

            if (user.newYear.coins < house.price) return msg.send(`🚫 У вас не хватает денег\n` +
                `💸 Стоимость сувенира: ${numberWithCommas(house.price)} ❄\n` +
                `💰 Ваш баланс: ${numberWithCommas(user.newYear.coins)} ❄`);

            if (user.property == null) user.property = {};
            if (user.property.souvenir) {
                delete user.property.souvenir;
            }

            user.property.souvenir = house;
            user.newYear.coins -= house.price;
            msg.send(`${msg.prefix}вы приобрели "${house.name}" за ${numberWithCommas(house.price)} ❄`);
        }
    }
]