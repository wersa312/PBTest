const { Keyboard } = require("vk-io");

module.exports = [
    {
        r: /^(?:mshop|магазин мафи(?:и|й))(?: (.*))?$/i,
        payload: "mshop",
        async f(msg, user) {
            if (!user.mafcoin) user.mafcoin = 0;
            if (!user.mafiainv) user.mafiainv = { "save": 0, "fake_docs": 0 };

            let pref = "";

            if (msg.type == "payload") {
                if (msg.params == "save") {
                    if (user.mafcoin >= 100) {
                        user.mafiainv.save++;
                        user.mafcoin -= 100;
                        pref = "🛡 Успешно приобретена защита.\n\n";
                    } else {
                        pref = "🛡 Не хватает денег для приобретения. Стоимость: 100 💴\n\n";
                    }
                } else if (msg.params == "fakedocs") {
                    if (user.mafcoin >= 150) {
                        user.mafiainv.fake_docs++;
                        user.mafcoin -= 150;
                        pref = "🗂 Успешно приобретены документы.\n\n";
                    } else {
                        pref = "🗂 Не хватает денег для приобретения. Стоимость: 150 💴\n\n";
                    }
                }
            }

            msg.send(`${pref}${msg.prefix}ваши предметы для игры мафии:
🛡 Защита: ${user.mafiainv.save}
🗂 Ложные документы: ${user.mafiainv.fake_docs}

💴 Баланс: ${user.mafcoin}`, {
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: "🛡 [100 💴]",
                            payload: {
                                command: "mshop",
                                params: "save"
                            },
                            color: Keyboard.POSITIVE_COLOR
                        }),
                        Keyboard.textButton({
                            label: "🗂 [150 💴]",
                            payload: {
                                command: "mshop",
                                params: "fakedocs"
                            },
                            color: Keyboard.POSITIVE_COLOR
                        })
                    ],
                    [
                        Keyboard.urlButton({
                            label: "💴 Пополнить баланс",
                            url: "https://pocketbot.ru"
                        })
                    ]
                ]).inline()
            });
        }
    }
]