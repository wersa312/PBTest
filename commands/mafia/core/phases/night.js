const { vkGroup, db, users } = require("../../../../main");
const { sortRandom } = require("../../../../api/utils");
const getShortNick = require("../api/getShortNick");
const mafia_config = require("../api/config.json");
const kill = require("../api/kill");
const { vkFromDb } = require("../../../../api/acc");
const gameOver = require("../api/gameover");
const mafia_default = require("../../mafia_default.json");
const { getRandomId } = require("vk-io");
const send = async (obj) => {
    return await vkGroup.api.messages.send(Object.assign({}, obj, { random_id: getRandomId() }));
};

module.exports = async (mafia, md) => {
    md.time = ((+new Date()) + (mafia.settings.timeout.night * 60 * 1000));
    await db.collection("mafia").updateOne({ id: md.id }, { $set: md });
    await vkFromDb(Object.keys(mafia.users));

    for (let i in mafia.users) {
        if (users[i]?.scene == "mafia_talk") delete users[i].scene;
    }

    mafia.phase = "vote";

    let putanaId,
        putanaVictim,
        toDie = [];

    /*
        ⬇MASHA⬇
    */

    if (mafia.votes.putana.id) {
        putanaId = mafia.votes.putana.putana_id;
        putanaVictim = mafia.votes.putana.id;
        let postfix = '',
            { id } = mafia.votes.putana;
        if (mafia.users[id].role != "") {
            postfix = ' Ваш ход заблокирован';
            let { role } = mafia.users[id];
            if (role == "don") {
                mafia.votes.mafia.don = null;
            } else if (role == "mafia") {
                if (mafia.votes.mafia.mafias[id]) delete mafia.votes.mafia.mafias[id];
            } else if (role == "com") {
                mafia.votes.com = {
                    "id": null,
                    "com_id": null,
                    "check": null
                };
            } else if (role == "doc") {
                mafia.votes.doc = {
                    "id": null,
                    "doc_id": null
                };
            }
        }

        send({ peer_id: id, message: `😏 К вам заглянула Путана.${postfix}` });
    };

    /*
        ⬆MASHA⬆
    */

    /*
        ⬇MAFIA⬇
    */

    if (mafia.votes.mafia.don) {
        let id = mafia.votes.mafia.don;
        toDie.push(parseInt(id));
        if (id == putanaId) toDie.push(putanaVictim);
    } else if (Object.keys(mafia.votes.mafia.mafias).length) {
        let vote = {},
            { mafias } = mafia.votes.mafia;

        for (let m in mafias) {
            if (!vote[m]) vote[m] = 0;
            vote[m]++;
        }
        let [toKillFromMaf] = Object.keys(vote).sort((a, b) => vote[a] - vote[b]);
        toKillFromMaf = mafias[toKillFromMaf];
        toDie.push(parseInt(toKillFromMaf));
        send({
            peer_ids: mafia.mafias.map(m => parseInt(m.id)),
            message: `⏳ Так-как дон не проголосовал, жертвой выбран ${getShortNick(toKillFromMaf, mafia.users[toKillFromMaf])}`
        });
    }

    /*
        ⬆MAFIA⬆
    */

    /*
        ⬇COM⬇
    */

    if (mafia.votes.com.id) {
        let { com } = mafia.votes,
            victim = mafia.users[com.id];
        if (com.check) {
            let fakeUsed = false;
            if ((victim.role == "don" || victim.role == "mafia") && users[com.id].mafiainv.fake_docs > 0) {
                if (!victim.fakeUsed) {
                    fakeUsed = true;
                    victim.fakeUsed = true;
                    users[com.id].mafiainv.fake_docs--;
                }
            }

            send({ peer_id: com.id, message: `👁 Кто-то заинтересовался вашей ролью.${fakeUsed ? " Был использован фейковый документ" : ''}` });
            send({ peer_id: com.com_id, message: `👁 ${getShortNick(com.id, victim)} - ${fakeUsed ? "не является мафией" : ((victim.role == "mafia" || victim.role == "don") ? "мафия" : "не является мафией")}` });
        } else {
            if (toDie.indexOf(parseInt(com.id)) == -1) toDie.push(parseInt(com.id));
        }
    }

    /*
        ⬆COM⬆
    */

    /*
        ⬇DOC⬇
    */

    if (mafia.votes.doc.id) {
        let { doc } = mafia.votes,
            healIndex = toDie.indexOf(parseInt(doc.id));

        if (doc.id == doc.doc_id) {
            mafia.dochealed = true;
        }

        if (healIndex != -1) {
            toDie.splice(healIndex, 1);
            if (doc.doc_id != doc.id) {
                send({ peer_id: doc.id, message: `💊 Вам спасли жизнь` });
                send({ peer_id: doc.doc_id, message: `💊 Вы спасли жизнь` });
            } else {
                send({ peer_id: doc.doc_id, message: `💊 Вы спасли себе жизнь` });
            }
        } else {
            if (doc.doc_id != doc.id) {
                send({ peer_id: doc.id, message: `💊 Вас посетил доктор` });
                send({ peer_id: doc.doc_id, message: `💊 Вы посетили ${getShortNick(doc.id, mafia.users[doc.id])}, ничего не произошло` });
            } else {
                send({ peer_id: doc.doc_id, message: `💊 Ночью ничего не произошло с вами` });
            }
        }
    }

    /*
        ⬆DOC⬆
    */

    let shieldused = [];

    for (let ind in toDie) {
        let i = toDie[ind];
        if (!mafia.users[i].usedShield) {
            if (users[i].mafiainv.save > 0) {
                users[i].mafiainv.save--;
                mafia.users[i].usedShield = true;
                shieldused.push(i);
                toDie.splice(ind, 1);
            }
        }
    }

    let donDied = false,
        gameover = {
            end: false,
            reason: null
        };

    toDie.forEach(id => {
        if (mafia.users[id]) {
            if (mafia.users[id].role == "don") donDied = true;
            kill(id, mafia);
        }
    });

    let mafias = [], peace_h = 0;

    for (let i in mafia.users) {
        if (mafia.users[i].role == "mafia" || mafia.users[i].role == "don") {
            mafias.push(i);
        } else {
            peace_h++;
        }
    }

    if (donDied) {
        if (mafias.length) {
            let [donId] = mafias;
            mafia.users[donId].role = "don";
            send({ peer_ids: mafias.join(','), message: `🧛‍♂️ Новый дон - ${getShortNick(donId, mafia.users[donId])}` });
        } else {
            gameover.end = true;
            gameover.reason = "mafia_lost";
        }
    }

    if (peace_h <= mafias.length) {
        gameover.end = true;
        gameover.reason = "mafia_win";
    }

    if (shieldused.length) send({ peer_ids: shieldused.join(","), message: `🛡 Защита была потрачена` });

    mafia.votes = JSON.parse(JSON.stringify(mafia_default.votes));

    send({
        peer_id: (2e9 + md.id),
        message: `🌅 Наступает утро.\n\n${toDie.length ? `💀 Игру покинули:\n${toDie.map(id => '🔸 ' + getShortNick(id, mafia.dead[id])).join("\n")}` : '🕊 Этой ночью все остались в живых.'}\n👥 В живых:\n${Object.keys(mafia.users).sort(sortRandom).map(id => '🔹 ' + getShortNick(id, mafia.users[id])).join('\n')}${gameover.end ? '' : '\n\n💭 Время обсудить то, что произошло ночью'}`,
        attachment: mafia_config.gifs.day,
        disable_mentions: 1
    });

    if (gameover.end) {
        gameOver(md.id, gameover.reason);
    }
}