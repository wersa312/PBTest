const { log } = require("../../api/logs");
const { timeFormat, getRandomInt, numberWithCommas } = require("../../api/utils");

module.exports = [
    {
        r: /^pclan|пклан$/i,
        status: 1,
        f(msg, user) {
            if (user.pclan) {
                delete user.pclan;
                return msg.send("✅ Отображение клана в нике включена");
            } else {
                user.pclan = 1;
                return msg.send("❌ Отображение клана в нике выключена");
            }
        }
    },
    {
        r: /^hack$/i,
        status: 1,
        f(msg, user) {
            if (user.vipMoney + 86400000 > +new Date()) return msg.send(`🎁 Вы уже забрали свой V.I.P. бонус\n` +
                `🕒 Следующий бонус можно забрать через ${timeFormat(86400 - Math.floor((+new Date() - user.vipMoney) / 1000))}`);

            let toGive = getRandomInt(300, 500);
            user.vipMoney = +new Date();
            user.gold += toGive;
            log(msg.senderId, `Получил вип бонус ${numberWithCommas(toGive)} Pockegold`);

            msg.send(`🎁 Ваш V.I.P. бонус: ${numberWithCommas(toGive)} Pockegold`);
        }
    }
]