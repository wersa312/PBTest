const { db } = require("../../main");

module.exports = {
    r: /^им ([\S]+)$/i,
    status: 1,
    f(msg, user) {
        let im = msg.match[1];
        if ((/^[a-zA-Z][a-zA-Z0-9-_\.]{1,10}$/).test(im)) {
            db.collection("users").find({ shortnick: im }).limit(1).toArray(async (err, res) => {
                if (res[0] == null) {
                    user.shortnick = im;
                    msg.send("✅ Вы установили именной айди: " + im);
                    db.collection("users").updateOne({ vk: msg.senderId }, { $set: { shortnick: im } });
                } else {
                    msg.send("⛔ Данный именной айди уже занят");
                }
            });
        } else {
            msg.send(`🚫 Именной айди должен содержать только латинские буквы, а также цифры и "_", но должен начинаться только с латинской буквы.` +
                `📝 Лимит символов для именного айди от 2 до 10.`);
        }
    }
};