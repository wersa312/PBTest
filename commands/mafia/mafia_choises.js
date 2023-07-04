const { Keyboard, getRandomId } = require("vk-io");
const { chatFromDb } = require("../../api/chat");
const { chats, vkGroup, db } = require("../../main");
const getShortNick = require("./core/api/getShortNick");
const roleToString = require("./core/api/roleToString");

function checkAllVoted(mafia, id) {
    let rolesmaf = {
        mafia: false,
        com: false,
        doc: false,
        putana: false
    }
    for (let i in mafia.users) {
        if (mafia.users[i].role == "don" || mafia.users[i].role == "mafia") rolesmaf.mafia = true;
        if (mafia.users[i].role == "com") rolesmaf.com = true;
        if (mafia.users[i].role == "doc") rolesmaf.doc = true;
        if (mafia.users[i].role == "putana") rolesmaf.putana = true;
    }
    let allPicked = true;
    for (var i in rolesmaf) {
        if (rolesmaf[i]) {
            if (i == "com") {
                if (mafia.votes[i].id == null) allPicked = false;
            } else if (i == "doc") {
                if (mafia.votes[i].id == null) allPicked = false;
            } else if (i == "putana") {
                if (mafia.votes[i].id == null) allPicked = false;
            } else if (i == "mafia") {
                if (mafia.votes[i].don == null) allPicked = false;
            }
        }
    }
    if (allPicked) {
        db.collection("mafia").updateOne({
            id: parseInt(id)
        }, {
            $set: {
                time: 0
            }
        });
    }
    db.collection("mafia").updateOne({
        id: parseInt(id)
    }, {
        $set: {
            lifetime: (+new Date() + (10 * 60 * 1000))
        }
    });
    return;
}

module.exports = [
    {
        scene: "mafia_talk",
        async f(msg, user) {
            let id = user.scenemafia;
            await chatFromDb(user.scenemafia);

            if (!chats[id].mafia || !chats[id].mafia.users[msg.senderId]) {
                delete user.scene;
                delete user.scenemafia;
                return;
            }

            vkGroup.api.messages.send({
                user_ids: Object.keys(chats[id].mafia.users).filter(uId => (chats[id].mafia.users[uId].role == "don" || chats[id].mafia.users[uId].role == "mafia")),
                message: `🧛‍♂️ ${roleToString(chats[id].mafia.users[msg.senderId].role, true)}: `,
                forward: JSON.stringify({
                    peer_id: msg.peerId,
                    conversation_message_ids: msg.conversationMessageId
                }),
                random_id: getRandomId()
            });
        }
    },

    {
        payload: "mafia_heal",
        async f(msg) {
            const { params } = msg;
            await chatFromDb(params.chat_id);

            if (!chats[params.chat_id]["mafia"]) return;

            let { mafia } = chats[params.chat_id];

            if (mafia.phase != "night") return;
            if (mafia.votes.doc.id) return;
            if (mafia.users[msg.senderId] && mafia.users[msg.senderId].role == "doc" && mafia.users[params.id]) {

                if (params.id == msg.senderId) mafia.dochealed = true;

                mafia.votes.doc = {
                    doc_id: msg.senderId,
                    id: params.id
                };
                msg.send("✅ Выбор сделан");
                vkGroup.api.messages.send({ peer_id: (2e9 + params.chat_id), message: `👨‍⚕ Доктор вышел на ночное дежурство`, random_id: getRandomId() });
                checkAllVoted(mafia, params.chat_id);
            }
        }
    },



    {
        payload: "mafia_love",
        async f(msg) {
            const { params } = msg;
            await chatFromDb(params.chat_id);

            if (!chats[params.chat_id]["mafia"]) return;

            let { mafia } = chats[params.chat_id];

            if (mafia.phase != "night") return;
            if (mafia.votes.putana.id) return;
            if (mafia.users[msg.senderId] && mafia.users[msg.senderId].role == "putana" && mafia.users[params.id]) {

                mafia.votes.putana = {
                    id: params.id,
                    putana_id: msg.senderId
                };

                msg.send("✅ Выбор сделан");
                vkGroup.api.messages.send({ peer_id: (2e9 + params.chat_id), message: `💞 Путана вышла на работу`, random_id: getRandomId() });
                checkAllVoted(mafia, params.chat_id);
            }
        }
    },



    {
        payload: "mafia_vote",
        async f(msg) {
            const { params } = msg;
            await chatFromDb(params.chat_id);

            if (!chats[params.chat_id]["mafia"]) return msg.send(`🚫 Игра окончена`, {
                keyboard: JSON.stringify({
                    buttons: []
                })
            });

            let { mafia } = chats[params.chat_id],
                user = mafia.users[msg.senderId];

            if (mafia.phase != "night") return msg.send(`🚫 Сейчас не ночь`, {
                keyboard: JSON.stringify({
                    buttons: []
                })
            });
            if (mafia.votes.mafia.don) return msg.send(`🚫 Дон уже проголосовал`, {
                keyboard: JSON.stringify({
                    buttons: []
                })
            });;

            let mafias = [];
            for (let i in mafia.users) {
                if (mafia.users[i].role == "mafia" || mafia.users[i].role == "don") mafias.push(i);
            }

            if (user && (user.role == "don" || user.role == "mafia") && mafia.users[params.id]) {
                if (user.role == "don") {
                    mafia.votes.mafia.don = params.id;
                    vkGroup.api.messages.send({ peer_id: (2e9 + params.chat_id), message: `🧛‍♂️ Мафия выбрала себе жертву`, random_id: getRandomId() });
                    vkGroup.api.messages.send({
                        peer_ids: mafias.join(","),
                        message: `🧛‍♂️ Дон ${getShortNick(msg.senderId, user)} выбрал ${getShortNick(params.id, mafia.users[params.id])} как следующую жертву`,
                        keyboard: JSON.stringify({
                            buttons: []
                        }),
                        random_id: getRandomId()
                    });
                } else {
                    mafia.votes.mafia.mafias[msg.senderId] = params.id;
                    vkGroup.api.messages.send({ peer_ids: mafias.join(","), message: `🧛‍♂️ Мафия ${getShortNick(msg.senderId, user)} голосует за ${getShortNick(params.id, mafia.users[params.id])}`, random_id: getRandomId() });
                }
                msg.send("✅ Выбор сделан", {
                    keyboard: JSON.stringify({
                        buttons: []
                    })
                });
                checkAllVoted(mafia, params.chat_id);
            }
        }
    },



    {
        payload: "mafia_com",
        async f(msg) {
            const { params } = msg;
            await chatFromDb(params.chat_id);

            if (!chats[params.chat_id]["mafia"]) return;

            let { mafia } = chats[params.chat_id],
                user = mafia.users[msg.senderId];

            if (mafia.phase != "night") return;
            if (mafia.votes.com.id) return;

            if (user && user.role == "com" && mafia.users[params.id]) {
                if (params.from == "start") {
                    msg.send(`❔ Выберите, что хотите сделать с ${getShortNick(params.id, mafia.users[params.id])}`, {
                        keyboard: Keyboard.keyboard([
                            Keyboard.textButton({
                                label: "🔫 Убить",
                                payload: {
                                    command: "mafia_com",
                                    params: Object.assign({}, params, { from: "choise", check: false })
                                },
                                color: Keyboard.NEGATIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: "🔎 Проверить",
                                payload: {
                                    command: "mafia_com",
                                    params: Object.assign({}, params, { from: "choise", check: true })
                                },
                                color: Keyboard.PRIMARY_COLOR
                            })
                        ]).oneTime()
                    });
                } else {
                    mafia.votes.com = {
                        id: params.id,
                        check: params.check,
                        com_id: msg.senderId
                    };
                    vkGroup.api.messages.send({ peer_id: (2e9 + params.chat_id), message: `🕵‍♂ Комиссар ${params.check ? "вышел на поиски преступников" : "зарядил оружие"}`, random_id: getRandomId() });
                    msg.send("✅ Выбор сделан");
                    checkAllVoted(mafia, params.chat_id);
                }
            }
        }
    },



    {
        payload: "mafia_linch_vote",
        async f(msg) {
            const { params } = msg;
            await chatFromDb(params.chat_id);

            if (!chats[params.chat_id]["mafia"]) return;

            let { mafia } = chats[params.chat_id],
                user = mafia.users[msg.senderId];

            if (mafia.phase != "vote2") return;
            if (mafia.linchvote[msg.senderId]) return;

            if (user) {
                mafia.linchvote[msg.senderId] = params.user_id;
                msg.send(`✅ Вы отдали голос за ${getShortNick(params.user_id, mafia.users[params.user_id])}`);
                vkGroup.api.messages.send({
                    peer_id: (2e9 + params.chat_id),
                    message: `📝 ${getShortNick(msg.senderId, mafia.users[msg.senderId])} проголосовал(а)`,
                    random_id: getRandomId()
                });
            }
            if (Object.keys(mafia.linchvote).length == Object.keys(mafia.users).length) {
                await db.collection("mafia").updateOne({
                    id: parseInt(params.chat_id)
                }, {
                    $set: {
                        time: 0
                    }
                });
            }
        }
    },



    {
        payload_callback: "mafia_linch_final_vote",
        payload: "mafia_linch_final_vote",
        async f(msg) {
            const { params } = msg;

            await chatFromDb(params.chat_id);

            if (!chats[params.chat_id]["mafia"]) return;

            let { mafia } = chats[params.chat_id],
                user = mafia.users[msg.senderId];

            if (mafia.phase != "day") {
                if (msg.type == "payload_callback") {
                    return msg.answer({
                        type: "show_snackbar",
                        text: `⛔ Время голосования окончено`
                    });
                }
                return;
            };
            if (user) {
                if (msg.type == "payload_callback") {
                    if (mafia.votetokill.id == msg.senderId) return msg.answer({
                        type: "show_snackbar",
                        text: `⛔ Вы не можете проголосвать`
                    });
                    if (mafia.votetokill.votes[msg.senderId]) return msg.answer({
                        type: "show_snackbar",
                        text: `⛔ Вы уже голосовали`
                    });
                    msg.answer({
                        type: "show_snackbar",
                        text: `✅ Ваш голос засчитан`
                    });
                } else {
                    if (mafia.votetokill.id == msg.senderId) return msg.send(`⛔ Вы не можете проголосвать\n💡 Используйте смартфон, что бы играть комфортнее.`);
                    if (mafia.votetokill.votes[msg.senderId]) return msg.send(`⛔ Вы уже голосовали\n💡 Используйте смартфон, что бы играть комфортнее.`);
                    msg.send(`✅ ${msg.prefix}Ваш голос засчитан\n💡 Используйте смартфон, что бы играть комфортнее.`);
                }
                mafia.votetokill.votes[msg.senderId] = true;
                if (params.kill) mafia.votetokill.kill.yes++; else mafia.votetokill.kill.no++
                vkGroup.api.messages.send({
                    peer_id: 2e9 + params.chat_id,
                    message: `📃 ${getShortNick(msg.senderId, mafia.users[msg.senderId])} проголосовал(а)`,
                    random_id: getRandomId()
                });
                if (Object.keys(mafia.votetokill.votes).length == (Object.keys(mafia.users).length - 1)) {
                    await db.collection("mafia").updateOne({
                        id: parseInt(params.chat_id)
                    }, {
                        $set: {
                            time: 0
                        }
                    });
                }
            }
        }
    }
];