const { vkId, vkFromDb } = require("../../api/acc");
const { users } = require("../../main");

module.exports = [
    {
        r: /^setnick ([\S]+) ([\S]+)/i,
        status: 100,
        async f(msg, user) {
            if (user.admin_events?.canEdit) {
                let id = await vkId(msg.match[1]);
                await vkFromDb(id);

                if (!users[id]) return msg.send(`❌ Не найден`);

                let nick = msg.match[2];

                users[id].nick = nick;
                msg.send(`✅ Установлен ник: @id${id} (${users[id].nick})`);
            }
        }
    }
]