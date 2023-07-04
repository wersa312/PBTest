const { vkGroup, db, chats } = require("../../../main"),
    { chatFromDb } = require("../../../api/chat"),
    mafia_default = require("../mafia_default.json");
const cancel = require("./api/cancel");

setInterval(() => {
    db.collection("mafia").find({ lifetime: { $lt: +new Date() } }).toArray((err, res) => {
        res.forEach(async (m) => {
            await chatFromDb(m.id);
            cancel(m.id, "⛔ Игра отменена, так как нет активности");
        });
    });
}, 1000);