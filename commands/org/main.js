const { firstLetterToUpper, antiBan, chunks, numberWithCommas, numberToSmile, dateFormat } = require("../../api/utils"),
    { orgFromDb, orgCreate } = require("./api/db"),
    { Keyboard, users } = require("../../main"),
    { orgs } = require("./api/org"),
    { vkFromDb } = require("../../api/acc");

let params = [];

for (let i in orgs) {
    params.push(Keyboard.textButton({
        label: orgs[i].emoji + " " + orgs[i].name + (orgs[i].invest == 0 ? ' [Без вложения]' : ` [$${(orgs[i].invest / 1000000)} млн]`),
        payload: {
            command: "org_type",
            params: i
        },
        color: Keyboard.SECONDARY_COLOR
    }))
}

params = chunks(params, 2);

module.exports = [
    {
        r: /^(орг|организация)$/i,
        payload: "org_info",
        enabled: false,
        async f(msg, user) {
            if (!user.org) return msg.send(`${msg.prefix}у вас нет организации\n✏ Для основания организации, введите: "${firstLetterToUpper(msg.match[1])} [название]"\n⚜️ Основание обойдется вам в 1.000 pockegold`);

            let org = await orgFromDb(user.org),
                _org = orgs[org.type];

            await vkFromDb(org.owner);

            msg.send(`${_org.emoji} ${_org.name} <<@id${org.owner} (${org.name})>>
👔 Владелец: @id${org.owner} (${users[org.owner].nick})
ℹ Уровень организации: ${org.lvl}/10
💰 Банк: ${numberWithCommas(org.money)}$
💵 Процент рабочих от прибыли: ${org.workerpercent}%
👷‍♂️‍ Рабочих: ${numberToSmile(Object.keys(org.members).length)}
🚪 Вход: ${org.opened ? 'свободный ✅' : 'по приглашению ⛔'}

📅 Дата основания: ${dateFormat(new Date(org.regdate))}`);
        }
    },
    {
        payload: "org_create",
        enabled: false,
        async f(msg, user) {
            user.scene = "org_create";
            msg.send('✏ Введите следующем текстом название организации');
        }
    },
    {
        scene: "org_create",
        r: /^(?:орг|организация) (.*)$/i,
        enabled: false,
        async f(msg, user) {
            if (user.org) return;

            if (msg.isChat) return msg.send(`⚠ Перейдите в ЛС, что бы основать организацию`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.urlButton({
                        label: "ЛС ↗",
                        url: `https://vk.com/write-151782797`
                    })
                ]).inline()
            });

            if (user.gold < 1000) return msg.send(`🚫 Вам не хватает еще ${1000 - user.gold} Pockegold`);

            let text;
            if (msg.type == "scene") {
                text = antiBan(msg.text);
            } else {
                text = antiBan(msg.match[1]);
            }

            if (text.length < 2) return msg.send(`🚫 Название организации должно быть больше 2 символов`);
            if (text.length > 10) return msg.send(`🚫 Название организации должно быть меньше 11 символов`);

            let _org = await orgCreate(msg.senderId, text);

            user.org = _org.id;
            user.gold -= 1000;

            msg.send(`${msg.prefix}организация <<${text}>> была основана\n📃 Выберите тип организации`, {
                keyboard: Keyboard.keyboard(params)
            });
        }
    },
    {
        payload: "org_type",
        enabled: false,
        async f(msg, user) {
            if (!user.org) return msg.send(`🚫 Ошибка`, { keyboard: JSON.stringify({ buttons: [] }) });

            let org = await orgFromDb(user.org),
                type = orgs[msg.params];

            if (type.invest > user.money) return msg.send(`🚫 Данное направление требует вложении в размере ${numberWithCommas(type.invest)}$\n💰 Ваш баланс: ${numberWithCommas(user.money)}$`);

            org.type = msg.params;
            user.money -= type.invest;

            msg.send(`okkk`, { keyboard: JSON.stringify({ buttons: [] }) });
        }
    }
];