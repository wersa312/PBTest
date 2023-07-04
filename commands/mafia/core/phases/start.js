const { vkGroup, db, users } = require("../../../../main");
const cancel = require("../api/cancel");
const { clubLink, sortRandom, declOfNum } = require("../../../../api/utils");
const getShortNick = require("../api/getShortNick");
const { Keyboard, getRandomId } = require("vk-io");
const mafia_config = require("../api/config.json");
const { vkFromDb } = require("../../../../api/acc");
const send = async (obj) => {
    return await vkGroup.api.messages.send(Object.assign({}, obj, { random_id: getRandomId() }));
};

module.exports = async (mafia, md) => {
    if (Object.keys(mafia.users).length < 4) {
        return cancel(md.id, '⛔ Игра отменена, так как количество игроков меньше 4-х');
    }

    mafia.started = true;

    md.time = ((+new Date()) + (mafia.settings.timeout.night * 60 * 1000));
    await db.collection("mafia").updateOne({ id: md.id }, { $set: md });

    mafia.phase = "night";


    let game_users = Object.keys(mafia.users).sort(sortRandom),
        mafia_count = Math.round(game_users.length / 4),
        roles = {
            don: 0,
            maf: [],
            doc: 0,
            com: 0,
            putana: 0
        };


    /*
        MAFIA BLOCK -->
    */
    for (let i = 0; i < mafia_count; i++) {
        if (i == 0) {
            mafia.users[game_users[i]].role = "don";
            mafia.mafias.push({ id: game_users[i], don: true });
            roles.don = game_users[i];
        } else {
            mafia.users[game_users[i]].role = "mafia";
            roles.maf.push(game_users[i]);
            mafia.mafias.push({ id: game_users[i], don: false });
        }
    }

    let allmafs = [roles.don].concat(roles.maf);
    await vkFromDb(allmafs);
    allmafs.forEach(id => {
        users[id].scene = "mafia_talk";
        users[id].scenemafia = md.id;
    });

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

    send({ user_id: roles.don, message: `🎲 Игра началась. Ваша роль -- ${clubLink("Дон мафии")}${roles.maf.length > 0 ? `\n👥 Мафия:\n${roles.maf.map(id => getShortNick(id, mafia.users[id])).join("\n")}` : ''}\n\n🔫 Выберите, кого вы хотите убить этой ночью`, keyboard: toVote });
    if (roles.maf.length > 0) send({ user_ids: roles.maf.join(','), message: `🎲 Игра началась.\n🦹‍♂️ Дон мафии - ${getShortNick(roles.don, mafia.users[roles.don])}\n👥 Мафия:\n ${roles.maf.map(id => getShortNick(id, mafia.users[id])).join("\n")}\n\n🔫 Выберите, за кого вы голосуете убить этой ночью`, keyboard: toVote });

    /*
        <-- MAFIA BLOCK
    */


    /*
        COM BLOCK -->
    */

    const com_id = game_users[mafia_count + 1];
    mafia.users[com_id].role = "com";
    roles.com = com_id;

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

    send({ user_id: com_id, message: `🎲 Игра началась. Ваша роль -- ${clubLink("Комиссар")}\n👮‍♂️ Выбирайте, кого мы этой ночью проверим/застрелим?`, keyboard: comButtons })

    /*
        <-- COM BLOCK
    */


    /*
        DOCTOR BLOCK -->
    */
    if (game_users.length >= 5) {
        const doctor_id = game_users[mafia_count + 2];
        mafia.users[doctor_id].role = "doc";
        roles.doc = doctor_id;

        const docButtons = Keyboard.keyboard(game_users.map(id => {
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

        send({ user_id: doctor_id, message: `🎲 Игра началась. Ваша роль -- ${clubLink("Доктор")}\n💉 Выбирайте, кого мы этой ночью спасем?`, keyboard: docButtons })
    }
    /*
        <-- DOCTOR BLOCK
    */


    /*
        MASHA BLOCK -->
    */

    if (game_users.length >= 6) {
        const putana_id = game_users[mafia_count + 3];
        mafia.users[putana_id].role = "putana";
        roles.putana = putana_id;

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

        send({ user_id: putana_id, message: `🎲 Игра началась. Ваша роль -- ${clubLink("Путана")}\n💕 Выбирайте, к кому заглянем этой ночью?`, keyboard: putanaButtons })
    }

    /*
        <-- MASHA BLOCK
    */

    /*
        OTHERS BLOCK -->
    */

    let common_players = game_users.filter(id => mafia.users[id].role == "");
    send({ user_ids: common_players.join(","), message: `🎲 Игра началась. Ваша роль -- ${clubLink("Мирный гражданин")}\n❔ Ваша задача повесить на дневном собрании мафию` });

    /*
        <-- OTHERS BLOCK
    */


    let roles_str = ["Дон"];
    if (roles.maf.length) roles_str.push(`${roles.maf.length} ${roles.maf.length==1?'мафия':'мафии'}`);
    roles_str.push("комиссар");
    if (roles.doc) roles_str.push("доктор");
    if (roles.putana) roles_str.push("путана");
    send({
        chat_id: md.id, message: `🌃 Наступает ночь. До утра: ${mafia.settings.timeout.night} мин.\n\n👥 В живых:\n${game_users.sort(sortRandom).map(id => '🔹 ' + getShortNick(id, mafia.users[id])).join('\n')}\n\n📰 Роли: ${roles_str.join(', ')}`,
        keyboard: JSON.stringify({
            buttons: []
        }),
        attachment: mafia_config.gifs.night,
        disable_mentions: 1
    });
}