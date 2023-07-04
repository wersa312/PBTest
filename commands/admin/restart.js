const { saveUsersToDb } = require("../../api/acc");
const { saveChatsToDb } = require("../../api/chat");
const { saveClansToDb } = require("../../api/clan");
const { saveLogs } = require("../../api/logs");
const { goSave } = require("../../api/pockecoins");

function wait(delay) {
    return new Promise(function (resolve) {
        setTimeout(resolve, delay);
    });
}

module.exports = {
    r: /^restart/i,
    status: 100,
    async f(msg, user) {
        if (!user?.admin_events?.canEval) return;

        msg.send(`⛏ Перезагрузка`);
        saveUsersToDb(1);
        saveChatsToDb(1);
        saveClansToDb(1);
        saveLogs();
        goSave();

        await wait(5000);
        require('child_process').execSync('pm2 restart 0');
    }
}