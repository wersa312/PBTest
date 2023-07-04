const { Keyboard } = require("../../main")

module.exports = {
    r: /^уведомление/i,
    payload: "send_push",
    
    f(msg, user) {
        if (user.push == null || user.push) {
            user.push = false;
            msg.send(`🔇 Уведомления выключены\n🔔 Чтобы включить, введите снова "Уведомления"`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '🔔 Включить уведомления',
                        payload: {
                            command: 'send_push'
                        },
                        color: Keyboard.POSITIVE_COLOR
                    })
                ]).inline()
            });
        } else {
            user.push = true;
            msg.send(`🔔 Уведомления включены\n🔇 Чтобы выключить, введите снова "Уведомления"`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '🔇 Выключить уведомления',
                        payload: {
                            command: 'send_push'
                        },
                        color: Keyboard.NEGATIVE_COLOR
                    })
                ]).inline()
            });
        }
    }
}