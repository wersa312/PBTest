const { log } = require("../../api/logs");
const { chunks, numberToSmile, randElement, numberWithCommas, clubLink } = require("../../api/utils"),
    { Keyboard } = require("../../main");

module.exports = [{
    r: /^(?:guns|оружия)(?: (.*))?$/i,
    payload: "guns",

    async f(msg, user) {
        let guns = [],
            n = 1,
            warning = "",
            postfix = "\n❔ Чтобы выбрать оружие как основное, введите \"Оружие [номер]\"",
            params = {},
            list;

        for (let i in user.guns) {
            guns.push(numberToSmile(n) + " " + user.guns[i].name + " | Урон: " + user.guns[i].damage + " 💥 | " + user.guns[i].type.replace(/machine_gun/gi, "Пулемет").replace(/pistol_automatic/gi, "Самозарядный пистолет").replace(/automatic/gi, "Винтовка").replace(/pistol/gi, "Пистолет").replace(/snipe/gi, "Снайперская винтовка").replace(/shotgun/gi, "Дробовик") + " 🔫 | x" + user.guns[i].count + "");
            n++;
        }

        guns = chunks(guns, 20);

        if (msg.type == "payload") {
            list = msg.params.n;
        } else if (msg.match[1]) {
            list = parseInt(msg.match[1]) - 1;
        } else {
            list = 0;
        }

        if (!guns[list]) {
            list = 0;
            warning = "\n🚫 Страницы которую вы указали не существует";
        }

        let gun = guns[list];

        if (guns[1]) {
            postfix = `\n📄 Страница ${list + 1} из ${guns.length}${warning}\n\n❔ Используйте кнопки снизу, чтобы пролистывать список участников\n▶ Чтобы выбрать оружие как основное, введите \"Оружие [номер]\"`
            if (list == 0) {
                params = {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: '▶',
                            payload: {
                                command: 'guns',
                                params: {
                                    n: 1
                                }
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]).inline()
                };
            } else if (list != guns.length - 1) {
                params = {
                    keyboard: Keyboard.keyboard([[
                        Keyboard.textButton({
                            label: '◀',
                            payload: {
                                command: 'guns',
                                params: {
                                    n: list - 1
                                }
                            },
                            color: Keyboard.PRIMARY_COLOR
                        }),
                        Keyboard.textButton({
                            label: '▶',
                            payload: {
                                command: 'guns',
                                params: {
                                    n: list + 1
                                }
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]]).inline()
                };
            } else {
                params = {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: '◀',
                            payload: {
                                command: 'guns',
                                params: {
                                    n: list - 1
                                }
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]).inline()
                };
            }
        }

        if (gun) {
            msg.send(`${msg.prefix}ваши оружия:
${gun.join("\n")}
${postfix}`, params);
        } else {
            msg.send(`${msg.prefix}у вас нет оружии ${randElement(["😵", "🤯", "😧", "😥", "😰", ""])}`, params)
        }
    }
},
{
    r: /^(?:оружие|gun)(?: (.*))?$/i,

    async f(msg, user) {
        if (!msg.match[1] || isNaN(parseInt(msg.match[1]))) return msg.send("🚫 Вы не указали номер оружия. Узнать номер можно по команде \"Оружия\"\n✏ Оружие [номер]");

        let guns = [], id = parseInt(msg.match[1]) - 1;

        for (let i in user.guns) {
            guns.push(user.guns[i].name);
        }

        if (!guns[id]) return msg.send("🚫 Вы не указали правильный номер оружия. Узнать номер можно по команде \"Оружия\"");

        user.fgun_id = guns[id];

        msg.send(`${msg.prefix}вы указали как основное оружие: 🔫 ${guns[id]}`);
    }
},
{
    r: /^(?:skill(?:s)?|умени(?:я|и)|скилл(?:ы)?)(?: .*)?$/i,

    async f(msg, user) {
        msg.send(msg.prefix + `ваши умения стрельбы:
${getSkillEmoji(user.skill[0].pistol)} Пистолеты: ${user.skill[0].pistol}%
${getSkillEmoji(user.skill[0].snipe)} Снайперские винтовки: ${user.skill[0].snipe}%
${getSkillEmoji(user.skill[0].shotgun)} Дробовики: ${user.skill[0].shotgun}%
${getSkillEmoji(user.skill[0].automatic)} Винтовки: ${user.skill[0].automatic}%
${getSkillEmoji(user.skill[0].pistol_automatic)} ПП: ${user.skill[0].pistol_automatic}%
${getSkillEmoji(user.skill[0].machine_gun)} Пулеметы: ${user.skill[0].machine_gun}%`);
    }
},
{
    r: /^(?:pt|патроны)(?: .*)?$/i,

    async f(msg, user) {
        msg.send(`${msg.prefix}патроны для
1⃣ ${user.pistol_patrons ? "🔷" : "🔶"} Пистолета: ${numberWithCommas(user.pistol_patrons)}
2⃣ ${user.snipe_patrons ? "🔷" : "🔶"} Снайперских винтовок: ${numberWithCommas(user.snipe_patrons)}
3⃣ ${user.shotgun_patrons ? "🔷" : "🔶"} Дробовиков: ${numberWithCommas(user.shotgun_patrons)}
4⃣ ${user.automatic_patrons ? "🔷" : "🔶"} Винтовок: ${numberWithCommas(user.automatic_patrons)}
5⃣ ${user.pistol_automatic_patrons ? "🔷" : "🔶"} ПП: ${numberWithCommas(user.pistol_automatic_patrons)}
6⃣ ${user.machine_gun_patrons ? "🔷" : "🔶"} Пулеметов: ${numberWithCommas(user.machine_gun_patrons)}

🛒 Для покупки, используйте команду: Купить патроны [номер оружия] [кол-во]
💸 Патрон для каждого типа стоит 500$`);
    }
},
{
    r: /^купить патроны(?: ([^\s]+)(?: ([^\s]+)))?/i,
    f(msg, user) {
        let errMsg = `🛒 Для покупки нужно ввести: Купить патроны [номер оружия] [кол-во]
🔫 Номера оружия:
⠀⠀1⃣ Пистолет
⠀⠀2⃣ Снайперская винтовка
⠀⠀3⃣ Дробовик
⠀⠀4⃣ Винтовка
⠀⠀5⃣ ПП
⠀⠀6⃣ Пулемет

💸 Патрон для каждого типа стоит 500$`
        if (!msg.match[1]) return msg.send(errMsg);

        let guns = [{ id: "pistol", name: "пистолета" }, { id: "snipe", name: "снайперской винтовки" }, { id: "shotgun", name: "дробовика" }, { id: "automatic", name: "винтовки" }, { id: "pistol_automatic", name: "ПП" }, { id: "machine_gun", name: "пулемета" }];
        if (isNaN(Number(msg.match[1])) || !guns[Number(msg.match[1]) - 1]) return msg.send(`🚫 Номер оружия введено не верно\n${errMsg}`);
        if (isNaN(Number(msg.match[2])) || Number(msg.match[2]) < 1) return msg.send(`🚫 Количество патронов введено не верно\n${errMsg}`);

        let type = guns[Number(msg.match[1]) - 1],
            pats = Number(msg.match[2]),
            pat_money = pats * 500;

        if (pat_money > user.money) return msg.send(`🚫 Не хватает денег\n💸 ${pats} пт. стоит ${numberWithCommas(pat_money)}$\n💰 Ваш баланс: ${numberWithCommas(user.money)}$`);
        user[type.id + "_patrons"] += pats;
        user.money -= pat_money;
        log(msg.senderId, `Купил патронов на ${numberWithCommas(pat_money)}$`)

        msg.send(`${msg.prefix}вы купили ${numberWithCommas(pats)} пт. для ${type.name} за ${numberWithCommas(pat_money)}$\n💰 Ваш баланс: ${numberWithCommas(user.money)}$`);
    }
}];

function getSkillEmoji(n) {
    if (n < 25) return "🔸";
    if (n < 50) return "🔶";
    if (n < 75) return "🔹";
    return "🔷";
};