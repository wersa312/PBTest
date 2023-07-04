const { vkGroup, chats, Keyboard } = require("../../main"),
    strings = require("../../vars/strings.json");

module.exports = [
    {
        r: /^настройки(?: (.*))?/i,
        payload: "chat_settings",
        /**
         * 
         * @param {import("vk-io").MessageContext} msg 
         */
        async f(msg) {
            try {
                if (msg.isFromUser) return msg.send(`⚙ С помощью настроек вы можете настроить бота в беседе под себя\n❔ Введите данную команду в беседе`);
                let { items } = await vkGroup.api.messages.getConversationMembers({ peer_id: msg.peerId });
                items = items.filter(item => item.member_id > 0);
                let userChat = items.find(item => item.member_id == msg.senderId);
                if (!userChat.is_admin) return msg.send(`🚫 Доступно только администраторам беседы`);
                let chat = chats[msg.chatId];

                let param = (msg.type == "cmd" ? msg.match[1] : msg.params);
                let prefix = '';

                if (param == "выключить") {
                    chat.settings.on = false;
                    return msg.send(`📴 Бот в данной беседе отключен. Чтобы его снова включить, введите <<Бот включить>> (Только администраторам беседы)`);
                } else if (param == "перестрелки") {
                    chat.settings.games.gun_game = !chat.settings.games.gun_game;
                    prefix = `🔫 Перестрелки ${chat.settings.games.gun_game ? "включены" : "выключены"}\n\n`;
                } else if (param == "казино") {
                    chat.settings.games.casino = !chat.settings.games.casino;
                    prefix = `🎰 Казино ${chat.settings.games.casino ? "включено" : "выключено"}\n\n`;
                } else if (param == "ставки") {
                    chat.settings.games.bet = !chat.settings.games.bet;
                    prefix = `💸 Ставки ${chat.settings.games.bet ? "включены" : "выключены"}\n\n`;
                } else if (param == "мафия") {
                    chat.settings.games.mafiastart = !chat.settings.games.mafiastart;
                    prefix = `🧛‍♂️ Мафию запускать могут теперь ${chat.settings.games.mafiastart ? "только администраторы беседы" : "все"}\n\n`;
                } else if (param == "исключать покинувших") {
                    chat.settings.kick_leave = !chat.settings.kick_leave;
                    prefix = `🚷 Бот теперь ${chat.settings.kick_leave ? "" : "не"} кикает людей, которые покинули беседу\n\n`;
                }

                msg.send(
                    prefix +
                    `⚙ Настройки беседы:\n` +
                    `🚷 Исключать покинувших: ${chat.settings.kick_leave ? "✅" : "🚫"}\n\n` +
                    `🎲 Игры:\n` +
                    `⠀⠀🔫 Перестрелки: ${chat.settings.games.gun_game ? "✅" : "🚫"}\n` +
                    `⠀⠀🎰 Казино: ${chat.settings.games.casino ? "✅" : "🚫"}\n` +
                    `⠀⠀💸 Ставки: ${chat.settings.games.bet ? "✅" : "🚫"}\n` +
                    `⠀⠀🧛‍♂️ Запуск мафии: ${chat.settings.games.mafiastart ? "администраторам беседы" : "всем"}`,
                    {
                        keyboard: Keyboard.keyboard([
                            [
                                Keyboard.textButton({
                                    label: `${chat.settings.on ? "📴 Выключить бота" : "📱 Включить бота"}`,
                                    payload: {
                                        command: "chat_settings",
                                        params: "выключить"
                                    },
                                    color: Keyboard.NEGATIVE_COLOR
                                })
                            ],
                            [
                                Keyboard.textButton({
                                    label: `🚷`,
                                    payload: {
                                        command: "chat_settings",
                                        params: "исключать покинувших"
                                    },
                                    color: (chat.settings.kick_leave ? Keyboard.POSITIVE_COLOR : Keyboard.NEGATIVE_COLOR)
                                }),
                                Keyboard.textButton({
                                    label: `🔫`,
                                    payload: {
                                        command: "chat_settings",
                                        params: "перестрелки"
                                    },
                                    color: (chat.settings.games.gun_game ? Keyboard.POSITIVE_COLOR : Keyboard.NEGATIVE_COLOR)
                                }),
                                Keyboard.textButton({
                                    label: `🎰`,
                                    payload: {
                                        command: "chat_settings",
                                        params: "казино"
                                    },
                                    color: (chat.settings.games.casino ? Keyboard.POSITIVE_COLOR : Keyboard.NEGATIVE_COLOR)
                                })
                            ],
                            [
                                Keyboard.textButton({
                                    label: `💸`,
                                    payload: {
                                        command: "chat_settings",
                                        params: "ставки"
                                    },
                                    color: (chat.settings.games.bet ? Keyboard.POSITIVE_COLOR : Keyboard.NEGATIVE_COLOR)
                                }),
                                Keyboard.textButton({
                                    label: `🧛‍♂️`,
                                    payload: {
                                        command: "chat_settings",
                                        params: "мафия"
                                    },
                                    color: (chat.settings.games.mafiastart ? Keyboard.NEGATIVE_COLOR : Keyboard.POSITIVE_COLOR)
                                })
                            ]
                        ]).inline()
                    }
                );
            } catch (err) {
                msg.send(strings.chats.bot_isnt_admin);
            }
        }
    }
]