const { vkId, vkFromDb } = require("../../api/acc");
const { log } = require("../../api/logs");
const { numberWithCommas } = require("../../api/utils");
const { users } = require("../../main");

module.exports = [
    {
        r: /^givemoney ([\S]+) ([\S]+)/i,
        status: 100,
        async f(msg, user) {
            if (user.admin_events?.canEdit) {
                let id = await vkId(msg.match[1]);
                await vkFromDb(id);

                if (!users[id]) return msg.send(`❌ Не найден`);

                let money = parseInt(msg.match[2].replace(/\,/g, "").replace(/k|к/gi, "000"));
                if (isNaN(money)) return msg.send(`❌ Введи валидное число`);

                log(msg.senderId, `Выдал денег игроку @id${id} (${users[id].nick}) ${numberWithCommas(money)}$ | Было: ${numberWithCommas(users[id].money)}$ | Баланс: ${numberWithCommas(users[id].money + money)}$`);
                log(id, `Выданы деньги ${numberWithCommas(money)}$ админом @id${msg.senderId} (${users[msg.senderId].nick})`);
                msg.send(
                    `💸 Выдано @id${id} (${users[id].nick}) ${numberWithCommas(money)}$\n` +
                    `◀ Было: ${numberWithCommas(users[id].money)}$\n` +
                    `💰 Баланс: ${numberWithCommas(users[id].money + money)}$`
                );
                users[id].money += money;
            }
        }
    },
    {
        r: /^setmoney ([\S]+) ([\S]+)/i,
        status: 100,
        async f(msg, user) {
            if (user.admin_events?.canEdit) {
                let id = await vkId(msg.match[1]);
                await vkFromDb(id);

                if (!users[id]) return msg.send(`❌ Не найден`);

                let money = parseInt(msg.match[2].replace(/\,/g, "").replace(/k|к/gi, "000"));
                if (isNaN(money)) return msg.send(`❌ Введи валидное число`);

                log(msg.senderId, `Установил баланс игроку @id${id} (${users[id].nick}) ${numberWithCommas(money)}$ | Баланс: ${numberWithCommas(money)}$`);
                log(id, `Установлен баланс ${numberWithCommas(money)}$ админом @id${msg.senderId} (${users[msg.senderId].nick})`);
                msg.send(
                    `💸 Игроку @id${id} (${users[id].nick}) установлен баланс ${numberWithCommas(money)}$`
                );
                users[id].money = money;
            }
        }
    },
    {
        r: /^givegold ([\S]+) ([\S]+)/i,
        status: 100,
        async f(msg, user) {
            if (user.admin_events?.canEdit) {
                let id = await vkId(msg.match[1]);
                await vkFromDb(id);

                if (!users[id]) return msg.send(`❌ Не найден`);

                let money = parseInt(msg.match[2].replace(/\,/g, "").replace(/k|к/gi, "000"));
                if (isNaN(money)) return msg.send(`❌ Введи валидное число`);
                if (!user.gold) user.gold = 0;

                log(msg.senderId, `Выдал игроку @id${id} (${users[id].nick}) ${numberWithCommas(money)} золота | Было: ${numberWithCommas(users[id].gold)}$ | Баланс: ${numberWithCommas(users[id].gold + money)}$`);
                log(id, `Выдано ${numberWithCommas(money)} золота админом @id${msg.senderId} (${users[msg.senderId].nick})`);
                msg.send(
                    `💸 Выдано @id${id} (${users[id].nick}) ${numberWithCommas(money)} золота\n` +
                    `◀ Было: ${numberWithCommas(users[id].gold)}\n` +
                    `💰 Баланс: ${numberWithCommas(users[id].gold + money)}`
                );
                users[id].gold += money;
            }
        }
    }
]