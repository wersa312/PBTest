const { vkId, vkFromDb } = require("../../api/acc");
const { getRandomInt, numberWithCommas, numberToSmile } = require("../../api/utils");
const { users } = require("../../main");

module.exports = [
    {
        r: /^машина ([0-9]+)$/i,
        f(msg, user) {
            let id = parseInt(msg.match[1]) - 1;
            if (!user.cars[id]) return msg.send(`🚫 У вас нет машины с таким номером`);
            user.car = id;
            msg.send(`🚗 Ваша основная машина теперь: ${user.cars[id].brand} ${user.cars[id].model}`);
        }
    },

    {
        r: /^продать машину ([0-9]+)$/i,
        async f(msg, user) {
            let car_id = parseInt(msg.match[1]) - 1;
            if (!user.cars[car_id]) return msg.send(`${msg.prefix}у вас нет авто с таким номером`);

            if (car_id == user.car) delete user.car;

            let car = user.cars[car_id],
                price = getRandomInt(prices[car.rare].min, prices[car.rare].max),
                deltaMinus = getRandomInt(1000, 10000);

            price -= deltaMinus * car.prob;
            if (price <= 0) price = 100000;
            user.money += price;
            user.cars.splice(car_id, 1);
            msg.send(`✅ Вы продали ${car.brand} ${car.model} государству и получили ${numberWithCommas(price)}$`);
        }
    },

    {
        r: /^продать машину ([\S]+) ([0-9]+) ([\S]+)/i,
        async f(msg, user) {
            if (user.banpay) return msg.send(`🚫 У вас бан передачи`);

            let id = await vkId(msg.match[1]);
            await vkFromDb(id);
            if (!users[id]) return msg.send(`🚫 Игрок не найден`);
            if (id == msg.senderId) return msg.send(`🚫 Нельзя продать самому себе авто`);
            if (users[id].banpay) return msg.send(`🚫 У данного игрока бан передачи`);

            let car_id = parseInt(msg.match[2]) - 1;
            if (!user.cars[car_id]) return msg.send(`${msg.prefix}у вас нет авто с таким номером`);

            let money = parseInt(msg.match[3].replace(/k|к/gi, "000"));
            if (isNaN(money)) return msg.send(`🚫 Сумма введена неверно`);
            if (money < 0) return msg.send(`🚫 Сумма должна быть выше 1$`);

            if (!users[id].sellcars) users[id].sellcars = [];
            if (users[id].sellcars.find(c => c.vk == msg.senderId)) return msg.send(("🚫 Вы уже предлагали данному пользователю предложение о покупке машины\n" +
                `📄 Чтобы отменить, напиши: "Продать машину ${users[id].fake_id} отменить"`));

            if (user.timeCarSell && user.timeCarSell + 600000 > +new Date()) return msg.send("🚫 Подождите 10 минут перед отправкой нового предложения");
            user.cars[car_id].uid = +new Date();
            user.timeCarSell = +new Date();
            users[id].sellcars.push({
                vk: msg.senderId,
                car: user.cars[car_id],
                price: money
            });
            msg.send(`✅ Вы предложили ${user.cars[car_id].brand} ${user.cars[car_id].model} игроку @id${id} (${users[id].nick}) за ${numberWithCommas(money)}$\n` +
                `🚫 Чтобы отменить, введите: "Продать машину ${msg.match[1]} отменить"\n` +
                `💲 @id${id} (${users[id].nick}), чтобы подтвердить покупку, введите: "Купить машину ${user.fake_id}"`);
        }
    },

    {
        r: /^продать машину ([\S]+) отменить$/i,
        async f(msg) {

            let id = await vkId(msg.match[1]);
            await vkFromDb(id);
            if (!users[id]) return msg.send(`🚫 Игрок не найден`);
            if (id == msg.senderId) return;
            if (!users[id].sellcars) return;

            for (let i in users[id].sellcars) {
                if (users[id].sellcars[i].vk == msg.senderId) {
                    users[id].sellcars.splice(i, 1);
                    msg.send("🚗 Отменено!");
                }
            }
        }
    },


    {
        r: /^купить машину$/i,
        async f(msg, user) {
            if (!user.sellcars || !user.sellcars.length) return msg.send("🚗 Вам никто не предлагает купить авто");
            let cars = await Promise.all(user.sellcars.map(async (car, i) => {
                await vkFromDb(car.vk);
                return `${numberToSmile(i + 1)}. @id${car.vk} (${users[car.vk].nick}) предлагает ${car.car.brand} ${car.car.model} за ${numberWithCommas(car.price)}$`;
            }));
            msg.send(
                `🚗 Предложения:\n` +
                cars.join("\n") + "\n\n" +
                `💲 Для покупки, введите: Купить машину [ссылка на продавца]`
            );
        }
    },
    {
        r: /^купить машину ([\S]+)/i,
        async f(msg, user) {
            if (user.banpay) return msg.send("🚫 У вас бан передачи");

            let id = await vkId(msg.match[1]);
            await vkFromDb(id);
            if (!users[id]) return msg.send(`🚫 Игрок не найден`);
            if (id == msg.senderId) return;

            let car = user.sellcars.find(c => c.vk == id);
            if (!car) return msg.send("🚫 Данный игрок не предлагает вам купить авто");

            let car_id;
            for (let i in users[id].cars) {
                if (users[id].cars[i].uid == car.car.uid) car_id = i;
            }

            let csId;
            for (let i in user.sellcars) {
                if (user.sellcars[i].car.uid == car.car.uid) csId = i;
            }

            if (car_id == null) {
                user.sellcars.splice(csId, 1);
                return msg.send("🚫 Данный игрок уже продал эту машину");
            }

            if (user.money < car.price) return msg.send(
                `🚫 Стоимость авто: ${numberWithCommas(car.price)}$\n` +
                `💰 Баланс: ${numberWithCommas(user.money)}$`
            );

            if (user.cars.length < 1 || (user.status.type == 1 && user.cars.length < 3) || ((user.status.type >= 2) && user.cars.length < 10)) {

                if (users[id].car == car_id) delete users[id].car;
                users[id].cars.splice(car_id, 1);
                user.cars.push(car.car);
                user.money -= car.price;
                users[id].money += car.price;
                user.sellcars.splice(csId, 1);

                msg.send(`✅ Вы купили ${car.car.brand} ${car.car.model} за ${numberWithCommas(car.price)}$`);
            } else {
                msg.send("🚗 Не хватает места в парковке");
            }
        }
    }
]

const prices = {
    vedro: {
        min: 10000,
        max: 100000
    },
    common: {
        min: 100000,
        max: 1000000
    },
    rare: {
        min: 1000000,
        max: 10000000
    },
    epic: {
        min: 10000000,
        max: 50000000
    },
    legendary: {
        min: 50000000,
        max: 100000000
    },
    halloween: {
        min: 50000000,
        max: 100000000
    },
    newyear: {
        min: 50000000,
        max: 100000000
    },
    mystic: {
        min: 100000000,
        max: 500000000
    }
};