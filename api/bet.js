const { numberWithCommas } = require("../api/utils"),
    { Keyboard, chats } = require("../main");
const { log } = require("./logs");

module.exports = (msg, user) => {

    if (msg.isChat) {
        if (!chats[msg.chatId].settings.games.bet) return;
    }

    if (msg.type == "cmd" && !msg.match[2]) return msg.send(`🚫 Вы не указали число
✏ Ставка [число]`);

    let money, typemoney = "money";

    if (user.status.type >= 2 && user.flip) {
        typemoney = "testmoney";
    }

    if (msg.type == "cmd") {
        money = parseInt(msg.match[2].replace(/все|всё/, user[typemoney]).replace(/(k|к)/gi, "000"));
    } else if (msg.type == "scene") {
        money = parseInt(msg.text.replace(/все|всё/, user[typemoney]).replace(/(k|к)/gi, "000"));
    } else if (msg.type == "payload") {
        money = parseInt((msg.params + "").replace(/all/, user[typemoney]));
    }

    if (isNaN(money)) return msg.send(`🚫 Вы не указали правильное число
✏ Ставка [число]`);
    if (money < 1) return msg.send(`🚫 Вы не указали правильное число
✏ Ставка [число]`);

    if (user[typemoney] < money) return msg.send(`🚫 У вас нет столько денег
💰 На руках: ${numberWithCommas(user[typemoney])}$`);

    let rand = Math.floor(Math.random() * 10000), x, gift, bmoney;

    if (0 <= rand) x = 7;
    if (11 <= rand) x = 3;
    if (200 <= rand) x = 1.1;
    if (3300 <= rand) x = 1.3;
    if (5501 <= rand) x = 1.5;
    if (6302 <= rand) x = 0;
    if (6701 <= rand) x = 0.75;
    if (8501 <= rand) x = 0.25;

    gift = Math.floor(money * x);
    bmoney = gift - money;
    user[typemoney] = (user[typemoney] - money) + gift;
    if (typemoney == "money") log(msg.senderId, `Сыграл в ставку | Профит: ${numberWithCommas(bmoney)}$ | Баланс: ${numberWithCommas(user[typemoney])}$`)

    let buttons = [];

    if (user[typemoney] > 1000) {
        buttons.push([
            Keyboard.textButton({
                label: numberWithCommas(Math.round((user[typemoney] / 100) * 25)) + "$",
                payload: {
                    command: "bet_game2",
                    params: Math.round((user[typemoney] / 100) * 25)
                },
                color: Keyboard.SECONDARY_COLOR
            }),
            Keyboard.textButton({
                label: numberWithCommas(Math.round((user[typemoney] / 100) * 50)) + "$",
                payload: {
                    command: "bet_game2",
                    params: Math.round((user[typemoney] / 100) * 50)
                },
                color: Keyboard.SECONDARY_COLOR
            })
        ], [
            Keyboard.textButton({
                label: "🔄 Повторить",
                payload: {
                    command: "bet_game2",
                    params: money
                },
                color: Keyboard.PRIMARY_COLOR
            }),
            Keyboard.textButton({
                label: "💰 На все",
                payload: {
                    command: "bet_game2",
                    params: "all"
                },
                color: Keyboard.POSITIVE_COLOR
            })
        ])
    } else if (user[typemoney]) {
        buttons.push([Keyboard.textButton({
            label: numberWithCommas(user[typemoney]) + "$",
            payload: {
                command: "bet_game2",
                params: user[typemoney]
            },
            color: Keyboard.SECONDARY_COLOR
        })
        ]);
    }

    if (msg.isFromUser && user.menu) buttons.push([
        Keyboard.textButton({
            label: "◀ К играм",
            payload: {
                command: "menu",
                params: "games"
            },
            color: Keyboard.PRIMARY_COLOR
        })
    ]);

    msg.send(`${msg.prefix}${bmoney == 0 ? "ваши деньги остаются при вас" : `вы ${bmoney > 0 ? "выиграли" : "проиграли"} ${numberWithCommas(Math.abs(bmoney))}$`} (x${x})
💰 На руках: ${numberWithCommas(user[typemoney])}$`, {
        keyboard: Keyboard.keyboard(buttons).inline(!(user.menu && msg.isFromUser))
    });
};