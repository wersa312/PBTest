let { users, clans, chats, vkGroup, db } = require("../../main");

module.exports = {

    r: /^dev( ([\s\S]+)?)/i,
    status: 100,
    f(msg, user) {
        if (!user?.admin_events?.canEval) return;
        try {
            let evalres = eval(msg.match[2]);
            msg.send("Результат: " + ((typeof evalres == "string") ? evalres : JSON.stringify(evalres, 1, 1)));
        } catch (err) {
            msg.send(err + "");
        }
    }
};