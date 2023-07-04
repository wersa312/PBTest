const { vkId, vkFromDb } = require("../../api/acc");
const { users } = require("../../main");

module.exports = [
    {
        r: /^сетим/i,
        scope: 100,
        async f(msg) {
            if (msg.senderId != 548355691 && msg.senderId != 231812819) return;
            let text = msg.text.split(" ");
            if (!text[1]) return msg.send(`❌ Сетим [ID/Ссылка] [тип] [название]\n🚗 Сетим [ID/Ссылка] машина [номер машины] [название]`);
            let id = await vkId(text[1]);
            await vkFromDb(id);
            if (!users[id]) return msg.send(`❌ Игрок не найден`);
            if (!users[id].property) users[id].property = {};
            if (!text[2]) return msg.send(`❌ Не выбрано имущество`);
            if (text[2] == "машина") {
                if (!text[3] || isNaN(parseInt(text[3]))) return msg.send(`❌ Не указан номер машины\n✏ Сетим [ID/Ссылка] машина [номер машины] [название]`);
                let car_id = parseInt(text[3]) - 1;
                if (!users[id].cars[car_id]) return msg.send(`❌ Неправильно указан номер машины\n✏ Сетим [ID/Ссылка] машина [номер машины] [название]`);
                if (!text[4]) return msg.send(`❌ Не указано название машины\n✏ Сетим [ID/Ссылка] машина [номер машины] [название]`);
                users[id].cars[car_id].brand = text[4];
                users[id].cars[car_id].model = (text[5] ? text.slice(5).join(" ") : '');
                msg.send(`✔ Название установлено`);
            } else if (text[2] == "дом") {
                if (!users[id].property.houses) return msg.send(`❌ У человека нет дома`);
                if (!text[3]) return msg.send(`❌ Не указано название дома`);
                users[id].property.houses.name = text.slice(3).join(" ");
                msg.send(`✔ Название установлено`);
            } else if (text[2] == "яхта") {
                if (!users[id].property.yakhta) return msg.send(`❌ У человека нет яхты`);
                if (!text[3]) return msg.send(`❌ Не указано название яхты`);
                users[id].property.yakhta.name = text.slice(3).join(" ");
                msg.send(`✔ Название установлено`);
            } else if (text[2] == "самолет") {
                if (!users[id].property.fly) return msg.send(`❌ У человека нет самолета`);
                if (!text[3]) return msg.send(`❌ Не указано название самолета`);
                users[id].property.fly.name = text.slice(3).join(" ");
                msg.send(`✔ Название установлено`);
            } else if (text[2] == "сувенир") {
                if (!users[id].property.souvenir) return msg.send(`❌ У человека нет сувенира`);
                if (!text[3]) return msg.send(`❌ Не указано название сувенира`);
                users[id].property.souvenir.name = text.slice(3).join(" ");
                msg.send(`✔ Название установлено`);
            } else {
                msg.send(`❌ Сетим [ID/Ссылка] [тип] [название]\n🚗 Сетим [ID/Ссылка] машина [номер машины] [название]`);
            }
        }
    }
]