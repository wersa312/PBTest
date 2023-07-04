const { getRandomId } = require("vk-io");
const { getAdmins } = require("../../api/admin_utils");
const { log } = require("../../api/logs");
const { users, bans, vkGroup } = require("../../main"),
    { vkFromDb, vkId } = require("../../api/acc"),
    { dateFormat, timeFormat } = require("../../api/utils");

module.exports = [
    {
        r: /^(ban|бан)( (.*))?$/i,
        status: 100,
        async f(msg, user) {
            let text = msg.text.split(" ");
            if (!text[1]) return;

            let id = await vkId(text[1]);
            await vkFromDb(id);
            if (id == -1) return msg.send(`❌ Игрок не найден`);

            if (!user.admin_events.canBan) return msg.send(`❌ Нет доступа`);
            if (users[id].admin_events?.ban_imun && (msg.senderId != 231812819 && msg.senderId != 548355691)) return msg.send("❌ Низзя");
            if (bans[id] && bans[id].time < 0) return msg.send(`❌ Пользователь в бане навсегда`);

            let time, whyBanned;
            if (!text[2] || !/[0-9]+(ч|м|с|д|нд|м|л)/i.test(text[2])) {
                time = -1;
                whyBanned = text.slice(2).join(" ");
            } else {
                let timeStr = text[2].match(/[0-9]+(ч|м|с|д|нд|м|л)/i), deltaTime;
                switch (timeStr[1]) {
                    case "с":
                        deltaTime = 1;
                        break;
                    case "м":
                        deltaTime = 60;
                        break;
                    case "ч":
                        deltaTime = 3600;
                        break;
                    case "д":
                        deltaTime = 86400;
                        break;
                    case "нд":
                        deltaTime = 604800;
                        break;
                    case "м":
                        deltaTime = 2592000;
                        break;
                    case "л":
                        deltaTime = 31536000;
                        break;
                }
                time = parseInt(timeStr[0]) * deltaTime;
                whyBanned = text.slice(3).join(" ");
            }

            if (whyBanned == "" || whyBanned == " ") whyBanned = "Неизвестно";

            if (time == -1) {
                bans[id] = {
                    time: time,
                    reason: whyBanned,
                    by: msg.senderId
                };
                msg.send(`✅ @id${id} (${users[id].nick}) заблокирован перманентно`);
                vkGroup.api.messages.send({
                    user_ids: await getAdmins(),
                    random_id: getRandomId(),
                    message: `🔒 @id${msg.senderId} (${user.nick}) забанил игрока @id${id} (${users[id].nick})\n📝 Причина: ${whyBanned}\n#pbban`
                });
            } else {
                if (bans[id]) {
                    bans[id].time += time;
                    msg.send(`✅ @id${id} (${users[id].nick}) бан продлен на ${timeFormat(time)}\n⏳ До разбана: ${timeFormat(bans[id].time)}`);
                    vkGroup.api.messages.send({
                        user_ids: await getAdmins(),
                        random_id: getRandomId(),
                        message: `🔒 @id${msg.senderId} (${user.nick}) продлил бан игроку @id${id} (${users[id].nick}) на ${timeFormat(time)}\n⏳ До разбана: ${timeFormat(bans[id].time)}\n📝 Причина: ${whyBanned}\n#pbban`
                    });
                } else {
                    bans[id] = {
                        time: time,
                        reason: whyBanned,
                        by: msg.senderId
                    };
                    msg.send(`✅ @id${id} (${users[id].nick}) заблокирован на ${timeFormat(time)}\n📝 Причина: ${whyBanned}`);
                    vkGroup.api.messages.send({
                        user_ids: await getAdmins(),
                        random_id: getRandomId(),
                        message: `🔒 @id${msg.senderId} (${user.nick}) забанил игрока @id${id} (${users[id].nick}) на ${timeFormat(time)}\n📝 Причина: ${whyBanned}\n#pbban`
                    });
                }
            }
            user.admin_events.bans_gived++;
            user.cookie += 1000;
        }
    },
    {
        r: /^(?:разбан|unban)(?: ([\S]+))?$/i,
        status: 100,
        async f(msg, user) {
            let id = await vkId(msg.match[1]);
            await vkFromDb(id);
            if (!users[id]) return msg.send(`🚫 Игрок не найден`);

            if (!user.admin_events.canBan) return msg.send(`🚫 Нет доступа`);

            if (!bans[id]) return msg.send("🚫 Не найдено в бан листе");

            delete bans[id];
            msg.send("✅ *id" + id + " разблокирован");
            log(id, "Разблокирован админом *id" + msg.senderId);
            log(msg.senderId, "Разблокировал *id" + id);

            vkGroup.api.messages.send({
                user_ids: await getAdmins(),
                random_id: getRandomId(),
                message: `🔒 @id${msg.senderId} (${user.nick}) разблокировал игрока @id${id} (${users[id].nick})\n#pbban`
            });
        }
    }
]