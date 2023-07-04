const request = require("request");
const { log } = require("../../api/logs");
const { numberWithCommas } = require("../../api/utils");

module.exports = [
    {
        r: /^пополнить$/,
        f(msg, user) {
            return msg.send("🚫 Пополнение VK Coin временно не работает");
            request.get("http://188.225.82.150/getlink", function (e, h, b) {
                try {
                    b = JSON.parse(b);
                    msg.send("💬 Ссылка на пополнение VK Coin: " + b.msg);
                } catch (e) { }
            });
        }
    },
    {
        r: /^(продать вк)( (.*))?$/i,

        f(msg, user) {
            if (!msg.match[3]) return msg.send(`🚫 Вы не указали число для продажи\n✏ Продать коины [число]`);
            if (user.vkcoin == null) user.vkcoin = 0;

            let bufc = 10000,
                coins = parseInt(msg.match[3].replace(/все|всё/, Math.floor(user.vkcoin)).replace(/(k|к)/gi, "000"));

            if (isNaN(coins) || coins < 1) return msg.send(`🚫 Вы не указали правильное число для продажи\n✏ Продать вк [число]`);
            if (user.vkcoin < coins) return msg.send(`🚫 У вас нет ${numberWithCommas(coins)} VK Coin\n💠 VK Coins: ${numberWithCommas(user.vkcoin)}`);

            user.money += coins * bufc;
            user.vkcoin -= coins;

            log(msg.senderId, `Продал ${coins} VK Coins за ${numberWithCommas(coins * bufc)}$ | Баланс: ${numberWithCommas(user.money)}$`)
            msg.send(`${msg.prefix}вы продали ${numberWithCommas(coins)} VK Coins (+${numberWithCommas(coins * bufc)}$)\n💠 VK Coin: ${numberWithCommas(user.vkcoin)}\n💰 Баланс: ${numberWithCommas(user.money)}$`);
        }
    }
]