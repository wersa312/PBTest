const { db, Keyboard } = require("../../main"),
    { numberToSmile, numberWithCommas } = require("../../api/utils");

module.exports = {
    r: /^(top|топ)( ([^\s]+))?$/i,

    payload: "top",
    async f(msg) {
        let type = { type: "users", gold: -1 }, users, clans;
        if (msg.type == "payload" && msg.params != "from_menu") {
            switch (msg.params.type) {
                case "money":
                    type = { type: "users", gold: -1 };
                    break;
                case "clans":
                    type = { type: "clans", rating: -1 };
                    break;
                case "mafia":
                    type = { type: "mafia", mafcoin: -1 };
                    break;
                case "snow":
                    type = { type: "snow", mafcoin: -1 };
                    break;
            }
        } else {
            if (msg.match?.[3]) {
                if (msg.match[3] == "кланов" || msg.match[3] == "кланы") {
                    type = { type: "clans", rating: -1 };
                } else if (msg.match[3] == "богатых") {
                    type = { type: "users", gold: -1 };
                } else if (msg.match[3] == "мафии") {
                    type = { type: "mafia", mafcoin: -1 };
                } else if (msg.match[3] == "мафии") {
                    type = { type: "mafia", mafcoin: -1 };
                } else if (msg.match[3] == "снежинок") {
                    type = { type: "snow", mafcoin: -1 };
                }
            } else {
                users = await db.collection("users").find({ bantop: { $ne: true } }).sort({
                    gold: -1
                }).project({ vk: 1, gold: 1, nick: 1 }).limit(10).toArray();
                clans = await db.collection("clans").find({ rating: { $gt: 0 }, name: { $ne: "deleted" } }).sort({
                    rating: -1
                }).project({ name: 1, rating: 1, creator: 1, members: 1 }).limit(5).toArray();
                return msg.send(`💰 Топ богатых:
⠀${users.map((user, i) => `${numberToSmile(i + 1)} @id${user.vk} (${user.nick}) - ${numberWithCommas(user.gold)} ⚜️`).join("\n⠀")}

🛡 Топ кланов:
⠀${clans.map((clan, i) => `${numberToSmile(i + 1)} @id${clan.creator} (${clan.name}) [${Object.keys(clan.members).length}/100]\n⠀⠀⠀⠀${numberWithCommas(clan.rating)} 🔥`).join("\n⠀")}`, {
                    keyboard: Keyboard.keyboard([
                        [
                            Keyboard.textButton({
                                label: '💰 Топ богатых',
                                payload: {
                                    command: 'top',
                                    params: {
                                        type: "users"
                                    }
                                },
                                color: Keyboard.SECONDARY_COLOR
                            }),
                            Keyboard.textButton({
                                label: '🛡 Топ кланов',
                                payload: {
                                    command: 'top',
                                    params: {
                                        type: "clans"
                                    }
                                },
                                color: Keyboard.SECONDARY_COLOR
                            })
                        ],
                        [
                            Keyboard.textButton({
                                label: '🤵 Топ мафии',
                                payload: {
                                    command: 'top',
                                    params: {
                                        type: "mafia"
                                    }
                                },
                                color: Keyboard.SECONDARY_COLOR
                            }),
                            Keyboard.textButton({
                                label: '❄ Топ снежинок',
                                payload: {
                                    command: 'top',
                                    params: {
                                        type: "snow"
                                    }
                                },
                                color: Keyboard.SECONDARY_COLOR
                            })
                        ]]).inline()
                });
            }
        }
        if (type.type == "users") {
            users = await db.collection("users").find({ bantop: { $ne: true } }).sort({
                gold: -1
            }).project({ vk: 1, gold: 1, nick: 1 }).limit(50).toArray();
            return msg.send(`💰 Топ богатых:
⠀${users.map((user, i) => `${numberToSmile(i + 1)} @id${user.vk} (${user.nick}) - ${numberWithCommas(user.gold)} ⚜️`).join("\n⠀")}`, {
                keyboard: Keyboard.keyboard([[
                    Keyboard.textButton({
                        label: '🛡 Топ кланов',
                        payload: {
                            command: 'top',
                            params: {
                                type: "clans"
                            }
                        },
                        color: Keyboard.SECONDARY_COLOR
                    }),
                    Keyboard.textButton({
                        label: '🤵 Топ мафии',
                        payload: {
                            command: 'top',
                            params: {
                                type: "mafia"
                            }
                        },
                        color: Keyboard.SECONDARY_COLOR
                    })
                ]]).inline()
            });
        } else if (type.type == "clans") {
            clans = await db.collection("clans").find({ rating: { $gt: 0 }, name: { $ne: "deleted" } }).sort({
                rating: -1
            }).project({ name: 1, rating: 1, creator: 1, members: 1 }).limit(10).toArray();
            msg.send(`🛡 Топ кланов:
⠀${clans.map((clan, i) => `${numberToSmile(i + 1)} @id${clan.creator} (${clan.name}) [${Object.keys(clan.members).length}/100]\n⠀⠀⠀⠀${numberWithCommas(clan.rating)} 🔥`).join("\n⠀")}`, {
                keyboard: Keyboard.keyboard([[
                    Keyboard.textButton({
                        label: '💰 Топ богатых',
                        payload: {
                            command: 'top',
                            params: {
                                type: "users"
                            }
                        },
                        color: Keyboard.SECONDARY_COLOR
                    }),
                    Keyboard.textButton({
                        label: '🤵 Топ мафии',
                        payload: {
                            command: 'top',
                            params: {
                                type: "mafia"
                            }
                        },
                        color: Keyboard.SECONDARY_COLOR
                    })
                ]]).inline()
            });
        } else if (type.type == "mafia") {
            users = await db.collection("users").find({ bantop: { $ne: true }, mafcoin: { $ne: null } }).sort({
                mafcoin: -1
            }).project({ vk: 1, mafcoin: 1, nick: 1 }).limit(10).toArray();
            return msg.send(`🤵 Топ мафии:
⠀${users.map((user, i) => `${numberToSmile(i + 1)} @id${user.vk} (${user.nick}) - ${numberWithCommas(user.mafcoin)} 💵`).join("\n⠀")}`);
        } else if (type.type == "snow") {
            users = await db.collection("users").find({ "newYear.coins": { $ne: null } }).sort({
                "newYear.coins": -1
            }).project({ vk: 1, "newYear.coins": 1, nick: 1 }).limit(30).toArray();
            return msg.send(`❄ Топ снежинок:
⠀${users.map((user, i) => `${numberToSmile(i + 1)} @id${user.vk} (${user.nick}) - ${numberWithCommas(user.newYear.coins)} ❄`).join("\n⠀")}`);
        }
    }
}