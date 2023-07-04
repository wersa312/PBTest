const { Keyboard } = require("vk-io");
const { clubLink } = require("../api/utils");

const str = [
    `игровые команды:
⠀🖥 Профиль
⠀✏ Ник [имя]
⠀💸 Баланс
⠀🏧 Банк
⠀⠀⠀🔽 Банк положить [сумма]
⠀⠀⠀🔼 Банк снять [сумма]
⠀🤝 Передать [ID/ссылка] [сумма] [комментарий]
⠀👔 Работа
⠀💼 Бизнес
⠀🔝 Топ
⠀⠀⠀🛡 Топ кланов
⠀⠀⠀💸 Топ богатых
⠀⠀⠀🧛‍♂️ Топ мафии
⠀🛒 Магазин
⠀❤ Бонус
⠀⚙ Настройки`,
    `игры:
⠀🧛‍♂️ Мафия
⠀🔫 Перестрелка
⠀💰 Ставка [сумма]
⠀💰 Лотерея
⠀🎰 Казино
⠀⠀⠀🎰 Казино коины
⠀⠀⠀🔽 Поставить [сумма]
⠀⠀⠀👑 Казино стоп`,
    `развлекательные команды:
⠀📈 Кр [тэг] - статистика Clash Royale
⠀💬 Вики [текст]
⠀🔮 Шар [текст]
⠀🍀 Шанс
⠀🔞 Sex
⠀👤 Кто/кому/кого
⠀❤ Свадьба [ссылка]
⠀⠀⠀💔 Брак развод
⠀☁ Погода [город]
⠀📝 Дата [ссылка]`,
    `клановые команды:
⠀🛡 Клан
⠀⚔ Клан создать [название]
⠀✏ Клан переименовать [название]
⠀👥 Клан участники
⠀⠀⠀👥 Клан участник [ID/ссылка]
⠀📧 Клан пригласить [ID/ссылка]
⠀⠀⠀🧾 Клан приглашения
⠀⤴ Клан повысить [ID/ссылка]
⠀⤵ Клан понизить [ID/ссылка]
⠀💲 Клан зарплата [общая сумма]
⠀⠀⠀💸 Клан пополнить [сумма]
⠀💼 Клан бизнес
⠀💡 Клан возможности
⠀❌ Клан выгнать [ID/ссылка]
⠀🚪 Клан покинуть`/*,
    `команды организации:
💁‍♂️ Надо написать`*/
];

module.exports = {
    r: /^(?:помощь|help|команды)(?: (.*))?$/i,
    payload: "help",
    /**
     * 
     * @param {import("vk-io").MessageContext} msg 
     */
    async f(msg) {
        if (msg.type == "cmd") msg.params = isNaN(Number(msg.match[1])) ? undefined : Number(msg.match[1]);
        if (!str[msg.params - 1]) delete msg.params;
        if (!msg.params) {
            msg.send(`${msg.prefix}разделы помощи:
⠀⠀1⃣ 🎲 Основные
⠀⠀2⃣ 🎮 Игры
⠀⠀3⃣ 🎠 Развлекательные
⠀⠀4⃣ 🛡 Клановые
${!msg.clientInfo.inline_keyboard ? `\n📗 Введи <<Помощь [номер раздела]>> для просмотра команд` : ''}
📣 Репорт [текст] - есть вопросы? Задай 
💬 Беседы - места, где можно поиграть в нашего бота
🥺 Поддержи проект рублем: команда «Донат»`, {
                dont_parse_links: 1,
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: "🎲",
                            payload: {
                                command: "help",
                                params: 1
                            },
                            color: Keyboard.SECONDARY_COLOR
                        }),
                        Keyboard.textButton({
                            label: "🎮",
                            payload: {
                                command: "help",
                                params: 2
                            },
                            color: Keyboard.SECONDARY_COLOR
                        })
                    ],
                    [
                        Keyboard.textButton({
                            label: "🎠",
                            payload: {
                                command: "help",
                                params: 3
                            },
                            color: Keyboard.SECONDARY_COLOR
                        }),
                        Keyboard.textButton({
                            label: "🛡",
                            payload: {
                                command: "help",
                                params: 4
                            },
                            color: Keyboard.SECONDARY_COLOR
                        })
                    ]
                ]).inline()
            });
        } else {
            msg.send(`${msg.prefix}${str[msg.params - 1]}`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '◀ Назад',
                        payload: {
                            command: "help"
                        }
                    })
                ]).inline()
            });
        }
    }
};