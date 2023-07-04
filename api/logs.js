const { db } = require("../main"),
    { numberWithCommas } = require("../api/utils");

let logs = {}, clanlogs = {};

exports.log = (id, action) => {
    if (!logs[id]) logs[id] = [];
    let date = new Date();
    logs[id].push(`[${date.getHours()}:${date.getMinutes()}]: ${action}`);
    return;
}

exports.logClan = (id, obj) => {
    if (!clanlogs[id]) clanlogs[id] = [];
    obj.date = +new Date();
    clanlogs[id].push(JSON.parse(JSON.stringify(obj)));
    return;
}

async function saveLogs() {
    let date = +new Date();
    for (let num in logs) {
        await db.collection("logs").updateOne({
            id: parseInt(num)
        }, {
            $set: {
                [date]: logs[num]
            },
            $setOnInsert: {
                id: parseInt(num)
            }
        }, {
            upsert: true
        });
    }
    logs = {};
}

exports.saveLogs = saveLogs;

async function saveClanLogs() {
    let date = +new Date();
    for (let num in clanlogs) {
        await db.collection("clanlogs").updateOne({
            id: parseInt(num)
        }, {
            $set: {
                [date]: clanlogs[num]
            },
            $setOnInsert: {
                id: parseInt(num)
            }
        }, {
            upsert: true
        });
    }
    clanlogs = {};
}

function logToString(obj) {
    let toReturn,
        params = obj.params,
        date = new Date(obj.date);
    switch (obj.type) {
        case "pay_to":
            toReturn = `Перевел игроку *id${params.toId} ${numberWithCommas(params.money)}$ | Было: ${numberWithCommas(params.bmoney)}$ | Стало: ${numberWithCommas(params.amoney)}$`
            break;
        case "pay_get":
            toReturn = `Получил от игрока *id${params.fromId} ${numberWithCommas(params.money)}$ | Было: ${numberWithCommas(params.bmoney)}$ | Стало: ${numberWithCommas(params.amoney)}$`
            break;
        case "bank_up":
            toReturn = `Положил в банк ${numberWithCommas(params.money)}$ | На руках: ${numberWithCommas(params.pocket)} | Банк: ${numberWithCommas(params.bank)}$`;
            break;
        case "bank_down":
            toReturn = `Снял с банка ${numberWithCommas(params.money)}$ | На руках: ${numberWithCommas(params.pocket)} | Банк: ${numberWithCommas(params.bank)}$`;
            break;
        case "clan_create":
            toReturn = `Создал клан с названием ${params.name} | ID: ${params.id}`;
            break;
        case "user_change_nick":
            toReturn = `Сменил ник на ${params.new_nick} | Старый: ${params.old_nick}`;
            break;
        case "pay_to_clan":
            toReturn = `Пополнил казну клана (${params.id}) на ${numberWithCommas(params.money)}$ | Было: ${numberWithCommas(params.bmoney)}$ | Стало: ${numberWithCommas(params.amoney)}$`;
            break;
    }
    if (!toReturn) {
        console.log("logToString ERROR: " + JSON.stringify(obj));
        toReturn = "Действие не прочитано: " + JSON.stringify(obj);
    }
    toReturn = `[${date.getHours()}:${date.getMinutes()}] ` + toReturn;
    return toReturn;
}

function clanLogToString(obj) {
    let toReturn,
        params = obj.params,
        date = new Date(obj.date);
    try {
        switch (obj.type) {
            case "invite":
                toReturn = `*id${params.by} пригласил @id${params.to}`;
                break;
            case "accept_invite":
                toReturn = `*id${params.id} принял приглашение от @id${params.by}`;
                break;
            case "rename":
                toReturn = `*id${params.id} переименовал клан в ${params.new_name} | Старое название: ${params.old_name}`;
                break;
            case "clan_member_change_rank":
                toReturn = `*id${params.by} изменил роль *id${params.to} | Новая роль: ${params.new_rank}`;
                break;
            case "clan_kick":
                toReturn = `*id${params.by} исключил *id${params.to}`;
                break;
            case "clan_remove":
                toReturn = `*id${params.by} удалил клан`;
                break;
            case "clan_pay":
                toReturn = `*id${params.by} выдалил для зарплаты: ${numberWithCommas(params.money)}$ | Каждому игроку(${numberWithCommas(params.count_users)}): ${numberWithCommas(params.per_money)}$`;
                break;
            case "pay_to_clan":
                toReturn = `@id${params.from_id} пополнил казну клана на ${numberWithCommas(params.money)}$ | Было: ${numberWithCommas(params.bmoney)}$ | Стало: ${numberWithCommas(params.amoney)}$`;
                break;
        }
    } catch (err) {
        console.log("logToString ERROR: ", err);
        console.log("logToString obj: ", obj);
        toReturn = "Потеря данных";
    }

    if (!toReturn) {
        console.log("logToString ERROR: " + JSON.stringify(obj));
        toReturn = "Действие не прочитано: " + JSON.stringify(obj);
    }
    toReturn = `[${date.getHours()}:${date.getMinutes()}] ` + toReturn;
    return toReturn;
}

exports.clanLogToString = clanLogToString;
exports.logToString = logToString;

setInterval(() => {
    saveLogs();
    saveClanLogs();
}, 300000);