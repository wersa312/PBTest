const { vkFromDb, vkId } = require("../../api/acc");
const { numberWithCommas, dateFormat, statusToStr, timeFormat } = require("../../api/utils");
const { users, Keyboard, bans } = require("../../main");

module.exports = [
    {
        r: /^(?:get|гет)(?: (.*))?/i,
        payload: "get",
        status: 1,
        /**
         * 
         * @param {import("vk-io").MessageContext} msg 
         * @param {*} user 
         */
        async f(msg, sender) {
            let id = msg.type == "cmd" ? (msg.match[1] ? await vkId(msg.match[1]) : '-1') : msg.params;
            if (msg.replyMessage) {
                id = msg.replyMessage.senderId;
            } else if (msg.hasForwards) {
                id = msg.forwards[0].senderId;
            }

            await vkFromDb(id);
            if (!users[id]) return msg.send('🚫 Игрок не найден или зарегистрирован');
            let user = users[id],
                params = {};

            if (user.status.type == 100 && sender.status.type < 100) return msg.send('🚫 Игрок не найден или зарегистрирован');

            /*if (sender.status.type >= 100) {
                params = {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: 
                        })
                    ]).inline()
                }
            }*/

            let property = [],
                azs = user.business["азс"] ? user.business["азс"].count : null,
                magaz = user.business["магаз"] ? user.business["магаз"].count : null,
                bordel = user.business["бордель"] ? user.business["бордель"].count : null,
                zavod = user.business["завод"] ? user.business["завод"].count : null,
                fabric = user.business["фабрика"] ? user.business["фабрика"].count : null;

            if (azs != null) property.push("⠀⠀⛽ АЗС (" + azs + "x)");
            if (magaz != null) property.push("⠀⠀🛍 Магазин (" + magaz + "x)");
            if (bordel != null) property.push("⠀⠀💃 Борделей (" + bordel + "x)");
            if (zavod != null) property.push("⠀⠀🍭 Завод конфеток (" + zavod + "x)");
            if (fabric != null) property.push("⠀⠀🎁 Фабрика подарков (" + fabric + "x)");
            if (user.property != null) {
                if (user.property.yakhta != null) property.push("⠀⠀" + user.property.yakhta.name);
                if (user.property.houses != null) property.push("⠀⠀" + user.property.houses.name);
                if (user.property.fly != null) property.push("⠀⠀" + user.property.fly.name);
                if (user.property.souvenir != null) property.push("⠀⠀" + user.property.souvenir.name);
            }
            if (user.car != null && user.cars[user.car] == null) delete user.car;
            if (user.car != null) property.push("⠀⠀🚗 " + user.cars[user.car].brand + " " + user.cars[user.car].model);
            if (user.fgun_id) property.push(`⠀⠀🔫 Оружие: ${user.fgun_id}`);

            if (bans[id] && bans[id].by) await vkFromDb(bans[id].by);

            msg.send(
                `⛄ Профиль игрока @id${id} (${user.nick}):\n` +
                (bans[id] ? (sender.status.type < 100 ? `⠀⠀❌ Заблокирован` :
                    `⠀⠀❌ Заблокирован на ${timeFormat(bans[id].time)}\n` +
                    `⠀⠀❌ Причина: ${bans[id].reason}\n` +
                    (bans[id].by ? `⠀⠀❌ Админом: @id${bans[id].by} (${users[bans[id].by].nick})\n` : "")
                ) : '') +
                `⠀⠀🆔 Айди: ${user.shortnick ? `${user.shortnick} (${user.fake_id})` : user.fake_id}\n` +
                `⠀⠀🆔 VK: ${id}\n` +
                `⠀⠀💭 Статус: ${user.customstatus ? user.customstatus + (sender.status.type >= 100 ? ` (${statusToStr(user.status)})` : '') : statusToStr(user.status)}\n` +
                `⠀⠀💰 Денег: ${numberWithCommas(user.money)}$\n` +
                `⠀⠀🏧 Банк: ${numberWithCommas(user.bank.money)}$\n` +
                `⠀⠀💳 Pockecoins: ${numberWithCommas(user.coins)}\n` +
                `⠀⠀⚜️ Pockegold: ${numberWithCommas(user.gold)}\n` +
                `⠀⠀💠 VK Coin: ${user.vkcoin ? numberWithCommas(user.vkcoin) : 0}\n` +
                `⠀⠀❄ Снежинок: ${user.newYear ? numberWithCommas(user.newYear.coins) : 0}\n` +
                (user.status.type != 100 ? "" :
                    `⠀⠀🍪 Печеньки: ${numberWithCommas(user.cookie)}\n` +
                    `⠀⠀📢 Рейтинг репорта: ${user.techRate ? numberWithCommas(user.techRate) : 0}\n`
                ) + "\n" +

                (property.length == 0 ? "\n" :
                    `🏠 Имущество:\n` +
                    property.join("\n")
                ) + "\n\n" +

                `📃 Разная информация:\n` +
                `⠀⠀💸 Бан передачи: ${user.banpay ? "Да" : "Нет"}\n` +
                `⠀⠀🔝 Топ: ${user.bantop ? "Выключен" : "Включен"}\n` +
                `⠀⠀🔔 Уведомления: ${user.push ? "Включены" : "Выключены"}\n` +
                `⠀⠀⚠ Нарушении в чатах: ${user.warn ? user.warn : 0}\n` +
                `⠀⠀✉ Сообщении: ${numberWithCommas(user.stat.msg)}\n` +
                `⠀⠀📅 Дата регистрации: ${user.reg_date}\n` +
                `⠀⠀📱 Последняя активность: ${dateFormat(new Date(user.lastActivity))}`
            )
        }
    }
]