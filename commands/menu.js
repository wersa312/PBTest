const { sections } = require("../api/menu/section"),
    { clans, Keyboard, users } = require("../main"),
    { randElement } = require("../api/utils");
const { orgFromDb } = require("./org/api/db");

module.exports = {
    r: /^меню/i,
    payload: "menu",
    
    async f(msg, user) {
        if (msg.isChat) return;
        if (msg.type == "cmd" || (msg.type == "payload" && msg.params == "main_menu")) {
            user.menu = true;
            user.scene = null;
            msg.send(`${msg.prefix}главное меню:`, {
                keyboard: sections.main_menu()
            })
        } else if (msg.params == "clan") {
            if (user.clan) {
                msg.send(`${msg.prefix}вы в клане: ${clans[user.clan].name}`,
                    {
                        keyboard: sections.clan(msg.senderId, clans[user.clan])
                    })
            } else {
                msg.send(`${msg.prefix}вы не состоите в клане ❌\n❔ Вы можете создать за $1,000,000, по кнопке снизу`,
                    {
                        keyboard: sections.no_clan()
                    })
            }
        } else if (msg.params == "games") {
            msg.send(`${msg.prefix}мини-игры:`,
                {
                    keyboard: sections.games()
                })
        } else if (msg.params == "mafia") {
            msg.send(`🕵‍♂ Мафия — командная психологическая пошаговая ролевая игра. 
🔹 Больше информации: vk.com/wall-151782797_88738

▶ Как в нее сыграть?
⠀👥 Мафия игра для бесед. Вы можете добавить бота в свою беседу (vk.com/@pocketbot_group-chat) и ввести команду @club151782797 (/мафия)

⠀✅ Или присоединиться к оффициальной беседе: vk.cc/avzTMl`, {
                keyboard: sections.mafia(),
                dont_parse_links: 1
            });
        } else if (msg.params == "report") {
            msg.send(`📖 Ответы на самые часто задаваемые вопросы: vk.com/topic-151782797_39454829`, {
                keyboard: sections.report(),
                dont_parse_links: 1
            });
        } else if (msg.params == "ent") {
            user.scene = null;
            delete user.photo;
            msg.send(`🔍 Развлекательные команды:`, {
                keyboard: sections.ent()
            });
        } else if (msg.params == "cr") {
            let params;
            if (user.cr) {
                params = {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: "🔍 " + user.cr,
                            payload: {
                                command: "cr_get"
                            },
                            color: Keyboard.SECONDARY_COLOR
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
                }
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
                }
            }
            user.scene = "cr";
            msg.send("✏ Введите следующим сообщением ваш тег в Clash Royale\n❔ Например: #93TG45", params);
        } else if (msg.params == "weather") {
            user.scene = "weather";
            msg.send(`✏ Введите следующим сообщением город, село.\n❔ Например: ${randElement(["Москва", "Киев", "Минск", "Нур-султан", "Шанхай", "Париж"])}`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.locationRequestButton({
                        payload: {
                            command: "weather"
                        }
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
            })
        } else if (msg.params == "org") {
            if (!user.org) {
                if (user.gold > 1000) {
                    msg.send(`🚫 У вас нет организации\n⚜️ Основание обойдется вам в 1.000 pockegold`, {
                        keyboard: Keyboard.keyboard([
                            Keyboard.textButton({
                                label: "👔 Создать",
                                payload: {
                                    command: "org_create"
                                },
                                color: Keyboard.POSITIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: "◀ Назад",
                                payload: {
                                    command: "profile"
                                },
                                color: Keyboard.PRIMARY_COLOR
                            })
                        ])
                    })
                } else {
                    msg.send(`🚫 У вас нет организации\n⚜️ Вам нужно 1.000 Pockegold`, {
                        keyboard: Keyboard.keyboard([
                            Keyboard.textButton({
                                label: "◀ Назад",
                                payload: {
                                    command: "profile"
                                },
                                color: Keyboard.PRIMARY_COLOR
                            })
                        ])
                    })
                }
            } else {
                let org = await orgFromDb(user.org);
                msg.send(`${msg.prefix}вы в организации: ${org.name}`,
                    {
                        keyboard: sections.org(msg.senderId, org)
                    })
            }
        } else if (msg.params.startsWith("backButton")) {
            let text, params = msg.params.split("_");
            switch (params[1]) {
                case "chanse":
                case "shar":
                    text = `✏ Введите следующим сообщением какое либо событие.\n❔ Например: ${randElement([`Выиграют ли ${randElement(["Na'Vi", "Secret", "OG", "Virtus pro", "Liquid"])} ${randElement(["Major", "International"])}?`, `Выйдут ли в финал ${randElement(["Virtus pro", "Na'Vi", "ПСЖ", "Реал", "Ювентус"])}?`, `Будет ли сегодня ${randElement(["дождь", "снег", "град"])}?`, `Является ли ${randElement(["Максим", "Сергей", "Иван", "Матвей", "Карина", "Саша"])} представителем нетрадиционной орентации?`])}`
                    break;
                case "wiki":
                    text = `✏ Введите следующим сообщением какое либо событие, персону или компанию.\n❔ Например: ${randElement(["ВКонтакте", "Павел Дуров", "Little Big"])}`;
                    break;
            }
            user.scene = params[1];
            msg.send(text, {
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
            })
        }
    }
}