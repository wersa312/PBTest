const { antiBan } = require("../../api/utils"),
    { log } = require("../../api/logs");

function changeNick(msg, user, text) {
    text = antiBan(text, "").replace(/(\[|\]|\@|\(|\)|\*)/g, "");
    if (text.length > 15 && user.status.type == 0) return msg.send("🚫 Лимит 15 символов");
    if (text.length > 25 && user.status.type == 1) return msg.send("🚫 Лимит 25 символов");
    if (text.length > 35 && user.status.type > 1) return msg.send("🚫 Лимит 35 символов");
    if (!text.length) return msg.send("🚫 Укажите валидный никнейм");
    log(msg.senderId, `Сменил ник на ${text}`);
    user.nick = text;
    msg.send('✏️ Ваш новый никнейм: ' + user.nick);
}

module.exports = [
    {

        r: /^(?:ник|никнейм|nick)+( (.*))?$/i,
        f(msg, user) {
            if (!msg.match[2]) return msg.send(`📝 Ваш никнейм: ${user.nick}\n✏ Введите команду "Ник [текст]" для смены никнейма`);
            changeNick(msg, user, msg.match[2]);
        }
    },
    {

        payload: "changeNick",
        f(msg, user) {
            user.scene = "changeNick";
            msg.send('📝  Введите следующим текстом никнейм\n🚫 Для отмены, введите "Отмена"');
        }
    },
    {

        scene: "changeNick",
        f(msg, user) {
            if (msg.hasText) {
                if ((/^отмена/i).test(msg.text)) {
                    msg.send("🚫 Отменено");
                    return user.scene = null;
                }
                changeNick(msg, user, msg.text);
                delete user.scene;
            }
        }
    }
];