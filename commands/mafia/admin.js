let { chats, db } = require("../../main")

module.exports = [{
    r: /^mstop+$/i,
    status: 100,
    async f(msg) {
        if (msg.isChat) {
            if (chats[msg.chatId].mafia) {
                db.collection("mafia").deleteMany({ id: msg.chatId });
                delete chats[msg.chatId].mafia;
                msg.send(`✅ Мафия остановлена`);
            }
        }
    }
},
{
    r: /^mskip+$/i,
    status: 100,
    async f(msg) {
        if (msg.isChat) {
            if (chats[msg.chatId].mafia) {
                db.collection("mafia").updateOne({ id: msg.chatId }, { $set: { time: 0 } });
                msg.send(`✅ Таймер сброшен до нуля`);
            }
        }
    }
}]