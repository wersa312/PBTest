const { vkId, vkFromDb } = require("../../api/acc"),
    { users, Keyboard } = require("../../main"),
    { numberWithCommas, fancyTimeFormat, antiBan } = require("../../api/utils"),
    { log } = require("../../api/logs"),
    { sendPush } = require("../../api/sendPush");

module.exports = [{

    r: /^(?:pay|передать)(?: ([^\s]+) ([^\s]+))?(?: (.*))?/i,
    scene: "pay",
    async f(msg, user) {

        if (msg.type == "scene") {
            msg.match = msg.text.match(/^([^\s]+) ([^\s]+)(?: ([^\s]+))?/i);
        }

        if (!msg.match || !msg.match[2]) return msg.send(`🚫 Передать [ID/ссылка] [сумма] [комментарий*]
* - необязательно`);
        let id = await vkId(msg.match[1]);
        await vkFromDb(id);
        if (!users[id]) return msg.send(`🚫 Игрок не найден`);

        await vkFromDb(id);

        let money = parseInt(msg.match[2].replace(/все|всё/, user.money).replace(/(k|к)/gi, "000"));

        if (user.status.type < 3 && user.limitpay == null) {
            if (user.status.type == 0 && user.limit >= 3) {
                if ((+new Date() - user.limtime) / 1000 < 21600) {
                    return msg.send(`🚫 Не больше чем 3 перевода в 6 часов
🕒 Ждать еще: ${fancyTimeFormat(Math.floor(21600 - (+new Date() - user.limtime) / 1000))}`);
                } else {
                    user.limit = 0;
                }
            } else if (user.status.type == 1 && user.limit >= 6) {
                if ((+new Date() - user.limtime) / 1000 < 21600) {
                    return msg.send(`🚫 Не больше чем 6 перевода в 6 часов
🕒 Ждать еще: ${fancyTimeFormat(Math.floor(21600 - (+new Date() - user.limtime) / 1000))}`);
                } else {
                    user.limit = 0;
                }
            } else if (user.status.type == 2 && user.limit >= 10) {
                if ((+new Date() - user.limtime) / 1000 < 21600) {
                    return msg.send(`🚫 Не больше чем 10 перевода в 6 часов
🕒 Ждать еще: ${fancyTimeFormat(Math.floor(21600 - (+new Date() - user.limtime) / 1000))}`);
                } else {
                    user.limit = 0;
                }
            }
        }

        if (user.banpay) return msg.send("🚫 Вам заблокированы передачи денег");
        if (isNaN(money)) return msg.send(`🚫 Передать [ID/ссылка] [сумма] [комментарий*]
* - необязательно`);
        if (money < 1) return msg.send(`🚫 Передать [ID/ссылка] [сумма] [комментарий*]
        * - необязательно`);
        if (money > user.money) return msg.send("🚫 У вас нет столько денег\n💰 На руках: " + numberWithCommas(user.money) + "$");
        if (money > 10000000000 && user.lockpay == null && user.status.type < 2) return msg.send(msg.prefix + "не больше 10млрд за раз");

        log(msg.senderId, `Передал ${numberWithCommas(money)}$ игроку *id${id}`);
        log(id, `Получил ${numberWithCommas(money)}$ от игрока *id${msg.senderId}`);

        user.money -= money;
        users[id].money += money;

        user.limit++;
        user.limtime = +new Date();

        msg.send(`${msg.prefix}вы передали @id${id} (${users[id].nick}) ${numberWithCommas(money)}$
💰 На руках: ${numberWithCommas(user.money)}$${msg.match[3] && money >= 1000000 ? `\n💬 Комментарий к переводу: ${antiBan(msg.match[3])}` : ""}`);

        sendPush(id, `@id${msg.senderId} (${user.nick}) перевел вам ${numberWithCommas(money)}$${msg.match[3] && money >= 1000000 ? `\n💬 Комментарий к переводу: ${antiBan(msg.match[3])}` : ""}`);
    }
},
{
    payload: "pay",

    async f(msg, user) {
        user.scene = "pay";
        msg.send(`✏ Введите следующим сообщением: "[ID/Ссылка] [сумма]"\n❔ Например: @club151782797 (125 300кк)`, {
            keyboard: Keyboard.keyboard([
                Keyboard.textButton({
                    label: '◀ Назад',
                    payload: {
                        command: 'profile'
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            ])
        })
    }
}]