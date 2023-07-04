const { getRandomId } = require("vk-io");
let { bans, db, vkGroup } = require("../main");
const fs = require("fs");

const api = {
    getAdmins() {
        return new Promise(async res => {
            let admins = await db.collection("users").find({ "status.type": { $gte: 100 } }).project({ vk: 1 }).toArray();
            admins = admins.map(a => a.vk);
            res(admins);
        });
    },
    getRepAdmins() {
        return new Promise(async res => {
            let admins = await db.collection("users").find({ "status.type": { $gte: 100 }, "admin_events.canRep": true }).project({ vk: 1 }).toArray();
            admins = admins.map(a => a.vk);
            res(admins);
        });
    }
}

module.exports = api;

setInterval(async () => {
    for (let i in bans) {
        if (bans[i].time > 0) {
            bans[i].time--;
        } else if (bans[i].time != -1) {
            let ban = JSON.parse(JSON.stringify(bans[i]));
            delete bans[i];
            vkGroup.api.messages.send({
                user_ids: await api.getAdmins(),
                message: `⏳ Игрок *id${i} был разблокирован. Причина бана: ${ban.reason}\n#pbban`,
                random_id: getRandomId()
            });
        }
    }
}, 1000);

setInterval(() => {
    fs.writeFile(__dirname + "/../vars/bans.json", JSON.stringify(bans), () => { });
}, 10000);