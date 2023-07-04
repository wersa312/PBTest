const request = require("request"),
    { vkId, vkFromDb } = require("../../api/acc"),
    { users, Keyboard } = require("../../main"),
    { dateFormat } = require("../../api/utils"),
    { parseStringPromise } = require('xml2js');

module.exports = {
    r: /^дата( (.*))?$/i,
    payload: "date",
    scene: "date",
    
    /**
     * 
     * @param {import("vk-io").MessageContext} msg 
     * @param {*} user 
     */

    async f(msg, user) {
        let fid, id, postfix = "", params = {};

        if (msg.hasReplyMessage) {
            fid = msg.replyMessage.senderId;
        } else if (msg.hasForwards) {
            fid = msg.forwards[0].senderId;
        }

        if (!fid) {
            if (msg.type == "cmd") fid = msg.match[2] ? msg.match[2] : msg.senderId;
            if (msg.type == "payload") {
                user.scene = "date";
                fid = msg.senderId;
                postfix = "\n\n✏ Вы можете следующим сообщением отправить ссылку на человека и получить его дату регистрации";
                params = {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: "◀ Назад",
                            payload: {
                                command: "menu",
                                params: "ent"
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ])
                }
            }
            if (msg.type == "scene") fid = msg.text ? msg.text : msg.senderId;
        }

        id = await vkId(fid);
        if (id == -1) return msg.send("📅 Вы не указали человека\n✏ " + (msg.type == "scene" ? "Введите следующим сообщением ссылку" : "Дата [ссылка]"));
        await vkFromDb(id);

        request("https://vk.com/foaf.php?id=" + id, async function (e, b) {
            try {
                let data = await parseStringPromise(b.body),
                    infouser = data["rdf:RDF"]["foaf:Person"][0],
                    created = infouser["ya:created"][0].$["dc:date"],
                    lastSeen = infouser["ya:lastLoggedIn"][0].$["dc:date"];

                if (!created) return msg.send("🚫 Пользователь удален");

                msg.send(`💻 Дата регистрации: ${dateFormat(new Date(created))} ${lastSeen ? `\n📱 Последний раз заходил в ВК: ${dateFormat(new Date(lastSeen))}` : ""} ${users[id] ? "\n🤖 Дата регистрации в боте: " + dateFormat(new Date(users[id].reg_date)) : ""}` + postfix, params);
            } catch (err) {
                msg.send('вк говноеды');
                console.log(err);
            }
        });
    }
}