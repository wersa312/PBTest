const { randElement, getRandomInt, numberWithCommas, timeFormat } = require("../../api/utils");

module.exports = {
    r: /^работа санта$/i,
    f(msg, user) {
        if (user.newYear) {
            let cd = 3;

            if (user.newYear.activeCoupons["work"]) {
                if (user.newYear.activeCoupons["work"] + 3600000 > +new Date()) {
                    cd = 1.5;
                } else {
                    delete user.newYear.activeCoupons["work"];
                }
            }

            let timeDelta = (user.newYear.santaLastTime + (cd * 60 * 1000)) - (+new Date());

            if (timeDelta > 0) return msg.send(`🚫 Подождите ${timeFormat(Math.round(timeDelta / 1000))}`);

            let payed = getRandomInt(3000, 21000);

            user.newYear.coins += payed;
            user.newYear.santaLastTime = +new Date();
            msg.send(
                `${msg.prefix}${randElement([
                    `Вы помогли Санте собрать ${randElement([5, 10, 15, 20, 30])} подарков, Санта заплатил вам ${numberWithCommas(payed)} ❄`,
                    `Вы собрали упряжку оленей и получили за это ${numberWithCommas(payed)} ❄`,
                    `Санта потерял подарки которые вы сделали, но вы нашли их, за помощь Санта заплатил вам ${numberWithCommas(payed)} ❄`
                ])}\n` +
                `🎅 Работа: на Санту\n` +
                `❄ Снежинок: ${numberWithCommas(user.newYear.coins)}`
            );
        }
    }
};