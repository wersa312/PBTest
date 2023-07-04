const { numberToSmile, timeFormat } = require("../../api/utils");

module.exports = [
    {
        r: /^купон(ы)?$/i,
        f(msg, user) {
            if (!user.newYear) return;

            let cupons = Object.keys(user.newYear.coupons);
            let active = Object.keys(user.newYear.activeCoupons);
            if (!cupons.length) return msg.send(`${msg.prefix}у вас нет купонов`);

            active.forEach(a => {
                if (user.newYear.activeCoupons[a] + 3600000 < +new Date()) {
                    delete user.newYear.activeCoupons[a];
                } else {
                    if (cupons.indexOf(a) == -1) cupons.push(a)
                }
            });

            msg.send(
                `${msg.prefix}${active.length >= cupons.length ? "вы активировали все купоны:" : `у вас есть ${cupons.length - active.length} неактивированных купонов:`}\n` +
                cupons.map((c, i) =>
                    `⠀${numberToSmile(i + 1)} ${user.newYear.activeCoupons[c] ? "🔸" : "🔹"} ${c.replace("work", "Уменьшенное время для работы").replace("bah", "Увеличение количества бахов на 2 очка каждый бах").replace("business", "Все бизнесы приносят прибыль х2")} (x${(user.newYear.coupons[c] ? user.newYear.coupons[c] : "0")}) ${user.newYear.activeCoupons[c] ? `[${timeFormat(Math.round(((user.newYear.activeCoupons[c] + 3600000) - (+new Date())) / 1000))}]` : ""}`
                ).join("\n") + "\n\n" +
                `${active.length < cupons.length ? `🔹 - неактивные купоны\n🎁 Вы можете активировать их «Купон [номер]»` : ''}`
            );
        }
    },
    {
        r: /^купон ([1-3])$/i,
        f(msg, user) {
            if (!user.newYear) return;

            let cupons = Object.keys(user.newYear.coupons),
                n = parseInt(msg.match[1]) - 1;

            if (!cupons[n]) return msg.send("🚫 У вас нет такого купона");

            let cupon = cupons[n];

            if (user.newYear.activeCoupons[cupon]) {
                if (user.newYear.activeCoupons[cupon] + 3600000 > +new Date()) return msg.send(`🚫 ${msg.prefix}данный купон уже активирован`);
            }

            user.newYear.activeCoupons[cupon] = +new Date();
            user.newYear.coupons[cupon]--;
            if (!user.newYear.coupons[cupon]) delete user.newYear.coupons[cupon];

            msg.send(
                `${msg.prefix}вы активировали купон "${cupon.replace("work", "Уменьшенное время для работы").replace("bah", "Увеличение количества бахов на 2 очка каждый бах").replace("business", "Все бизнесы приносят прибыль х2")}"\n` +
                `🕒 Время действия 1 час`
            );
        }
    }
]