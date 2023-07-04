const { clanFromDb } = require("../../api/clan");
const { Keyboard, clans } = require("../../main"),
    { numberWithCommas, randElement, rareToStr } = require("../../api/utils"),
    { case_items, vipcase } = require("./gunscase.json"),
    { car, classToString } = require("./carcase");

function sendHelp(msg, user, error = false) {
    let freecase = {
        gun: 0,
        vip_gun: 0,
        car: 0
    }

    if (user.bonusinv) {
        if (user.bonusinv["gun_case"]) freecase.gun = user.bonusinv["gun_case"];
        if (user.bonusinv["vip_case"]) freecase.vip_gun = user.bonusinv["vip_case"];
        if (user.bonusinv["car"]) freecase.car = user.bonusinv["car"];
    }

    let buttons = [
        Keyboard.textButton({
            label: "🔫",
            payload: {
                command: "case",
                params: {
                    type: 1
                }
            },
            color: Keyboard.SECONDARY_COLOR
        }),
        Keyboard.textButton({
            label: "🏆",
            payload: {
                command: "case",
                params: {
                    type: 2
                }
            },
            color: Keyboard.SECONDARY_COLOR
        }),
        Keyboard.textButton({
            label: "🚘",
            payload: {
                command: "case",
                params: {
                    type: 3
                }
            },
            color: Keyboard.SECONDARY_COLOR
        })
    ];

    if (user.newYear) buttons.push(Keyboard.textButton({
        label: "🌨",
        payload: {
            command: "case",
            params: {
                type: 4
            }
        },
        color: Keyboard.SECONDARY_COLOR
    }))

    msg.send(`${msg.prefix}кейсы: ${error ? "\n🚫 Вы ввели несуществующий кейс. Введите: \"Кейс [номер]\"" : ""}
🔫 1. Кейс с оружиями -- 1,000,000$
🏆 2. V.I.P. кейс с оружиями -- 10,000,000$ ${freecase.vip_gun ? `| Бесплатно: ${freecase.vip_gun}x` : ""}
🚘 3. Кейс с машинами -- 10,000,000$`+
        (user.newYear ? `\n🌨 4. Кейс снежинок -- 500,000 ❄ ${user.newYear.cases ? `| Бесплатно: ${user.newYear.cases}` : ''}` : "") +
        `\n\n❔ Для покупки используйте кнопки снизу`, {
        keyboard: Keyboard.keyboard([buttons]).inline()
    });
}

module.exports = {
    r: /^(?:кейс(?:ы)?|case)(?: (.*))?$/i,
    payload: "case",

    async f(msg, user) {
        if ((msg.type == "cmd" && !msg.match[1]) || (msg.type == "payload" && !msg.params.type)) return sendHelp(msg, user);

        let type = msg.type == "cmd" ? msg.match[1] : msg.params.type;

        if (isNaN(parseInt(type)) || (type > 4 || type < 1)) return sendHelp(msg, user, true);

        if (type == 1) {
            if (user.money < 1000000) return msg.send(`🚫 У вас нет $1,000,000 для открытия кейса\n💰 Баланс: ${numberWithCommas(user.money)}$`);
            user.money -= 1000000;

            let item = randElement(case_items);

            msg.send(`${msg.prefix}с кейса с оружиями выпало: ${item.name} 🎉`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "🔄 Открыть еще раз",
                        payload: {
                            command: "case",
                            params: {
                                type: 1
                            }
                        },
                        color: Keyboard.POSITIVE_COLOR
                    }),
                    Keyboard.textButton({
                        label: "⬅ Назад",
                        payload: {
                            command: "case",
                            params: {
                                type: 0
                            }
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ]).inline()
            });

            if (user.guns[item.name]) return user.guns[item.name].count++;
            item.count = 1;
            user.guns[item.name] = item;
        } else if (type == 2) {
            let cantOpenFree = true;
            if (user.bonusinv) {
                if (user.bonusinv.vip_case != null) {
                    user.bonusinv.vip_case--;
                    cantOpenFree = false;
                    if (!user.bonusinv.vip_case) delete user.bonusinv.vip_case;
                }
            }

            if (cantOpenFree) {
                if (user.status.type == 0) return msg.send(`🚫 Данный кейс могут открывать пользователи с V.I.P. статус\n🌐 Приобрести можно на pocketbot.ru`);
                if (user.money < 10000000) return msg.send(`🚫 У вас нет $10.000.000 для открытия V.I.P. кейса\n💰 Баланс: ${numberWithCommas(user.money)}$`);
                user.money -= 10000000;
            }

            let item = randElement(vipcase);

            msg.send(`${msg.prefix}с кейса с V.I.P. оружиями выпало: ${item.name} 🎉`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "🔄 Открыть еще раз",
                        payload: {
                            command: "case",
                            params: {
                                type: 2
                            }
                        },
                        color: Keyboard.POSITIVE_COLOR
                    }),
                    Keyboard.textButton({
                        label: "⬅ Назад",
                        payload: {
                            command: "case",
                            params: {
                                type: 0
                            }
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ]).inline()
            });

            if (user.guns[item.name]) return user.guns[item.name].count++;
            item.count = 1;
            user.guns[item.name] = item;
        } else if (type == 3) {
            if (user.money < 10000000) return msg.send(`🚫 У вас нет $10.000.000 для открытия кейса\n💰 Баланс: ${numberWithCommas(user.money)}$`);
            if (!(user.cars.length < 1 || (user.status.type == 1 && user.cars.length < 3) || ((user.status.type >= 2) && user.cars.length < 10))) return msg.send(`🚫 Ваш гараж полон`);
            user.money -= 10000000;

            let item = car();
            user.cars.push(item);

            msg.send(`${msg.prefix}с кейса выпало:\n` +
                `🚘 ${item.brand} ${item.model}\n` +
                `🚀 Максимальная скорость: ${item.max}км/час\n` +
                `🌎 Пробег: ${numberWithCommas(item.prob)}км\n` +
                `🚘 Класс: ${item.class}\n` +
                `🚦 Разгон до 100: ${item.acc}сек.\n` +
                `⚙ Вес: ${item.weight}кг\n` +
                `💡 Редкость: ${rareToStr(item.rare)}`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "🔄 Открыть еще раз",
                        payload: {
                            command: "case",
                            params: {
                                type: 3
                            }
                        },
                        color: Keyboard.POSITIVE_COLOR
                    }),
                    Keyboard.textButton({
                        label: "⬅ Назад",
                        payload: {
                            command: "case",
                            params: {
                                type: 0
                            }
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ]).inline()
            });
        } else if (type == 4) {
            if (!user.newYear) return;

            let cantOpenFree = true;
            if (user.newYear.cases) {
                user.newYear.cases--;
                cantOpenFree = false;
            }

            if (cantOpenFree) {
                if (user.newYear.coins < 500000) return msg.send(`🚫 У вас нет 500,000 ❄ для открытия кейса\n💰 Баланс: ${numberWithCommas(user.newYear.coins)} ❄`);
                user.newYear.coins -= 500000;
            }

            let prizes = [
                { n: "gold" },
                { n: "pockecoins" },
                { n: "cupon", type: "work" },
                { n: "cupon", type: "business" },
                { n: "cupon", type: "bah" }
            ];
            if (user.clan) {
                await clanFromDb(user.clan);
                if (clans[user.clan].boost == null || clans[user.clan].boost.biz.indexOf(5) == -1) prizes.push({ n: "clan_biz" });
            }

            let item = randElement(prizes),
                text;

            if (item.n == "gold") {
                let mns = [100, 300],
                    mn = randElement(mns);

                user.gold += mn;
                text = `🥇 ${numberWithCommas(mn)} золота`;
            } else if (item.n == "pockecoins") {
                let mns = [333333, 111111, 3333333, 1111111, 999999, 9999999],
                    mn = randElement(mns);

                user.coins += mn;
                text = `💳 ${numberWithCommas(mn)} pockecoins`;
            } else if (item.n == "clan_biz") {
                if (clans[user.clan].boost == null) clans[user.clan].boost = {
                    biz: [],
                    lastCheck: +new Date()
                };
                clans[user.clan].boost.biz.push(5);
                text = `Клановый бизнес "🎆 Завод фейерверков"`;
            } else if (item.n == "cupon") {
                if (!user.newYear.coupons[item.type]) user.newYear.coupons[item.type] = 0;
                user.newYear.coupons[item.type]++;
                text = `🎟 Купон "${item.type.replace("work", "Уменьшенное время для работы").replace("bah", "Увеличение количества бахов на 2 очка каждый бах").replace("business", "Все бизнесы приносят прибыль х2")}" ${randElement(["🙈", "🎄", "🐾", "🌸"])}\n` +
                    `❔ Написав команду «купоны» вы увидите ещё не активированные купоны`;
            }

            msg.send(`${msg.prefix}с кейса снежинок выпало: ${text}`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "🔄 Открыть еще раз",
                        payload: {
                            command: "case",
                            params: {
                                type: 4
                            }
                        },
                        color: Keyboard.POSITIVE_COLOR
                    }),
                    Keyboard.textButton({
                        label: "⬅ Назад",
                        payload: {
                            command: "case",
                            params: {
                                type: 0
                            }
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ]).inline()
            });
        }
    }
}