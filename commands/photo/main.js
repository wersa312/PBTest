const { Keyboard } = require("../../main")

module.exports = [{
    payload: "photo",

    async f(msg, user) {

        user.scene = "photo";
        let params;

        if (user.photo?.photo) {
            params = {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "🔁 Использовать прошлую фотографию",
                        payload: {
                            command: "photo_repeat"
                        },
                        color: Keyboard.POSITIVE_COLOR
                    }),
                    Keyboard.textButton({
                        label: "◀ Назад",
                        payload: {
                            command: "menu",
                            params: "ent"
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ])
            };
        } else {
            params = {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: "◀ Назад",
                        payload: {
                            command: "menu",
                            params: "ent"
                        },
                        color: Keyboard.PRIMARY_COLOR
                    })
                ])
            };
        }

        msg.send(`📷 Отправьте какую либо фотографию или перешлите какое либо сообщение`, params);
    }
},
{
    scene: "photo",
    payload: "photo_repeat",

    f(msg, user) {
        if (msg.type == "scene" && !msg.hasForwards && !msg.hasAttachments("photo")) return msg.send(`🚫 Отправьте какую либо фотографию или перешлите какое либо сообщение`);

        if (user.photo == null) user.photo = {
            id: msg.conversationMessageId
        };

        if (msg.hasForwards) {
            if (msg.forwards[0].senderId < 0) return msg.send(`🚫 Отправьте какую либо фотографию или перешлите какое либо сообщение от пользователя`);
            let id = msg.forwards[0].senderId
            user.photo.forward = {
                id: id,
                text: msg.forwards.filter(m => m.senderId == id).map(m => m.text).join("\n")
            }
            return msg.send(msg.prefix + "что хотите сделать с этим сообщением?", {
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: "© Цитата",
                            payload: {
                                command: "photo_cit"
                            },
                            color: Keyboard.PRIMARY_COLOR
                        }),
                    ],
                    [
                        Keyboard.textButton({
                            label: "◀ Отменить",
                            payload: {
                                command: "menu",
                                params: "ent"
                            },
                            color: Keyboard.NEGATIVE_COLOR
                        })
                    ]
                ])
            });
        } else {
            if (msg.type == "scene") user.photo.photo = msg.attachments.filter(m => m.type == "photo")[0].largeSizeUrl;

            msg.send(msg.prefix + "что хотите сделать с этой фотографией", {
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: "🙂 Кекнуть",
                            payload: {
                                command: "photo_kek"
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ],
                    [
                        Keyboard.textButton({
                            label: "↪ Отзеркалить по горизонтали",
                            payload: {
                                command: "photo_flip",
                                params: "h"
                            },
                            color: Keyboard.SECONDARY_COLOR
                        }),
                        Keyboard.textButton({
                            label: "⤴ Отзеркалить по вертекали",
                            payload: {
                                command: "photo_flip",
                                params: "v"
                            },
                            color: Keyboard.SECONDARY_COLOR
                        })
                    ],
                    [
                        Keyboard.textButton({
                            label: "🔅 Фильтры",
                            payload: {
                                command: "photo_filter"
                            },
                            color: Keyboard.POSITIVE_COLOR
                        })
                    ],
                    [
                        Keyboard.textButton({
                            label: "◀ Отменить",
                            payload: {
                                command: "menu",
                                params: "ent"
                            },
                            color: Keyboard.NEGATIVE_COLOR
                        })
                    ]
                ])
            });
        }
    }
}]