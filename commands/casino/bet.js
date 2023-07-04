const bet = require("../../api/bet"),
    { Keyboard } = require("../../main"),
    { numberWithCommas } = require("../../api/utils");

module.exports = [{
    r: /^ставка( (.*))?$/i,
    scene: "bet_game",
    payload: "bet_game2",
    
    f(msg, user) {
        bet(msg, user);
    }
},
{
    payload: "bet_game",
    
    f(msg, user) {
        user.scene = "bet_game";
        if (user.money > 1000) {
            msg.send(`${msg.prefix}введите следующим сообщением сумму для ставки ✅`, {
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: numberWithCommas(Math.round((user.money / 100) * 25)) + "$",
                            payload: {
                                command: "bet_game2",
                                params: Math.round((user.money / 100) * 25)
                            },
                            color: Keyboard.SECONDARY_COLOR
                        }),
                        Keyboard.textButton({
                            label: numberWithCommas(Math.round((user.money / 100) * 50)) + "$",
                            payload: {
                                command: "bet_game2",
                                params: Math.round((user.money / 100) * 50)
                            },
                            color: Keyboard.SECONDARY_COLOR
                        }),
                        Keyboard.textButton({
                            label: "💰 На все",
                            payload: {
                                command: "bet_game2",
                                params: "all"
                            },
                            color: Keyboard.PRIMARY_COLOR
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
            });
        } else if (user.money == 0) {
            msg.send(`${msg.prefix}у вас нет денег для игры в ставки`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "◀ К играм",
                        payload: {
                            command: "menu",
                            params: "games"
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ])
            });
        } else {
            msg.send(`${msg.prefix}введите следующим сообщением сумму для ставки ✅`, {
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: numberWithCommas(user.money) + "$",
                            payload: {
                                command: "bet_game2",
                                params: user.money
                            },
                            color: Keyboard.SECONDARY_COLOR
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
            });
        }
    }
}]