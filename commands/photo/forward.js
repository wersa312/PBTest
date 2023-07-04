const /*{ cit } = require("./api/forward/forward"),*/
    { Keyboard } = require("../../main");

module.exports = [
    {
        payload: "photo_cit",

        async f(msg, user) {
            return msg.send(`❌ Команда временна отключена`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "🔁 Попробовать еще",
                        payload: {
                            command: "photo"
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ])
            });
            await msg.send('⏳ Подождите');
            msg.sendPhotos({
                value: await cit(msg, user.photo.forward)
            }, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "🔁 Попробовать еще",
                        payload: {
                            command: "photo"
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ])
            });
        }
    }
];