const { numberWithCommas } = require("../../api/utils"),
    { log } = require("../../api/logs"),
    { Keyboard } = require("../../main");

module.exports = [
    {

        r: /^б+а+н+к+$/i,
        payload: "bank",
        f(msg, user) {
            let params = {};
            if (user.menu && msg.isFromUser) {
                params = {
                    keyboard: Keyboard.keyboard([
                        [
                            Keyboard.textButton({
                                label: '🏧 Положить на счет',
                                payload: {
                                    command: 'getMoneyToBank'
                                },
                                color: Keyboard.POSITIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: '🏧 Снять со счета',
                                payload: {
                                    command: 'getMoneyFromBank'
                                },
                                color: Keyboard.SECONDARY_COLOR
                            })
                        ],
                        [
                            Keyboard.textButton({
                                label: '◀ К профилю',
                                payload: {
                                    command: 'profile'
                                },
                                color: Keyboard.PRIMARY_COLOR
                            })
                        ]
                    ])
                }
            } else if (msg.isFromUser) {
                params = {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: '🏧 Положить на счет',
                            payload: {
                                command: 'getMoneyToBank'
                            },
                            color: Keyboard.POSITIVE_COLOR
                        }),
                        Keyboard.textButton({
                            label: '🏧 Снять со счета',
                            payload: {
                                command: 'getMoneyFromBank'
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]).inline()
                }
            }
            let perDayBank = Math.floor(user.bank.money / 100 / 2);
            msg.send(`🏧 На счете банка: ${numberWithCommas(user.bank.money)}$
📈 В день капает: ~${numberWithCommas(perDayBank)}$`, params);
        }
    },
    {

        r: /^б+а+н+к+ с+н+я+т+ь+( ([^\s]+))/i,
        f(msg, user) {
            msg.match[1] = msg.match[1].replace(/все|всё/, user.bank.money).replace(/(k|к)/gi, "000");
            let money = parseInt(msg.match[1]);
            if (isNaN(money)) return msg.send('🚫 Введите число, которое хотите снять с банка\n✏ Банк снять [сумма]');
            if (money < 1) return msg.send('🚫 Введите положительное число, которое хотите снять с банка');
            if (money > user.bank.money) return msg.send("🚫 У вас нет столько денег в банке\n🏧 В банке: " + numberWithCommas(user.bank.money) + "$");
            user.money += money;
            user.bank.money -= money;
            log(msg.senderId, `Снял с банка ${numberWithCommas(money)}$ | Баланс: ${numberWithCommas(user.money)}$`)
            msg.send(`✅ С вашего счета банка снято: ${numberWithCommas(money)}$
🏧 Осталось: ${numberWithCommas(user.bank.money)}$`);
        }
    },
    {

        r: /^б+а+н+к+ п+о+л+о+ж+и+т+ь+( ([^\s]+))/i,
        f(msg, user) {
            msg.match[1] = msg.match[1].replace(/все|всё/, user.money).replace(/(k|к)/gi, "000");
            let money = parseInt(msg.match[1]);
            if (isNaN(money)) return msg.send('🚫 Введите число, которое хотите положить на счет в банке\n✏ Банк положить [сумма]');
            if (money < 1) return msg.send('🚫 Введите положительное число, которое хотите положить на счет в банке');
            if (money > user.money) return msg.send("🚫 У вас нет столько денег\n💰 На руках: " + numberWithCommas(user.money) + "$");
            user.money -= money;
            user.bank.money += money;
            log(msg.senderId, `Пополнил счет банка на ${numberWithCommas(money)}$ | Баланс: ${numberWithCommas(user.money)}$ | Банк: ${numberWithCommas(user.bank.money)}$`);
            msg.send(`✅ На ваш счет положено: ${numberWithCommas(money)}$
🏧 На счету: ${numberWithCommas(user.bank.money)}$`);
        }
    },
    {

        payload: "getMoneyFromBank",
        f(msg, user) {
            user.scene = "getMoneyFromBank";
            msg.send('✏ Введите число, которое хотите снять с банка\n🚫 Для отмены, введите "Отмена"');
        }
    },
    {

        scene: "getMoneyFromBank",
        f(msg, user) {
            if (msg.text) {
                if ((/^отмена/i).test(msg.text)) {
                    msg.send("🚫 Отменено");
                    return user.scene = null;
                }
                msg.text = msg.text.replace(/все|всё/, user.bank.money).replace(/(k|к)/gi, "000");
                let money = parseInt(msg.text);
                if (isNaN(money)) return msg.send('✏ Введите число, которое хотите снять с банка\n🚫 Для отмены, введите "Отмена"');
                if (money < 1) return msg.send('✏ Введите положительное число, которое хотите снять с банка\n🚫 Для отмены, введите "Отмена"');
                if (money > user.bank.money) return msg.send("🚫 У вас нет столько денег в банке\n🏧 В банке: " + numberWithCommas(user.bank.money) + "$\n✏ Введите число меньше для снятия\n\n🚫 Для отмены, введите \"Отмена\"");
                user.money += money;
                user.bank.money -= money;
                user.scene = null;
                log(msg.senderId, `Снял с банка ${numberWithCommas(money)}$ | Баланс: ${numberWithCommas(user.money)}$`)
                msg.send(`✅ С вашего счета банка снято: ${numberWithCommas(money)}$
🏧 Осталось: ${numberWithCommas(user.bank.money)}$`);
            }
        }
    },
    {

        payload: "getMoneyToBank",
        f(msg, user) {
            user.scene = "getMoneyToBank";
            msg.send('✏ Введите число, которое хотите положить на счет банка\n🚫 Для отмены, введите "Отмена"');
        }
    },
    {

        scene: "getMoneyToBank",
        f(msg, user) {
            if (msg.text) {
                if ((/^отмена/i).test(msg.text)) {
                    msg.send("🚫 Отменено");
                    return user.scene = null;
                }
                msg.text = msg.text.replace(/все|всё/, user.money).replace(/(k|к)/gi, "000");
                let money = parseInt(msg.text);
                if (isNaN(money)) return msg.send('✏ Введите число, которое хотите положить на счет банка\n🚫 Для отмены, введите "Отмена"');
                if (money < 1) return msg.send('✏ Введите положительное число, которое хотите положить на счет банка\n🚫 Для отмены, введите "Отмена"');
                if (money > user.money) return msg.send("🚫 У вас нет столько денег\n💰 На руках: " + numberWithCommas(user.money) + "$\n✏ Введите число меньше\n\n🚫 Для отмены, введите \"Отмена\"");
                user.money -= money;
                user.bank.money += money;
                user.scene = null;
                log(msg.senderId, `Пополнил счет банка на ${numberWithCommas(money)}$ | Баланс: ${numberWithCommas(user.money)}$ | Банк: ${numberWithCommas(user.bank.money)}$`);
                msg.send(`✅ На ваш счет положено: ${numberWithCommas(money)}$
🏧 На счету: ${numberWithCommas(user.bank.money)}$`);
            }
        }
    }
];