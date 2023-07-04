const { getRandomId } = require("vk-io");
const { chats, Keyboard, vkGroup, db, vkApi } = require("../../main"),
    { fancyTimeFormat } = require("../../api/utils"),
    mafia_default = require("./mafia_default.json"),
    fs = require("fs");

module.exports = [
    {
        r: /^монополия+$/i,
        async f(msg) {
            if (msg.isFromUser) return msg.send(`🚫 Игра в монополию доступна только в беседах`);

            let chat = chats[msg.chatId];

            if (chat.monopoly) return msg.send(`▶ Игра уже началась${chat.mafia.started ? "." : ", присоединись по кнопке снизу"}`);

            if (!chat.monopolyplayed) {
                chat.monopolyplayed = true;
                await msg.send('👥 Вы впервые играете в этой беседе в монополию.\n🗂 Прочтите статью, для ознакомления с правилами игры.\n💬 ссылка');
            }

            chat.mafia = JSON.parse(JSON.stringify(mafia_default));
            db.collection("mafia").insert({ id: msg.chatId, time: (+new Date() + (chat.mafia.settings.timeout.startgame * 60 * 1000)), lifetime: (+new Date() + (10 * 60 * 1000)) });

            await msg.send(`👥 Набор для игры в мафию открыт. Игроков: 0\n▶ До старта: ${fancyTimeFormat(chat.mafia.settings.timeout.startgame * 60)}мин.`, {
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: "🚪 Присоединиться",
                            payload: {
                                command: "mafia_join"
                            },
                            color: Keyboard.POSITIVE_COLOR
                        })
                    ],
                    [
                        Keyboard.textButton({
                            label: "▶ Начать игру",
                            payload: {
                                command: "mafia_start"
                            },
                            color: Keyboard.PRIMARY_COLOR
                        }),
                        Keyboard.textButton({
                            label: "⏰ Продлить время",
                            payload: {
                                command: "mafia_time_add"
                            },
                            color: Keyboard.SECONDARY_COLOR
                        })
                    ]
                ])
            });
        }
    },
    {
        payload: "mafia_join",
        async f(msg, user) {
            let mafia = chats[msg.chatId]?.mafia;
            if (!mafia) return;
            if (mafia.started) return msg.send(`🚫 ${msg.prefix}игра уже началась`);
            if (mafia.users[msg.senderId]) return msg.send(`🚫 ${msg.prefix}вы уже присоединились к игре`);
            if (!msg.clientInfo.inline_keyboard) return msg.send(`🚫 ${msg.prefix}похоже ваш клиент устарел\n✅ Обновите приложение ВК, прежде чем играть`);
            if (Object.keys(mafia.users).length >= 10) return msg.send(`🚫 Достигнуто максимальное количество игроков`);

            if (user.mafiainv == null) user.mafiainv = {
                "save": 0,
                "fake_docs": 0
            };

            try {
                //                 await vkGroup.api.messages.send({ user_id: msg.senderId, message: "▶ Вы подключились к игре мафии", random_id: getRandomId() });

                //                 let us;
                let [[us], time] = await Promise.all([
                    vkApi.api.users.get({ user_id: msg.senderId }),
                    db.collection("mafia").findOne({ id: msg.chatId }),
                    vkGroup.api.messages.send({ user_id: msg.senderId, message: "▶️ Вы подключились к игре мафии", random_id: getRandomId() }),
                ]);
                if (user.cache && user.cache.time > +new Date()) {
                    us = user.cache;
                } else {
                    [us] = await vkApi.api.users.get({ user_id: msg.senderId });
                    user.cache = us;
                    user.cache.time = +new Date() + 86400000;
                }

                mafia.users[msg.senderId] = {
                    role: "",
                    f_name: us.first_name,
                    s_name: us.last_name
                };

                //                 let time = await db.collection("mafia").findOne({ id: msg.chatId });
                time = Math.floor((time.time - (+new Date())) / 1000);

                msg.send(`🚪 @id${msg.senderId} (${us.first_name} ${us.last_name}) присоединился к игре\n👥 Игроков: ${Object.keys(chats[msg.chatId].mafia.users).length}\n⌛ ${time < 0 ? `Игра начинается!` : `До старта: ${fancyTimeFormat(time)}`}`, { disable_mentions: 1 });
            } catch (err) {
                msg.send(`🚫 ${msg.prefix}я не могу писать вам личные сообщения\n▶ Перейдите ко мне на страницу, и нажмите "Разрешить сообщения" и попробуйте еще`, {
                    keyboard: Keyboard.keyboard([
                        Keyboard.urlButton({
                            label: "▶ Напиши мне",
                            url: "https://vk.com/write-151782797"
                        })
                    ]).inline()
                });
            }
        }
    },
    {
        payload: "mafia_start",
        f(msg) {
            let chat = chats[msg.chatId];
            vkGroup.api.messages.getConversationMembers({
                peer_id: msg.peerId
            }).then(async x => {
                if (chat.settings.games.mafiastart) {
                    for (var i in x.items) {
                        if (x.items[i].member_id == msg.senderId) {
                            if (!x.items[i].is_admin) return msg.send("🚫 Доступно только администраторам беседы");
                        }
                    }
                }
                if (Object.keys(chat.mafia.users).length < 4) return msg.send("🚫 Количество игроков меньше 4-х");
                if (chat.mafia.phase != "start") return;
                msg.send(`🔄 Игра начинается`, {
                    keyboard: JSON.stringify({
                        buttons: []
                    })
                });
                await db.collection("mafia").updateOne({
                    id: msg.chatId
                }, {
                    $set: {
                        time: 0
                    }
                });
            }).catch(async () => {
                if (!chat.mafia) return;
                if (Object.keys(chat.mafia.users).length < 4) return msg.send("🚫 Количество игроков меньше 4-х");
                if (chat.mafia.phase != "start") return;
                await db.collection("mafia").updateOne({
                    id: msg.chatId
                }, {
                    $set: {
                        time: 0
                    }
                });
            });
        }
    },
    {
        payload: "mafia_time_add",
        f(msg) {
            let chat = chats[msg.chatId];
            vkGroup.api.messages.getConversationMembers({
                peer_id: msg.peerId
            }).then(async x => {
                if (chat.settings.games.mafiastart) {
                    for (var i in x.items) {
                        if (x.items[i].member_id == msg.senderId) {
                            if (!x.items[i].is_admin) return msg.send("🚫 Доступно только администраторам беседы");
                        }
                    }
                }
                let [time] = await db.collection("mafia").find({ id: msg.chatId }).toArray();
                if (time == null) return;
                await db.collection("mafia").updateOne({
                    id: msg.chatId
                }, {
                    $set: {
                        time: time.time + (60 * 1000)
                    }
                });
                msg.send("🚪 Время ожидания продлено на 1 минуту\n⌛ До старта: " + fancyTimeFormat(Math.floor((time.time - +new Date()) / 1000) + 60));
            }).catch(async () => {
                let [time] = await db.collection("mafia").find({ id: msg.chatId }).toArray();
                if (time == null) return;
                await db.collection("mafia").updateOne({
                    id: msg.chatId
                }, {
                    $set: {
                        time: time.time + (60 * 1000)
                    }
                });
                msg.send("🚪 Время ожидания продлено на 1 минуту\n⌛ До старта: " + fancyTimeFormat(Math.floor((time.time - +new Date()) / 1000) + 60));
            });
        }
    }
];

fs.readdirSync(__dirname + "/core").forEach(function (file) {
    if (file.endsWith(".js")) {
        require("./core/" + file);
    }
});
