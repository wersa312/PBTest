const { getRandomId } = require("vk-io");
const { vkFromDb } = require("../../api/acc");
const { clanFromDb } = require("../../api/clan");
const { log } = require("../../api/logs");
const { randElement, numberWithCommas, getRandomInt } = require("../../api/utils");
const { clans, app, users, vkGroup } = require("../../main");

app.get("/api/callback", async (req, res) => {
    res.end("ok");
    let data = req.query,
        id = data.from_id;

    await vkFromDb(id);
    if (!users[id]) return;
    if (users[id].newYear) return;

    users[id].newYear = {
        coins: users[id].halloweenCoins ? users[id].halloweenCoins : 0,
        gifts: 5,
        coupons: {},
        activeCoupons: {},
        triggers: {
            first: false
        },
        santaLastTime: 0,
        cases: 0
    }
    vkGroup.api.messages.send(
        {
            message: `👋 Дорогой игрок, рад видеть то, что тебя заинтересовал наш новогодний ивент 🎄\n` +
                `❔ Как же узнать что мы приготовили для тебя? Все просто, написав команду "Новый год" тебе откроется весь ивент ❄\n` +
                `🎊 С${new Date().getMonth() ? " наступающим" : ''} Новым годом ❤\n`,
            random_id: getRandomId(),
            user_id: id
        }
    );
})

module.exports = [
    {
        r: /^\.раздача$/i,
        enabled: false,
        async f(msg, user) {

        }
    },
    {
        r: /^новый год$/i,
        f(msg, user) {
            if (!user.newYear) return;

            let mn_gived = false;
            if (!user.newYear.triggers.first) {
                user.newYear.coins += 10000;
                user.newYear.triggers.first = true;
                mn_gived = true;
            }

            msg.send(
                `🙋‍♀ Снова здравствуй, ты продолжил изучать ивент, чему мы очень рады 🥰\n` +
                (mn_gived ? `🎁 И за это ты получаешь 10,000 ❄\n` : '') +

                `\n🤗 Давай же перейдём к командам ☃\n` +
                `⠀🔹 Команда «Нг» - введя её ты можешь получить подарок в Новый год от нас 💞\n` +
                `⠀🔹 Команда «Подарок» отправит подарок вашему другу/подруге\n` +
                `⠀🔹 Введя команду «Нмагазин» вы окажетесь в новогоднем магазине, где сможете приобрести что-то за ❄.\n\n` +

                `❔ Как же получить снежинки?\n` +
                `⠀🔹 Введя команду «Работа санта» вы получите определённое количество ❄.\n` +
                `⠀🔹 А так же, купив фабрику подарков, вы сможете ежечасно получать какое-то количество ❄.`
            );
        }
    },
    {
        r: /^нг$/i,
        async f(msg, user) {
            if (!user.newYear) return;

            if (new Date().getMonth()) {
                user.newYear.needGift = 1;
                msg.send(`${msg.prefix}надеюсь, ты хорошо вел себя весь год! 🤶\n` +
                    `😍 Ты активировали свой подарок от нас, но узнать что-же за подарок, вы сможете после 31 декабря, написав повторно команду «Нг»`);
            } else if (user.newYear.needGift) {
                if (user.newYear.needGift == 2) return msg.send(`${msg.prefix}ты уже получил свой подарок ${randElement(["🥰", "🤗", "😉"])}`);
                user.newYear.needGift = 2;
                let text = [],
                    prizes = [
                        "snow",
                        "biz",
                        "gold",
                        "snow_case",
                        "money",
                        "pockecoins"
                    ];

                if (user.clan) prizes.push("clan_points");

                prizes = randElement(prizes, 5);
                for (let i in prizes) {
                    let prize = prizes[i];

                    if (prize == "snow") {
                        let snowInt = getRandomInt(5000, 50000);

                        user.newYear.coins += snowInt;
                        text.push(`❄ ${numberWithCommas(snowInt)} снежинок`);
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
                        text.push(`🎁 Фабрика подарков (x${randBiz})`);
                    }
                    if (prize == "gold") {
                        let mns = [1001, 500, 300],
                            mn = randElement(mns);

                        user.gold += mn;
                        text.push(`🥇 ${numberWithCommas(mn)} золота`);
                    }
                    if (prize == "clan_points") {
                        await clanFromDb(user.clan);
                        clans[user.clan].points += 5;
                        text.push(`💡 5 очков клану`);
                    }
                    if (prize == "snow_case") {
                        let mn = getRandomInt(2, 5);

                        user.newYear.cases += mn;
                        text.push(`☃ ${numberWithCommas(mn)} снежных кейса`);
                    }
                    if (prize == "money") {
                        let mns = [33333333333, 11111111111, 333333333333, 111111111111, 99999999999, 999999999999],
                            mn = randElement(mns);

                        user.money += mn;
                        text.push(`💸 Игровая валюта (${numberWithCommas(mn)}$)`);
                    }
                    if (prize == "pockecoins") {
                        let mns = [333333, 111111, 3333333, 1111111, 999999, 9999999],
                            mn = randElement(mns);

                        user.coins += mn;
                        text.push(`💳 ${numberWithCommas(mn)} pockecoins`);
                    }
                }

                log(msg.senderId, "Открыл подарок и получил: " + text.join(", "));
                msg.send(`${msg.prefix}поздравляем вас с новым годом! 🎊\n🎁 Примите наши подарки:\n${text.join("\n")}`,
                    {
                        attachment: randElement(["-178960148_457239046", "photo-178960148_457239047", "photo-178960148_457239048", "photo-178960148_457239049", "photo-178960148_457239050"])
                    });
            } else {
                msg.send(`😉 Уже поздно получать подарки, но не расстраивайся, ты все ещё можешь получить подарки от друзей`);
            }
        }
    }
]