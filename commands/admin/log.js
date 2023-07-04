const { db, users, clans, vkGroup } = require("../../main"),
    { vkFromDb, vkId } = require("../../api/acc"),
    { clanFromDb } = require("../../api/clan"),
    { clanLogToString, saveLogs } = require("../../api/logs"),
    { dateFormat } = require("../../api/utils"),
    fs = require("fs");

module.exports = [
    {
        r: /^(?:log|лог(?:и)?) ([\S]+)/i,
        status: 2,
        async f(msg, user) {
            let id = await vkId(msg.match[1]);

            await vkFromDb(id);

            if (!users[id]) return msg.send("🚫 Вы неправильно указали пользователя или пользователь не зарегистрирован\n✏ Лог [ID/ссылка]");

            let [log] = await db.collection("logs").find({
                id: parseInt(id)
            }).limit(1).toArray()

            if (!log) return msg.send("🚫 Логи не найдены");

            msg.send(("📜 Логи @id" + id + "(" + users[id].nick + "):\n" + Object.keys(log).filter(x => !isNaN(parseInt(x))).sort((a, b) => b - a).slice(0).reverse().map(x => {
                return dateFormat(new Date(parseInt(x))) + "\n" + log[x].join("\n");
            }).reverse().join("\n\n")).substring(0, 4096));
        }
    },
    {
        r: /^dlog ([\S]+)/i,
        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canLog) return;

            let id = await vkId(msg.match[1]);

            await vkFromDb(id);

            if (!users[id]) return msg.send("🚫 Вы неправильно указали пользователя или пользователь не зарегистрирован\n✏ Лог [ID/ссылка]");

            let [log] = await db.collection("logs").find({
                id: parseInt(id)
            }).limit(1).toArray()

            if (!log) return msg.send("🚫 Логи не найдены");

            log = Object.keys(log).filter(x => !isNaN(parseInt(x))).sort((a, b) => b - a).map(x => {
                return dateFormat(new Date(parseInt(x))) + "\n" + log[x].join("\n");
            }).join("\n\n");
            fs.writeFileSync(`${__dirname}/dlog/${id}.txt`, log, "utf8");
            let doc = await vkGroup.upload.messageDocument({
                source: {
                    values: {
                        value: `${__dirname}/dlog/${id}.txt`,
                        filename: "user" + id + ".txt"
                    }
                },
                peer_id: msg.peerId
            });
            msg.send(`📜 Логи @id${id} (${users[id].nick}):`,
                {
                    attachment: doc.toString()
                });
        }
    },
    {
        r: /^savelogs/i,
        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canLog) return;
            saveLogs();
            msg.send(`✅ Логи обновлены!`);
        }
    }
    /*,
    {
        r: /^(log|лог) (clan|клан)( [0-9]+)?/i,
        status: 2,
        async f(msg, user) {
            let id;
            if (!msg.match[3]) {
                if (user.clan) {
                    id = user.clan;
                } else {
                    return msg.send("🚫 Вы не указали пользователя\n✏ Лог [ID/ссылка]");
                }
            } else {
                id = parseInt(msg.match[3]);
            }

            await clanFromDb(id);

            if (!clans[id]) return msg.send("🚫 Вы неправильно указали пользователя или пользователь не зарегистрирован\n✏ Лог [ID/ссылка]");

            let [log] = await db.collection("clanlogs").find({
                id: parseInt(id)
            }).limit(1).toArray()

            if (!log) return msg.send("🚫 Логи не найдены");

            msg.send(("📜 Логи клана " + clans[id].name + ":\n" + Object.keys(log).filter(x => !isNaN(parseInt(x))).sort((a, b) => b - a).slice(0).reverse().map(x => {
                return dateFormat(new Date(parseInt(x))) + "\n" + log[x].map(clanLogToString).join("\n");
            }).reverse().join("\n\n")).substring(0, 4096));
        }
    }*/
]