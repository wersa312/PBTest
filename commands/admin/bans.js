const { vkId, vkFromDb } = require("../../api/acc");
const { users } = require("../../main");

module.exports = [
    {
        r: /^(?:бантоп|bantop) ([\S]+)$/i,
        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canBan) return msg.send(`❌ Нет доступа`);

            let id = await vkId(msg.match[1]);
            await vkFromDb(id);

            if (!users[id]) return msg.send(`❌ Не найден`);

            if (users[id].bantop) {
                delete users[id].bantop;
                msg.send(`✅ Бантоп разблокирован`);
            } else {
                users[id].bantop = true;
                msg.send(`✅ Бантоп выдан`);
            }
        }
    },
    {
        r: /^(?:пбан|pban) ([\S]+)$/i,
        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canBan) return msg.send(`❌ Нет доступа`);

            let id = await vkId(msg.match[1]);
            await vkFromDb(id);

            if (!users[id]) return msg.send(`❌ Не найден`);

            if (users[id].banpay) {
                delete users[id].banpay;
                msg.send(`✅ Пбан снят`);
            } else {
                users[id].banpay = true;
                msg.send(`✅ Пбан выдан`);
            }
        }
    }
]