const { vkGroup, db, users } = require("../../../../main");
const gameOver = require("../api/gameover");
const { clubLink, sortRandom } = require("../../../../api/utils");
const getShortNick = require("../api/getShortNick");
const { Keyboard, getRandomId } = require("vk-io");
const mafia_config = require("../api/config.json");
const mafia_default = require("../../mafia_default.json");
const kill = require("../api/kill");
const { vkFromDb } = require("../../../../api/acc");
const roleToString = require("../api/roleToString");
const send = async (obj) => {
    return await vkGroup.api.messages.send(Object.assign({}, obj, { random_id: getRandomId() }));
};

module.exports = async (mafia, md) => {
    md.time = ((+new Date()) + (mafia.settings.timeout.night * 60 * 1000));
    await db.collection("mafia").updateOne({ id: md.id }, { $set: md });

    mafia.phase = "night";

    let roles = {
        don: null,
        maf: [],
        doc: null,
        com: null,
        putana: null,
        reth: []
    },
        gameover = {
            end: false,
            reason: null
        };

    let game_users = Object.keys(mafia.users);

    game_users.forEach(id => {
        switch (mafia.users[id].role) {
            case "mafia":
                roles.maf.push(id);
                break;
            case "don":
                roles.don = id;
                break;
            case "doc":
                roles.doc = id;
                break;
            case "com":
                roles.com = id;
                break;
            case "putana":
                roles.putana = id;
                break;
            default:
                roles.reth.push(id);
                break;
        }
    });

    if (mafia.votetokill.id) {
        let dieId = mafia.votetokill.id;
        if (mafia.votetokill.kill.yes <= mafia.votetokill.kill.no) {
            await await vkGroup.api.messages.send({
                chat_id: md.id,
                message: `💀 Сегодня никто не был повешан`,
                disable_mentions: 1,
                random_id: getRandomId()
            });
        } else {
            await vkGroup.api.messages.send({
                chat_id: md.id,
                message: `💀 Голосование принято. ${roleToString(mafia.users[dieId].role, true)} ${getShortNick(dieId, mafia.users[dieId])} был повешан.`,
                disable_mentions: 1,
                random_id: getRandomId()
            });
            if (mafia.users[dieId].role == "don") {
                if (roles.maf.length) {
                    let [donId] = roles.maf;
                    mafia.users[donId].role = "don";
                    send({ peer_ids: roles.maf.join(','), message: `🧛‍♂️ Новый дон - ${getShortNick(donId, mafia.users[donId])}` });
                } else {
                    gameover.end = true;
                    gameover.reason = "mafia_lost";
                }
            }
            game_users.splice(game_users.indexOf(dieId + ""), 1);
            if (roles.reth.indexOf(dieId + "") != -1) roles.reth.splice(roles.reth.indexOf(dieId + ""), 1);
            if (roles.maf.indexOf(dieId + "") != -1) roles.maf.splice(roles.maf.indexOf(dieId + ""), 1);
            kill(dieId, mafia);
        }
        mafia.votetokill = JSON.parse(JSON.stringify(mafia_default.votetokill));
    }

    mafia.linchvote = JSON.parse(JSON.stringify(mafia_default.linchvote));
    mafia.linchvote = JSON.parse(JSON.stringify(mafia_default.linchvote));

    if (!gameover.end) {
        let bufmaf = { m: 0, n: 0 };

        for (let i in mafia.users) {
            if (mafia.users[i].role == "mafia" || mafia.users[i].role == "don") {
                bufmaf.m++;
            } else {
                bufmaf.n++;
            }
        }
        if (bufmaf.m >= bufmaf.n) {
            gameover.end = true;
            gameover = "mafia_win";
        }
    }

    if (gameover.end) {
        return gameOver(md.id, gameover.reason);
    }

    const toVote = Keyboard.keyboard(game_users.map(id => {
        return Keyboard.textButton({
            label: ((mafia.users[id].role == "mafia" || mafia.users[id].role == "don") ? "🧛‍♂️ " : "") + getShortNick(id, mafia.users[id], false),
            payload: {
                command: "mafia_vote",
                params: {
                    id: id,
                    chat_id: md.id
                }
            }
        })
    }));

    let allmafs = [roles.don].concat(roles.maf);
    await vkFromDb(allmafs);
    allmafs.forEach(id => {
        users[id].scene = "mafia_talk";
        users[id].scenemafia = md.id;
    });

    send({ user_id: roles.don, message: `🌃 Наступает ночь. Ваша роль -- ${clubLink("Дон мафии")}${roles.maf.length > 0 ? `\n👥 Мафия:\n${roles.maf.map(id => getShortNick(id, mafia.users[id])).join("\n")}` : ''}\n\n🔫 Выберите, кого вы хотите убить этой ночью`, keyboard: toVote });
    if (roles.maf.length > 0) send({ user_ids: roles.maf.join(','), message: `🌃 Игра началась.\n🦹‍♂️ Наступает ночь. Дон мафии - ${getShortNick(roles.don, mafia.users[roles.don])}\n👥 Мафия:\n ${roles.maf.map(id => getShortNick(id, mafia.users[id])).join("\n")}\n\n🔫 Выберите, за кого вы голосуете убить этой ночью`, keyboard: toVote });

    /*
        <-- MAFIA BLOCK
    */


    /*
        COM BLOCK -->
    */

    if (roles.com && mafia.users[roles.com]) {
        const com_id = roles.com;

        const comButtons = Keyboard.keyboard(game_users.filter(id => id != com_id).map(id => {
            return Keyboard.textButton({
                label: getShortNick(id, mafia.users[id], false),
                payload: {
                    command: "mafia_com",
                    params: {
                        id: id,
                        chat_id: md.id,
                        from: "start"
                    }
                }
            })
        })).oneTime();

        send({ user_id: com_id, message: `🌃 Наступает ночь. Ваша роль -- ${clubLink("Комиссар")}\n👮‍♂️ Выбирайте, кого мы этой ночью проверим/застрелим?`, keyboard: comButtons });
    }


    /*
        <-- COM BLOCK
    */


    /*
        DOCTOR BLOCK -->
    */
    if (roles.doc && mafia.users[roles.doc]) {
        const doctor_id = roles.doc;

        const docButtons = Keyboard.keyboard(game_users.filter(id => {
            if (mafia.dochealed && id == roles.doc) return false;
            return true;
        }).map(id => {
            return Keyboard.textButton({
                label: (id == doctor_id ? '🥼 ' : '') + getShortNick(id, mafia.users[id], false),
                payload: {
                    command: "mafia_heal",
                    params: {
                        id: id,
                        chat_id: md.id
                    }
                }
            })
        })).oneTime();

        send({ user_id: doctor_id, message: `🌃 Наступает ночь. Ваша роль -- ${clubLink("Доктор")}\n💉 Выбирайте, кого мы этой ночью спасем?`, keyboard: docButtons })
    }
    /*
        <-- DOCTOR BLOCK
    */


    /*
        MASHA BLOCK -->
    */

    if (roles.putana && mafia.users[roles.putana]) {
        const putana_id = roles.putana;

        const putanaButtons = Keyboard.keyboard(game_users.filter(id => id != putana_id).map(id => {
            return Keyboard.textButton({
                label: getShortNick(id, mafia.users[id], false),
                payload: {
                    command: "mafia_love",
                    params: {
                        id: id,
                        chat_id: md.id
                    }
                }
            })
        })).oneTime();

        send({ user_id: putana_id, message: `🌃 Наступает ночь. Ваша роль -- ${clubLink("Путана")}\n💕 Выбирайте, к кому заглянем этой ночью?`, keyboard: putanaButtons })
    }

    /*
        <-- MASHA BLOCK
    */

    /*
        OTHERS BLOCK -->
    */

    send({ user_ids: roles.reth.join(","), message: `🌃 Наступает ночь. Ваша роль -- ${clubLink("Мирный гражданин")}` });

    /*
        <-- OTHERS BLOCK
    */

    send({
        chat_id: md.id,
        message: `🌃 Наступает ночь. До утра: ${mafia.settings.timeout.night} мин.\n\n👥 В живых:\n${game_users.sort(sortRandom).map(id => '🔹 ' + getShortNick(id, mafia.users[id])).join('\n')}`,
        keyboard: JSON.stringify({
            buttons: []
        }),
        attachment: mafia_config.gifs.night,
        disable_mentions: 1
    });
}