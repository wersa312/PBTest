let { users, Keyboard } = require("../main");

module.exports = [{
    payload: "start",

    async f(msg) {
        await msg.send(`${msg.prefix}привет!
💬 Я игровой бот Pocket
🕵‍♂ Хочешь пройти обучающий гайд?`, {
            keyboard: Keyboard.keyboard([
                Keyboard.textButton({
                    label: "✅ Да",
                    payload: {
                        command: 'guide_yes'
                    },
                    color: Keyboard.POSITIVE_COLOR
                }),
                Keyboard.textButton({
                    label: "❌ Нет",
                    payload: {
                        command: 'menu',
                        params: "main_menu"
                    },
                    color: Keyboard.NEGATIVE_COLOR
                })
            ]).oneTime()
        });
    }
},
{
    payload: "guide_yes",

    f(msg) {
        msg.send("todo");
    }
}]