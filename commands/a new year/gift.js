const { getRandomId, Keyboard } = require("vk-io");
const { vkId, vkFromDb } = require("../../api/acc");
const { clanFromDb } = require("../../api/clan");
const { log } = require("../../api/logs");
const { declOfNum, getRandomInt, randElement, numberWithCommas } = require("../../api/utils");
const { users, vkGroup, clans } = require("../../main");

module.exports = [
    {
        r: /^подарок$/i,
        f(msg, user) {
            if (!user.newYear) return;
            msg.send(
                `🎁 Для того, чтобы порадовать своих друзей/знакомых и отправить им подарок введите команду «Подарок [ID/Ссылка]» ☃\n` +
                `🕴 А так же, вы можете выбрать, анонимно или нет, отправятся ваши подарки\n` +
                `❔ «Подарок [ID/ссылка] анон», таким образом, получатель не узнает кто отправил подарок 🎁.`
            );
        }
    },

    {
        r: /^подарок ([\S]+)( анон)?$/i,
        async f(msg, user) {
            if (!user.newYear) return;
            if (!user.newYear.gifts) return msg.send(`${msg.prefix}вы отправили все свои подарки`);

            let id = await vkId(msg.match[1]),
                anon = !!msg.match[2];

            await vkFromDb(id);

            if (!users[id]) return msg.send(`${msg.prefix}игрок не найден`);
            if (id == msg.senderId) return msg.send(`${msg.prefix}нельзя сделать самому себе подарок`);
            let user2 = users[id];

            if (user2.gifts == null) user2.gifts = [];
            if (user2.gifted == null) user2.gifted = {};
            if (user2.gifted[msg.senderId]) return msg.send(`${msg.prefix}Вы уже делали подарок данному игроку`);

            user2.gifts.push(msg.senderId);
            user2.gifted[msg.senderId] = true;
            user.newYear.gifts--;

            msg.send(
                `${msg.prefix}Вы${anon ? " анонимно" : ""} отправили @id${id} (${user2.nick}) подарок 🎁\n` +
                `🎁 Вы можете сделать еще ${user.newYear.gifts} ${declOfNum(user.newYear.gifts, ["подарок", "подарка", "подарков"])}`
            );
            vkGroup.api.messages.send({
                user_id: id,
                message: "🎁 " + randElement(["Привет! ", "Здравствуй! "]) + (anon ? `Пришел анонимный новогодний подарок` : `Пришел новогодний подарок от игрока @id${msg.senderId} (${user.nick})`),
                random_id: getRandomId(),
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "🎁 Подарки",
                        payload: {
                            command: "gifts"
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ]).inline()
            })
        }
    },

    {
        r: /^подарки$/i,
        payload: "gifts",
        async f(msg, user) {
            if (!user.gifts || !user.gifts.length) return msg.send(`🙁 У вас нет подарков :(`);
            let gifts = user.gifts.length; //${declOfNum(gifts, ["подарок", "подарка", "подарков"])}
            msg.send(
                `🥰 Вам подарили ${gifts} 🎁!\n` +
                "❄ Вы сможете открыть их после Нового года командой «Открыть подарок»",
                {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: "❔ Что в подарках",
                            payload: { command: "gifts_help" },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]).inline()
                }
            )
        }
    },

    {
        r: /^что в подарках$/i,
        payload: "gifts_help",
        async f(msg) {
            msg.send(
                `${msg.prefix}из подарка может выпасть:\n` +
                "⠀🔹 Снежинки ❄\n" +
                "⠀🔹 Фабрики подарков ☃\n" +
                "⠀🔹 Золото 🥇\n" +
                "⠀🔹 Очки клану 😍\n" +
                "⠀🔹 Кейс снежинок 🌨\n" +
                "⠀🔹 Валюта 🌸\n" +
                "⠀🔹 Pockecoins 💳\n" +
                "⠀🔹 И нескольким счастливчикам могут выпасть привелегии"
            );
        }
    },

    {
        r: /^открыть подарок$/i,
        async f(msg, user) {
            if (!user.newYear) return;
            if (new Date().getMonth()) return msg.send(`${msg.prefix}подарки можно открыть в новом году`);
            if (!user.gifts || !user.gifts.length) return msg.send(`🙁 У вас нет подарков :(`);

            user.gifts.splice(0, 1);

            let prizes = [
                "snow",
                "biz",
                "gold",
                "snow_case",
                "money",
                "pockecoins"
            ];

            if (user.clan) prizes.push("clan_points");

            let prize = randElement(prizes),
                text;

            if (prize == "snow") {
                let snowInt = getRandomInt(5000, 50000);

                user.newYear.coins += snowInt;
                text = `❄ ${numberWithCommas(snowInt)} снежинок`;
            }
            if (prize == "biz") {
                if (!user.business["фабрика"]) user.business["фабрика"] = {
                    tax: 0,
                    count: 0,
                    time: +new Date(),
                    money: 0,
                    items: 0
                };

                let randBiz = getRandomInt(3, 5);
                user.business["фабрика"].count += randBiz;
                text = `🎁 Фабрика подарков (x${randBiz})`;
            }
            if (prize == "gold") {
                let mns = [1001, 500, 300],
                    mn = randElement(mns);

                user.gold += mn;
                text = `🥇 ${numberWithCommas(mn)} золота`;
            }
            if (prize == "clan_points") {
                await clanFromDb(user.clan);
                clans[user.clan].points += 5;
                text = `💡 5 очков клану`;
            }
            if (prize == "snow_case") {
                let mn = getRandomInt(2, 5);

                user.newYear.cases += mn;
                text = `☃ ${numberWithCommas(mn)} снежных кейса`;
            }
            if (prize == "money") {
                let mns = [33333333333, 11111111111, 333333333333, 111111111111, 99999999999, 999999999999],
                    mn = randElement(mns);

                user.money += mn;
                text = `💸 Игровая валюта (${numberWithCommas(mn)}$)`;
            }
            if (prize == "pockecoins") {
                let mns = [33333, 11111, 333333, 111111, 99999, 999999],
                    mn = randElement(mns);

                user.coins += mn;
                text = `💳 ${numberWithCommas(mn)} pockecoins`;
            }

            log(msg.senderId, "Открыл подарок и получил: " + text);
            msg.send(`${msg.prefix}Ура! Вам выпало ${text} 🎊\nС Новым годом 🎆`,
                {
                    attachment: randElement(["-178960148_457239046", "photo-178960148_457239047", "photo-178960148_457239048", "photo-178960148_457239049", "photo-178960148_457239050"])
                });
        }
    }
]