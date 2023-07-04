const { Keyboard } = require("../../main"),
    { orgs } = require("../../commands/org/api/org"),
    Org = require("../../commands/org/api/org");

const sections = {
    profile() {
        return Keyboard.keyboard([
            [
                Keyboard.textButton({
                    label: "✏️ Сменить ник",
                    payload: {
                        command: "changeNick"
                    },
                    color: Keyboard.POSITIVE_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "💰 Баланс",
                    payload: {
                        command: "balance"
                    },
                    color: Keyboard.POSITIVE_COLOR
                }),
                Keyboard.textButton({
                    label: "🏧 Банк",
                    payload: {
                        command: "bank"
                    },
                    color: Keyboard.PRIMARY_COLOR
                }),
                Keyboard.textButton({
                    label: "🤝 Передать",
                    payload: {
                        command: "pay"
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "❤ Бонус",
                    payload: {
                        command: "bonus",
                        params: {
                            inv: false
                        }
                    },
                    color: Keyboard.NEGATIVE_COLOR
                }),
                Keyboard.textButton({
                    label: "🛒 Магазин",
                    payload: {
                        command: "shop"
                    },
                    color: Keyboard.SECONDARY_COLOR
                }),
                Keyboard.textButton({
                    label: "👨‍🔧 Работа",
                    payload: {
                        command: "job"
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "💸 Бизнес",
                    payload: {
                        command: "business"
                    },
                    color: Keyboard.SECONDARY_COLOR
                })/*,
                Keyboard.textButton({
                    label: "👔 Организация",
                    payload: {
                        command: "menu",
                        params: "org"
                    },
                    color: Keyboard.SECONDARY_COLOR
                })*/
            ],
            [
                Keyboard.textButton({
                    label: '◀ В меню',
                    payload: {
                        command: 'menu',
                        params: "main_menu"
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            ]
        ])
    },
    main_menu() {
        return Keyboard.keyboard([
            [
                Keyboard.textButton({
                    label: "💻 Профиль",
                    payload: {
                        command: "profile"
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "🕹 Игры",
                    payload: {
                        command: "menu",
                        params: "games"
                    },
                    color: Keyboard.SECONDARY_COLOR
                }),
                Keyboard.textButton({
                    label: "🛡 Клан",
                    payload: {
                        command: "menu",
                        params: "clan"
                    },
                    color: Keyboard.SECONDARY_COLOR
                }),
                Keyboard.textButton({
                    label: "🔝 Топ",
                    payload: {
                        command: "top",
                        params: "from_menu"
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "🔍 Развлекательные",
                    payload: {
                        command: "menu",
                        params: "ent"
                    },
                    color: Keyboard.SECONDARY_COLOR
                }),
                Keyboard.textButton({
                    label: "💱 Курс",
                    payload: {
                        command: "курс"
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "❔ Все команды",
                    payload: {
                        command: "help"
                    },
                    color: Keyboard.POSITIVE_COLOR
                }),
                Keyboard.textButton({
                    label: "📢 Вопросы?",
                    payload: {
                        command: "menu",
                        params: "report"
                    },
                    color: Keyboard.NEGATIVE_COLOR
                })
            ]
        ])
    },
    report() {
        return Keyboard.keyboard([
            Keyboard.textButton({
                label: "📩 Задать вопрос администраторам",
                payload: {
                    command: "report"
                },
                color: Keyboard.POSITIVE_COLOR
            }),
            Keyboard.textButton({
                label: "◀ В меню",
                payload: {
                    command: "menu",
                    params: "main_menu"
                },
                color: Keyboard.PRIMARY_COLOR
            })
        ])
    },
    games() {
        return Keyboard.keyboard([
            [
                Keyboard.textButton({
                    label: "🕵‍♂ Мафия",
                    payload: {
                        command: "menu",
                        params: "mafia"
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "🔫 Перестрелки",
                    payload: {
                        command: "gun_game",
                        params: "from_menu"
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "💰 Ставка",
                    payload: {
                        command: "bet_game"
                    },
                    color: Keyboard.SECONDARY_COLOR
                }),
                Keyboard.textButton({
                    label: "🎟 Лотерея",
                    payload: {
                        command: "lotery_game"
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "◀ В меню",
                    payload: {
                        command: "menu",
                        params: "main_menu"
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            ]
        ])
    },
    no_clan() {
        return Keyboard.keyboard([
            [
                Keyboard.textButton({
                    label: "🆕 Создать клан",
                    payload: {
                        command: "clan_create",
                    },
                    color: Keyboard.POSITIVE_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "📥 Приглашения",
                    payload: {
                        command: "clan_invites",
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "◀ В меню",
                    payload: {
                        command: "menu",
                        params: "main_menu"
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            ]
        ])
    },
    clan(id, clan) {
        let buttons = [
            [
                Keyboard.textButton({
                    label: `🛡 ${clan.name}`,
                    payload: {
                        command: "clan_info",
                        params: "no_buttons"
                    }
                })
            ],
            [
                Keyboard.textButton({
                    label: '👥 Участники',
                    payload: {
                        command: 'clan_members',
                        params: {
                            n: 0
                        }
                    },
                    color: Keyboard.SECONDARY_COLOR
                }),
                Keyboard.textButton({
                    label: '⛔ Покинуть',
                    payload: {
                        command: 'clan_leave',
                        params: {
                            accept: false
                        }
                    },
                    color: Keyboard.NEGATIVE_COLOR
                })
            ]
        ];
        if (clan.members[id].rank != "участник") {
            buttons.push(
                [
                    Keyboard.textButton({
                        label: `✏️ Переименовать`,
                        payload: {
                            command: "clan_rename"
                        }
                    }),
                    Keyboard.textButton({
                        label: '💰 Выдать зарплату',
                        payload: {
                            command: 'clan_payclan'
                        },
                        color: Keyboard.POSITIVE_COLOR
                    })
                ],
                [
                    Keyboard.textButton({
                        label: '💰 Казна',
                        payload: {
                            command: 'menu',
                            params: "clan_balance"
                        },
                        color: Keyboard.POSITIVE_COLOR
                    }),
                    Keyboard.textButton({
                        label: '👔 Бизнес',
                        payload: {
                            command: 'clan_biss'
                        },
                        color: Keyboard.SECONDARY_COLOR
                    }),
                    Keyboard.textButton({
                        label: '💡 Возможности',
                        payload: {
                            command: 'clan_boost'
                        },
                        color: Keyboard.SECONDARY_COLOR
                    })
                ]
            );
        }
        buttons.push([
            Keyboard.textButton({
                label: "◀ В меню",
                payload: {
                    command: "menu",
                    params: "main_menu"
                },
                color: Keyboard.PRIMARY_COLOR
            })
        ]);
        return Keyboard.keyboard(buttons);
    },
    /**
     * 
     * @param {Number} id 
     * @param {Org} org 
     */
    org(id, org) {
        let _org = orgs[org.type];
        let buttons = [
            [
                Keyboard.textButton({
                    label: `${_org.emoji} ${_org.name}`,
                    payload: {
                        command: "org_info"
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: `🛠 Работать`,
                    payload: {
                        command: "job"
                    },
                    color: Keyboard.POSITIVE_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: '👥 Работники',
                    payload: {
                        command: 'org_members',
                        params: {
                            n: 0
                        }
                    }
                }),
                Keyboard.textButton({
                    label: '⛔ Покинуть',
                    payload: {
                        command: 'org_leave'
                    },
                    color: Keyboard.NEGATIVE_COLOR
                })
            ]
        ];
        if (org.members[id].rank != 0) {
            buttons.push(
                [
                    Keyboard.textButton({
                        label: `✏️ Переименовать`,
                        payload: {
                            command: "org_rename"
                        }
                    }),
                    Keyboard.textButton({
                        label: '🤝 Выдать премию',
                        payload: {
                            command: 'org_pay'
                        }
                    })
                ],
                [
                    Keyboard.textButton({
                        label: '💰 Баланс',
                        payload: {
                            command: "org_balance"
                        }
                    }),
                    Keyboard.textButton({
                        label: '🏆 Рейтинг',
                        payload: {
                            command: "org_rating"
                        }
                    })
                ]
            );
        }
        buttons.push([
            Keyboard.textButton({
                label: "◀ Назад",
                payload: {
                    command: "profile"
                },
                color: Keyboard.PRIMARY_COLOR
            })
        ]);
        return Keyboard.keyboard(buttons);
    },
    mafia() {
        return Keyboard.keyboard([
            Keyboard.urlButton({
                label: "↗ Оффициальная беседа",
                url: `https://vk.me/join/AJQ1d0QZhxefXXEG31y7_wWX`
            }),
            Keyboard.textButton({
                label: "◀ Назад",
                payload: {
                    command: "menu",
                    params: "games"
                },
                color: Keyboard.PRIMARY_COLOR
            })
        ])
    },
    ent() {
        return Keyboard.keyboard([
            [
                Keyboard.textButton({
                    label: "🍀 Шанс",
                    payload: {
                        command: "menu",
                        params: "backButton_chanse"
                    },
                    color: Keyboard.SECONDARY_COLOR
                }),
                Keyboard.textButton({
                    label: "🔮 Шар",
                    payload: {
                        command: "menu",
                        params: "backButton_shar"
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "📗 Wiki",
                    payload: {
                        command: "menu",
                        params: "backButton_wiki"
                    },
                    color: Keyboard.SECONDARY_COLOR
                }),
                Keyboard.textButton({
                    label: "☁ Погода",
                    payload: {
                        command: "menu",
                        params: "weather"
                    },
                    color: Keyboard.SECONDARY_COLOR
                }),
                Keyboard.textButton({
                    label: "📅 Дата",
                    payload: {
                        command: "date"
                    },
                    color: Keyboard.NEGATIVE_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "📷 Обработать фото",
                    payload: {
                        command: "photo"
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "💭 Беседы",
                    payload: {
                        command: "chats"
                    },
                    color: Keyboard.SECONDARY_COLOR
                }),
                Keyboard.textButton({
                    label: "🏆 CR статистика",
                    payload: {
                        command: "menu",
                        params: "cr"
                    },
                    color: Keyboard.SECONDARY_COLOR
                })
            ],
            [
                Keyboard.textButton({
                    label: "◀ В меню",
                    payload: {
                        command: "menu",
                        params: "main_menu"
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            ]
        ])
    }
}

exports.sections = sections;