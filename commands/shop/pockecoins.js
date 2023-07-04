let { course } = require("../../api/pockecoins"),
    { numberWithCommas } = require("../../api/utils"),
    { log } = require("../../api/logs");

module.exports = [
    {
        r: /^коины$/i,
        f(msg, user) {
            msg.send(`${msg.prefix}у вас ${numberWithCommas(user.coins ? user.coins : 0)} Pockecoins\n🔼 Для покупки, напишите: Коины купить [кол-во]\n🔽 Для продажи, напишите: Коины продать [кол-во]`);
        }
    },
    {
        r: /^(купить коины|коины купить)( (.*))?$/i,

        f(msg, user) {
            if (!msg.match[3]) return msg.send(`🚫 Вы не указали число для приобретения\n✏ Купить коины [число]`);

            let bufc = course.course,
                coins = parseInt(msg.match[3].replace(/все|всё/, Math.floor(user.money / bufc)).replace(/(k|к)/gi, "000"));

            if (isNaN(coins) || coins < 1) return msg.send(`🚫 Вы не указали правильное число для приобретения\n✏ Купить коины [число]`);
            if (user.money < (coins * bufc)) return msg.send(`🚫 У вас нет ${numberWithCommas(coins * bufc)}$ для приобретения ${numberWithCommas(coins)} pockecoins\n💰 Баланс: ${numberWithCommas(user.money)}$`);

            user.money -= coins * bufc;
            user.coins += coins;

            msg.send(`${msg.prefix}вы приобрели ${numberWithCommas(coins)} pockecoins (-${numberWithCommas(coins * bufc)}$)\n💳 Pockecoins: ${numberWithCommas(user.coins)}\n💰 Баланс: ${numberWithCommas(user.money)}$`);

            log(user.vk, `Купил ${numberWithCommas(coins)} pockecoins на ${numberWithCommas(coins * bufc)}$`);
        }
    },
    {
        r: /^(продать коины|коины продать)( (.*))?$/i,

        f(msg, user) {
            if (!msg.match[3]) return msg.send(`🚫 Вы не указали число для продажи\n✏ Продать коины [число]`);

            let bufc = course.course,
                coins = parseInt(msg.match[3].replace(/все|всё/, Math.floor(user.coins)).replace(/(k|к)/gi, "000"));

            if (isNaN(coins) || coins < 1) return msg.send(`🚫 Вы не указали правильное число для продажи\n✏ Продать коины [число]`);
            if (user.coins < coins) return msg.send(`🚫 У вас нет ${numberWithCommas(coins)} pockecoins\n💳 Pockecoins: ${numberWithCommas(user.coins)}`);

            user.money += coins * bufc;
            user.coins -= coins;

            msg.send(`${msg.prefix}вы продали ${numberWithCommas(coins)} pockecoins (+${numberWithCommas(coins * bufc)}$)\n💳 Pockecoins: ${numberWithCommas(user.coins)}\n💰 Баланс: ${numberWithCommas(user.money)}$`);

            log(user.vk, `Продал ${numberWithCommas(coins)} pockecoins на ${numberWithCommas(coins * bufc)}$`);
        }
    }
]