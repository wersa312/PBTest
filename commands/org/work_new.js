const { orgs } = require("./api/org"),
    { orgFromDb } = require("./api/db"),
    { getRandomInt, randElement, timeFormat } = require("../../api/utils"),
    { workParse, workLvl } = require("./api/utils");

let workTime = {};

module.exports = [
    {
        r: /^(?:work|работа(?:ть))$/i,
        payload: "job",
        enabled: false,
        async f(msg, user) {
            if (!user.org) return msg.send(`🚫 Вы не состоите в какой либо организации\n📕 Введите команду @club151782797 ("Вакансии"), что бы посмотреть список организации`);

            if (workTime[msg.senderId] && workTime[msg.senderId] > +new Date()) return msg.send(`🚫 Нужно отдохнуть от работы\n⏳ Подождите: ${timeFormat(Math.round((workTime[msg.senderId] - +new Date()) / 1000))}`);

            let org = await orgFromDb(user.org),
                member = org.members[msg.senderId],
                type = org.type;

            if (orgs[type].workers[member.lvl]) {
                let work = orgs[type].workers[member.lvl];
                if (work.work.type == "pay_int") {
                    let pay_for_int = Math.round(getRandomInt(work.work.pay[0], work.work.pay[1]) * (org.lvl / 3)).toFixed(0),
                        paysInt = getRandomInt(work.work.int_range[0], work.work.int_range[1]),
                        _pay = pay_for_int * paysInt;

                    let pay = Math.round(org.pay(_pay)),
                        _string = randElement(work.work.string);

                    member.exp++;

                    let upped = workLvl(type, member.lvl, member.exp), postfix = "";

                    if (upped) {
                        if (upped.lvlup) {
                            member.lvl++;
                            member.exp = 0;
                            postfix = `\n🆙 Вы повышены до "${orgs[type].workers[member.lvl].name}"\n⭐ Опыт: ${member.exp}/${upped.needToUp}`;
                        } else {
                            postfix = `\n⭐ Опыт: ${member.exp}/${upped.needToUp}`;
                        }
                    } else {
                        postfix = `\n⭐ Максимальный уровень в организации`;
                    }

                    user.money += pay;

                    if (org.boost["fasterWork"]) {
                        workTime[msg.senderId] = +new Date() + 90000;
                    } else {
                        workTime[msg.senderId] = +new Date() + 180000;
                    }

                    msg.send(`${msg.prefix}${workParse(_string, "pay_int", { int: paysInt, payed: pay })}\n👔 Профессия: ${work.name}${postfix}`);
                }
            }
        }
    }
];