const { log } = require("../../api/logs");
const { numberWithCommas } = require("../../api/utils"),
    bet = require("../../api/bet"),
    { chats, Keyboard, users } = require("../../main"),
    { vkFromDb } = require("../../api/acc");

module.exports = [
    {
        payload: 'casino_stop',
        f(msg) {
            let chat = chats[msg.chatId];
            casinoStop(msg, chat);
        }
    },
    {
        r: /^казино( (.*))?$/i,
        f(msg, user) {
            if (msg.isFromUser) return bet(msg, user);

            let chat = chats[msg.chatId];

            if (!chat.settings.games.casino) return;
            if (msg.match[2] && msg.match[2] == "стоп") return casinoStop(msg, chat);
            if (msg.match[2] && msg.match[2].startsWith("коины")) return vkCoinCasino(msg, chat);
            return commonCasino(msg, chat);
        }
    },
    {
        r: /^поставить(?: ([\S]+))?/i,
        payload: "casino_bet",

        f(msg, user) {
            if (msg.isFromUser) return msg.send(`🚫 Данная команда доступна только в беседе`);
            if (!chats[msg.chatId].casino) return msg.send(`🚫 ${msg.prefix}казино не запущено`);
            if (!chats[msg.chatId].settings.games.casino) return;

            let casino = chats[msg.chatId].casino,
                mn = (chats[msg.chatId].casino.type == "vkcoin" ? "vkcoin" : "money"),
                sign = (mn == "vkcoin" ? " VK Coins" : "$");

            if (casino.fixed) {
                if (casino.puts[msg.senderId]) return msg.send(`🚫 ${msg.prefix}Вы уже делали ставку`);
                if (user[mn] < casino.fixed) return msg.send(`🚫 ${msg.prefix}У вас нет столько денег\n💰 На руках: ${numberWithCommas(user[mn])}${sign}`);

                casino.puts[msg.senderId] = casino.fixed;
                user[mn] -= casino.fixed;
                log(msg.senderId, `Поставил в казино [${msg.chatId}] ${numberWithCommas(casino.fixed)} ${mn}`);

                let bank = 0;
                for (let i in casino.puts) {
                    bank += casino.puts[i]
                }

                msg.send(`🎰 ${msg.prefix}Вы поставили ${numberWithCommas(casino.puts[msg.senderId])}${sign} в казино\n💰 Общая ставка: ${numberWithCommas(bank)}${sign}`, {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: '🎰 Стоп',
                            payload: {
                                command: 'casino_stop'
                            },
                            color: Keyboard.POSITIVE_COLOR
                        })
                    ]).inline()
                });
            } else {
                if (msg.type == "cmd") {
                    if (!msg.match[1]) return msg.send(`🚫 ${msg.prefix}Вы не указали сумму для ставки\n📝 Поставить [сумма]`);
                    let money = Number(msg.match[1].replace(/все|всё/i, user[mn]).replace(/k|к/g, "000"));
                    if (isNaN(money)) return msg.send(`🚫 ${msg.prefix}Вы не указали сумму для ставки\n📝 Поставить [сумма]`);
                    if (money < 1) return msg.send(`🚫 ${msg.prefix}ставка должна быть больше 1${sign}`);

                    if (user[mn] < money) return msg.send(`🚫 ${msg.prefix}у вас нет ${numberWithCommas(money)}${sign}\n💰 Баланс: ${numberWithCommas(user[mn])}${sign}`);

                    if (!casino.puts[msg.senderId]) casino.puts[msg.senderId] = 0;
                    casino.puts[msg.senderId] += money;
                    user[mn] -= money;
                    log(msg.senderId, `Поставил в казино [${msg.chatId}] ${numberWithCommas(money)} ${mn}`);

                    let bank = 0;
                    for (let i in casino.puts) {
                        bank += casino.puts[i]
                    }

                    msg.send(`🎰 ${msg.prefix}ваша ставка - ${numberWithCommas(casino.puts[msg.senderId])}${sign}\n💰 Общая ставка: ${numberWithCommas(bank)}${sign}`, {
                        keyboard: Keyboard.keyboard([
                            Keyboard.textButton({
                                label: '🎰 Стоп',
                                payload: {
                                    command: 'casino_stop'
                                },
                                color: Keyboard.POSITIVE_COLOR
                            })
                        ]).inline()
                    });
                } else {
                    if (user[mn] < 1) return msg.send(`🚫 У вас нет ${mn == "vkcoin" ? "коинов" : "денег"}`);

                    if (!casino.puts[msg.senderId]) casino.puts[msg.senderId] = 0;
                    casino.puts[msg.senderId] += user[mn];
                    log(msg.senderId, `Поставил в казино [${msg.chatId}] ${numberWithCommas(user[mn])} ${mn}`);
                    user[mn] = 0;

                    let bank = 0;
                    for (let i in casino.puts) {
                        bank += casino.puts[i]
                    }

                    msg.send(`🎰 ${msg.prefix}ваша ставка - ${numberWithCommas(casino.puts[msg.senderId])}${sign}\n💰 Общая ставка: ${numberWithCommas(bank)}${sign}`, {
                        keyboard: Keyboard.keyboard([
                            Keyboard.textButton({
                                label: '🎰 Стоп',
                                payload: {
                                    command: 'casino_stop'
                                },
                                color: Keyboard.POSITIVE_COLOR
                            })
                        ]).inline()
                    });
                }
            }
        }
    }]

function vkCoinCasino(msg, chat) {
    if (!chat.casino) {
        let text = msg.text.split(" "),
            money = (text[2] ? text[2] : false);

        if (money && (isNaN(parseInt(money)) || parseInt(money) < 1)) return msg.send(`🚫 ${msg.prefix}Указано невалидное число\n✏ Казино коины [сумма]`);

        chat.casino = {
            puts: {},
            type: "vkcoin",
            fixed: (money ? parseInt(money) : 0)
        };

        msg.send(`🎰 Казино на VK Coin запущено${money ? `\n💸 Фиксированная ставка: ${numberWithCommas(parseInt(money))}$` : "\n✏ Введите \"Поставить [сумма]\""}\n▶ Чтобы определить победителя, напишите "Казино стоп"`, {
            keyboard: Keyboard.keyboard([
                [
                    Keyboard.textButton({
                        label: '▶ Поставить' + (money ? "" : " всё"),
                        payload: {
                            command: 'casino_bet',
                            money: (money ? parseInt(money) : 0)
                        },
                        color: Keyboard.PRIMARY_COLOR
                    }),
                    Keyboard.textButton({
                        label: '🎰 Стоп',
                        payload: {
                            command: 'casino_stop'
                        },
                        color: Keyboard.POSITIVE_COLOR
                    })
                ]
            ]).inline()
        });
    }
}

function commonCasino(msg, chat) {
    if (!chat.casino) {
        let text = msg.text.split(" "),
            money = (text[1] ? text[1].replace(/k|к/gi, "000") : false);

        if (money && (isNaN(parseInt(money)) || parseInt(money) < 1)) return msg.send(`🚫 ${msg.prefix}указано невалидное число\n✏ Казино [сумма]`);

        chat.casino = {
            puts: {},
            type: "money",
            fixed: (money ? parseInt(money) : 0)
        };

        msg.send(`🎰 Казино запущено${money ? `\n💸 Фиксированная ставка: ${numberWithCommas(parseInt(money))}$` : "\n✏ Введите \"Поставить [сумма]\""}\n▶ Чтобы определить победителя, напишите "Казино стоп"`, {
            keyboard: Keyboard.keyboard([
                [
                    Keyboard.textButton({
                        label: '▶ Поставить' + (money ? "" : " всё"),
                        payload: {
                            command: 'casino_bet',
                            money: (money ? parseInt(money) : 0)
                        },
                        color: Keyboard.PRIMARY_COLOR
                    }),
                    Keyboard.textButton({
                        label: '🎰 Стоп',
                        payload: {
                            command: 'casino_stop'
                        },
                        color: Keyboard.POSITIVE_COLOR
                    })
                ]
            ]).inline()
        });
    } else {
        msg.send(`🚫 Казино уже запущено`);
    }
}

async function casinoStop(msg, chat) {
    if (!chat.casino) return;

    let casino = JSON.parse(JSON.stringify(chat.casino));
    delete chat.casino;

    if (Object.keys(casino.puts).length == 0) {
        return msg.send("❗ Игра отменена");
    }

    await vkFromDb(Object.keys(casino.puts));

    let bank = 0;
    for (let i in casino.puts) {
        bank += casino.puts[i];
    }

    let rand = Math.floor(Math.random() * bank),
        i = 0,
        a = Object.keys(casino.puts).sort((a, b) => casino.puts[a] - casino.puts[b]);

    for (let s = casino.puts[a[0]]; s <= rand; s += casino.puts[a[i]]) {
        i++;
    }

    let winner = a[i];

    if (casino.type == "vkcoin") {
        msg.send(`👑 Выиграл(а) @id${winner} (${users[winner].nick})\n💰 Выигранная сумма - ${numberWithCommas(bank)} VK Coin`);
        users[winner].vkcoin += bank;
    } else {
        msg.send(`👑 Выиграл(а) @id${winner} (${users[winner].nick})\n💰 Выигранная сумма - ${numberWithCommas(bank)}$`);
        users[winner].money += bank;
        log(winner, `Выиграл в казино ${numberWithCommas(bank)}$`)
    }

    return;
}