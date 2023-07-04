const { getRandomId } = require("vk-io");
const { vkId, vkFromDb } = require("../../api/acc");
const { getAdmins } = require("../../api/admin_utils");
const { log } = require("../../api/logs");
const { users, vkGroup } = require("../../main");
const fs = require("fs");

module.exports = [
    {
        r: /^обнул ([\S]+)( фулл)?/i,
        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canObnul) return;

            let id = await vkId(msg.match[1]);
            await vkFromDb(id);
            if (!users[id]) return msg.send(`🚫 Не найден`);

            fs.writeFile(__dirname + "/obnul/" + id + ".json", JSON.stringify(users[id]), function () { });

            users[id].money = 0;
            users[id].bank.money = 0;
            users[id].coins = 0;
            users[id].gold = 0;
            users[id].vkcoin = 0;
            delete users[id].car;
            users[id].cars = [];
            users[id].guns = {
                'Револьвер': {
                    name: "Револьвер",
                    type: "pistol",
                    damage: 70,
                    "max_patrons": 10,
                    count: 1
                }
            };
            delete users[id].fgun_id;
            users[id].other = {};
            delete users[id].business["азс"];
            delete users[id].business["бордель"];
            delete users[id].business["магаз"];

            if (msg.match[2]) {
                users[id].business = {};
                users[id].property = {};
                if (users[id].newYear) {
                    users[id].newYear.coins = 0;
                    users[id].newYear.coupons = {};
                    users[id].newYear.activeCoupons = {};
                    users[id].newYear.cases = 0;
                }
            }

            log(msg.senderId, `Обнулил *id${id}${msg.match[2] ? " (фулл)" : ""}`);
            log(id, `Обнулен админом *id${msg.senderId}${msg.match[2] ? " (фулл)" : ""}`);
            msg.send(`${msg.prefix}вы ${msg.match[2] ? "полностью " : ""}обнулили игрока @id${id} (${users[id].nick})`);

            vkGroup.api.messages.send({
                user_ids: await getAdmins(),
                message: `⚠ @id${msg.senderId} (${user.nick}) обнулил @id${id} (${users[id].nick})${msg.match[2] ? " (фулл)" : ""}`,
                random_id: getRandomId()
            })
        }
    }
]