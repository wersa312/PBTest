const { vkFromDb } = require("../../api/acc");
const { getRepAdmins, getAdmins } = require("../../api/admin_utils");
const { numberToSmile, numberWithCommas } = require("../../api/utils");
const { users } = require("../../main");

module.exports = [
    {
        r: /^topadm$/i,
        status: 100,
        async f(msg) {
            let reports = await getRepAdmins();
            let admins = await getAdmins();
            await vkFromDb(admins);

            msg.send(
                `📢 Топ по рейтингу репортов:\n` +
                reports.sort((a, b) => users[b].techRate - users[a].techRate).map((id, i) => `⠀${numberToSmile(i + 1)} @id${id} (${users[id].nick}) - ${users[id].techRate ? numberWithCommas(users[id].techRate) : '0'}`).join("\n") + "\n\n" +

                `🍪 Топ печенек:\n` +
                admins.sort((a, b) => users[b].cookie - users[a].cookie).map((id, i) => `⠀${numberToSmile(i + 1)} @id${id} (${users[id].nick}) - ${users[id].cookie ? numberWithCommas(users[id].cookie) : '0'}`).join("\n")
            );
        }
    }
]