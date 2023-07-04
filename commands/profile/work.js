const { numberWithCommas, timeFormat, numberToSmile, getRandomInt } = require("../../api/utils");

const works = {
    dvornik: {
        lvl: 1,
        name: "🧹 Дворник",
        range: [5000, 10000]
    },
    courier: {
        lvl: 2,
        name: "📦 Курьер",
        range: [10000, 100000]
    },
    gruzchik: {
        lvl: 3,
        name: "👷‍♂️ Грузчик",
        range: [100000, 1000000]
    },
    taxi: {
        lvl: 4,
        name: "🚕 Таксист",
        range: [1000000, 10000000]
    },
    miner: {
        lvl: 4,
        name: "⛏ Шахтер",
        range: [1000000, 10000000]
    },
    manager: {
        lvl: 5,
        name: "👨‍💼 Менеджер",
        range: [10000000, 100000000]
    }
};

let maxLvl = 1;
for (let i in works) {
    if (works[i].lvl > maxLvl) maxLvl = works[i].lvl
}

function workLvl(lvl, exp) {
    if (maxLvl == lvl) return false;
    let needToUp = lvl * 10;
    if (needToUp <= exp) {
        return { lvlup: true, needToUp: (lvl + 1) * 10 }
    } else {
        return { lvlup: false, needToUp: needToUp }
    }
}

const WORK_CD = 3;

module.exports = [
    {
        r: /^(?:работа(?:ть)?|work)$/i,
        payload: "job",
        f(msg, user) {
            if (!user.work) return msg.send(`🚫 Вы нигде не работаете\n📃 Список работ можно посмотреть командой: Работы`);

            let cd = 3;

            if (user.newYear && user.newYear.activeCoupons["work"]) {
                if (user.newYear.activeCoupons["work"] + 3600000) {
                    cd = 1.5;
                } else {
                    delete user.newYear.activeCoupons["work"];
                }
            }

            let timeDelta = (user.work.last + (cd * 60 * 1000)) - (+new Date());

            if (timeDelta > 0) return msg.send(`🚫 Подождите ${timeFormat(Math.round(timeDelta / 1000))}`);

            let work = works[user.work.id];
            let payed = getRandomInt(work.range[0], work.range[1]);
            let lvlWork = workLvl(user.work.lvl, user.work.exp);
            let postFix = ``;

            if (lvlWork) {
                if (lvlWork.lvlup) {
                    user.work.lvl++;
                    user.work.exp = 0;
                    postFix = `🆙 LVL UP! Ваш уровень: ${numberToSmile(user.work.lvl)}\n`;
                } else {
                    user.work.exp++;
                }
            }

            user.money += payed;
            user.work.last = +new Date();
            msg.send(
                `${msg.prefix}за работу вам выплачено: ${numberWithCommas(payed)}$\n` +
                `▶ Работа: ${work.name}\n` +
                postFix +
                `💰 Баланс: ${numberWithCommas(user.money)}$`
            );
        }
    },
    {
        r: /^(?:работы)$/i,
        f(msg, user) {
            let lvl = user.work ? user.work.lvl : 1;
            msg.send(
                `${msg.prefix}список доступных вам работ:\n` +
                Object.keys(works).filter(w => lvl >= works[w].lvl).map((w, i) =>
                    `${numberToSmile(i + 1)} ${works[w].name} | Требуемый уровень: ${numberToSmile(works[w].lvl)}`
                ).join("\n") + "\n\n" +
                `▶ Ваш уровень: ${numberToSmile(lvl)}\n` +
                (maxLvl != lvl ? `🆙 Чем выше уровень, тем больше видов работ вам открываются\n` : '') +
                `❔ Чтобы устроиться на работу, введите команду: Работа [номер]`
            );
        }
    },
    {
        r: /^работа ([1-9]+)$/i,
        f(msg, user) {
            let workId = parseInt(msg.match[1]) - 1;
            let userLvl = user.work ? user.work.lvl : 1;
            let canWork = Object.keys(works).filter(w => userLvl >= works[w].lvl);

            if (!canWork[workId]) return msg.send("🚫 Данная работа вам недоступна\n📃 Список работ можно посмотреть командой: Работы");

            workId = canWork[workId];

            if (user.work && user.work.id == workId) return msg.send(`🚫 Вы уже выбрали данную работу`);

            if (!user.work) {
                user.work = {
                    id: workId,
                    lvl: 1,
                    exp: 0
                }
            } else {
                user.work.id = workId;
            }

            msg.send(`✅ Вы устроились на работу ${works[workId].name}`);
        }
    }
];