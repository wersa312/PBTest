const { saveClansToDb, clanFromDb } = require("../../api/clan");
const { numberToSmile, numberWithCommas } = require("../../api/utils");
const { db, clans, vkGroup } = require("../../main");

module.exports = [];

const prizes = [
    { money: 10000000000000, points: 5 },
    { money: 5000000000000, points: 4 },
    { money: 2500000000000, points: 3 },
    { money: 1500000000000, points: 2 },
    { money: 1000000000000, points: 1 }
];

setInterval(async () => {
    if (new Date().getDay() == 0 && new Date().getHours() == 21 && new Date().getMinutes() == 0 && new Date().getSeconds() == 0) {
        await saveClansToDb();
        let top = await db.collection("clans").find({}).sort({ rating: -1 }).limit(5).project({ id: 1, name: 1, rating: 1 });
        await db.collection("clans").updateMany({}, { $set: { rating: 0 } });
        for (let i in clans) {
            clans[i].rating = 0;
        }
        await clanFromDb(top.map(clan => clan.id));
        for (let i = 0; i < top.length; i++) {
            let id = top[i].id;
            clans[id].bank += prizes[i].money;
            clans[id].points += prizes[i].points;
        }

        vkGroup.api.wall.post({
            owner_id: -151782797,
            from_group: 1,
            attachments: "photo-151782797_457817679",
            message:
                `📆 Итоги недели:\n` +
                top.map((clan, i) =>
                    `${numberToSmile(i + 1)}. ${clan.name}\n` +
                    `⠀⠀🔥 Рейтинг: ${clan.rating}\n` +
                    `⠀⠀💸 Приз: ${numberWithCommas(prizes[i].money)}$ и ${prizes[i].points} 💡`
                ).join("\n\n")
        })
    }
}, 1000);