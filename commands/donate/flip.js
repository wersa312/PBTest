const { numberWithCommas } = require("../../api/utils");

module.exports = [
    {
        r: /^(flip|флип|фейк баланс)( .*)?$/i,
        status: 2,
        f(msg, user) {
            if (user.flip) {
                delete user.flip;
                msg.send(`✅ Фейковый баланс выключен`);
            } else {
                user.flip = true;
                if (user.testmoney == null) user.testmoney = 0;
                msg.send(`✅ Фейковый баланс включен\n❔ Что бы изменить баланс, введите "Деньги [сумма]"`);
            }
        }
    },
    {
        r: /^деньги(?: ([\S]+))?$/i,
        status: 2,
        f(msg, user) {
            if (!user.flip) return msg.send(`🚫 Сперва включите фейковый баланс. Команда: flip`);

            let money = parseInt(msg.match[1].replace(/k|к/gi, "000"));
            if (isNaN(money)) return msg.send(`🚫 Введите валидное число`);

            user.testmoney = money;
            msg.send(`✅ Установлен баланс: ${numberWithCommas(money)}$`);
        }
    }
]