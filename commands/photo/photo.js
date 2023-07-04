const { generateContentSource } = require("../../api/utils");
const { kek } = require("./api/photo/kek"),
    { flip } = require("./api/photo/flip"),
    { filter } = require("./api/photo/filter"),
    { Keyboard } = require("../../main");

let repit = Keyboard.keyboard([
    Keyboard.textButton({
        label: "🔁 Попробовать еще",
        payload: {
            command: "photo"
        },
        color: Keyboard.PRIMARY_COLOR
    })
]);

module.exports = [
    {
        payload: "photo_kek",

        /**
         * 
         * @param {import("vk-io").MessageContext} msg 
         * @param {*} user 
         */
        async f(msg, user) {
            let photo = user.photo.photo;
            await msg.send('⏳ Подождите');

            msg.sendPhotos(
                {
                    value: await kek(photo),
                },
                {
                    message: `${msg.prefix}держи свою фотку:`,
                    keyboard: repit,
                    content_source: generateContentSource({
                        peerId: msg.peerId,
                        conversationMessageId: user.photo.id
                    })
                });
        }
    },
    {
        payload: "photo_flip",

        async f(msg, user) {
            let photo = user.photo.photo;
            await msg.send('⏳ Подождите');

            msg.sendPhotos(
                {
                    value: await flip(photo, msg.params),
                },
                {
                    message: `${msg.prefix}держи свою фотку:`,
                    keyboard: repit,
                    content_source: generateContentSource({
                        peerId: msg.peerId,
                        conversationMessageId: user.photo.id
                    })
                });
        }
    },
    {
        payload: "photo_filter",

        async f(msg, user) {
            msg.send(`${msg.prefix}доступные фильтры:`,
                {
                    keyboard: Keyboard.keyboard([
                        [
                            Keyboard.textButton({
                                label: "🔅 Яркость понизить",
                                payload: {
                                    command: "photo_filter_go",
                                    params: "br_min"
                                },
                                color: Keyboard.NEGATIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: "🔆 Яркость повысить",
                                payload: {
                                    command: "photo_filter_go",
                                    params: "br_max"
                                },
                                color: Keyboard.POSITIVE_COLOR
                            })
                        ],
                        [
                            Keyboard.textButton({
                                label: "➖ Контрасность понизить",
                                payload: {
                                    command: "photo_filter_go",
                                    params: "cr_min"
                                },
                                color: Keyboard.NEGATIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: "➕ Контрасность повысить",
                                payload: {
                                    command: "photo_filter_go",
                                    params: "cr_max"
                                },
                                color: Keyboard.POSITIVE_COLOR
                            })
                        ],
                        [
                            Keyboard.textButton({
                                label: "⚕ Шум",
                                payload: {
                                    command: "photo_filter_go",
                                    params: "dither"
                                },
                                color: Keyboard.SECONDARY_COLOR
                            }),
                            Keyboard.textButton({
                                label: "⬛ ЧБ",
                                payload: {
                                    command: "photo_filter_go",
                                    params: "greyscale"
                                },
                                color: Keyboard.SECONDARY_COLOR
                            }),
                            Keyboard.textButton({
                                label: "🔀 Инверсия",
                                payload: {
                                    command: "photo_filter_go",
                                    params: "invert"
                                },
                                color: Keyboard.SECONDARY_COLOR
                            })
                        ],
                        [
                            Keyboard.textButton({
                                label: "✴ Сепия",
                                payload: {
                                    command: "photo_filter_go",
                                    params: "sepia"
                                },
                                color: Keyboard.SECONDARY_COLOR
                            }),
                            Keyboard.textButton({
                                label: "🎨 Изогелия",
                                payload: {
                                    command: "photo_filter_go",
                                    params: "art"
                                },
                                color: Keyboard.SECONDARY_COLOR
                            })
                        ],
                        [
                            Keyboard.textButton({
                                label: "◀ Назад",
                                payload: {
                                    command: "photo_repeat"
                                },
                                color: Keyboard.PRIMARY_COLOR
                            })
                        ]
                    ])
                })
        }
    },
    {
        payload: "photo_filter_go",

        async f(msg, user) {
            let photo = user.photo.photo;
            await msg.send('⏳ Подождите');

            msg.sendPhotos(
                {
                    value: await filter(photo, msg.params),
                },
                {
                    message: `${msg.prefix}держи свою фотку:`,
                    keyboard: repit,
                    content_source: generateContentSource({
                        peerId: msg.peerId,
                        conversationMessageId: user.photo.id
                    })
                });
        }
    }
];