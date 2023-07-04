const { db, chats } = require("../../../main");
const { chatFromDb } = require("../../../api/chat");
const fs = require("fs");

let phases = {};

fs.readdirSync(__dirname + "/phases").forEach(function (file) {
    if (file.endsWith(".js")) {
        phases[(file.replace(".js", ""))] = require("./phases/" + file);
    }
});

setInterval(() => {
    db.collection("mafia").find({ time: { $lt: +new Date() } }).toArray((err, res) => {
        res.forEach(async (m) => {
            await chatFromDb(m.id);
            let mafia = chats[m.id].mafia;
            if (!mafia) {
                db.collection("mafia").deleteOne({ id: m.id });
            } else {
                phases[mafia.phase](mafia, m);
            }
        });
    });
}, 1000);