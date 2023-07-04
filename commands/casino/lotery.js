const { numberWithCommas } = require("../../api/utils"),
    { Keyboard } = require("../../main");

module.exports = {
    r: /^лотерея( .*)?$/i,
    payload: "lotery_game",

    f(msg, user) {
        if (user.money < 1000) return msg.send(msg.prefix + "не достаточно денег на счету\n🎟💰 Билетик стоит 1,000$\n💰 Баланс: " + numberWithCommas(user.money) + "$");

        let gift,
            rand = Math.floor(Math.random() * 10000);

        if (0 <= rand) gift = 1000000000;
        if (11 <= rand) gift = 100000;
        if (200 <= rand) gift = 1200;
        if (3300 <= rand) gift = 1000;
        if (5501 <= rand) gift = 3000;
        if (6302 <= rand) gift = 1500;
        if (6701 <= rand) gift = 500;
        if (8501 <= rand) gift = 0;

        user.money -= 1000;
        user.money += gift;

        let params = {
            keyboard: Keyboard.keyboard([
                Keyboard.textButton({
                    label: "🎟 Повторить",
                    payload: {
                        command: "lotery_game"
                    }
                })
            ]).inline()
        };

        if (msg.isFromUser && user.menu) {
            params = {
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: "🎟 Повторить",
                            payload: {
                                command: "lotery_game"
                            }
                        })
                    ],
                    [
                        Keyboard.textButton({
                            label: "◀ К играм",
                            payload: {
                                command: "menu",
                                params: "games"
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]
                ])
            };
        }

        msg.send(`${msg.prefix}${gift > 0 ? `ваш выигрыш: ${numberWithCommas(gift)}$` : 'вы ничего не выиграли'}\n💰 Баланс: ${numberWithCommas(user.money)} $`, params);
    }
}