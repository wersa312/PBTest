const { chunks, numberToSmile, clubLink, timeFormat, numberWithCommas } = require("../../api/utils"),
    { orgFromDb } = require("./api/db"),
    { Keyboard, users } = require("../../main"),
    { orgs } = require("./api/org"),
    { vkFromDb } = require("../../api/acc");

let vacancy = [];

module.exports = [{
    payload: "vacancy",
    r: /^(?:орг(?:анизаци(?:и|я)?)? )?(?:ваканси(?:и|я))$/i,
    
    async f(msg, user) {
        vacancy.sort(async (a, b) => {
            b.rating - a.rating
        });
        let _vacancy = chunks(vacancy, 1),
            str = parseInt(msg.type == "cmd" ? 0 : (msg.params ? msg.params : 0)),
            postfix = "",
            params = {};

        if (_vacancy[1]) {
            postfix = '\n\n❔ Используйте кнопки снизу, чтобы пролистывать список участников'
            if (str == 0) {
                params = {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: '▶',
                            payload: {
                                command: 'vacancy',
                                params: 1
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]).inline()
                };
            } else if (str != _vacancy.length - 1) {
                params = {
                    keyboard: Keyboard.keyboard([[
                        Keyboard.textButton({
                            label: '◀',
                            payload: {
                                command: 'vacancy',
                                params: str - 1
                            },
                            color: Keyboard.PRIMARY_COLOR
                        }),
                        Keyboard.textButton({
                            label: '▶',
                            payload: {
                                command: 'vacancy',
                                params: str + 1
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
                                command: 'vacancy',
                                params: str - 1
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]).inline()
                };
            }
        }

        if (_vacancy[str] == null) return msg.send(`${msg.prefix}сейчас нет вакансии`);

        msg.send((await Promise.all(_vacancy[str].map(async (v, i) => {
            let org = await orgFromDb(v.id);
            await vkFromDb(org.owner);
            return `${numberToSmile(i + 1)} ${orgs[org.type].emoji} ${orgs[org.type].name} <<@id${org.owner} (${org.name})>>\nℹ Уровень организации: ${org.lvl}/10\n💵 Процент рабочих: ${org.workerpercent}%\n👔 Владелец: @id${org.owner} (${users[org.owner].nick})\n🏆 Рейтинг: ${numberWithCommas(v.money)}`
        }))).join("\n\n"), params);
    }
},
{
    r: /^(?:орг(?:анизация)?) рейтинг(?: (.*))?/i,
    
    async f(msg, user) {
        if (!msg.match[1]) return msg.send(`ℹ По рейтингу сортируется место организации в вакансиях. Чем больше рейтинг, тем выше отображается организация.\n▶ 1 рейтинг - 10.000$\n⏳ Купленный рейтинг действует 12 часов. Его нельзя обновить или прибавить после покупки, пока время действия уже имеющего не истечёт.\n\n✏ Команда "${clubLink("Орг рейтинг (кол-во)")}"`);
        if (!user.org) return msg.send(`🚫 Вы не состоите в какой либо организации`);

        let org = await orgFromDb(user.org),
            member = org.members[msg.senderId],
            haveRate = false,
            timeTo,
            date = +new Date();

        if (member.rank == 0) return msg.send(`🚫 Вы не являетесь CEO или заместителем организации`);

        for (let i in vacancy) {
            if (vacancy[i].id == user.org) {
                if (vacancy[i].time < date) {
                    vacancy.splice(i, 1);
                } else {
                    haveRate = true;
                    timeTo = vacancy[i].time - date;
                }
            }
        }

        if (haveRate) return msg.send(`🚫 У организации уже действует рейтинг.\n⏳ Время действия: ${timeFormat(Math.floor(timeTo / 1000))}`);

        let money = parseInt(msg.match[1].replace(/все|всё/, org.money).replace(/(k|к)/gi, "000"));

        if (isNaN(money)) return msg.send("🚫 Вы не указали правильно сумму\n✏ Орг рейтинг [сумма]");
        if (money < 1) return msg.send("🚫 Укажите правильную сумму\n✏ Орг рейтинг [сумма]");
        if (money * 10000 > org.money) return msg.send("🚫 В организации нет столько денег\n💰 Баланс организации: " + numberWithCommas(org.money) + "$");

        vacancy.push({ id: user.org, money: money, time: (+new Date() + 4.32e+7) });
        org.money -= money * 1000;

        msg.send(`${msg.prefix}вы приобрели ${numberWithCommas(money)} рейтинга для организации\n💰 Баланс организации: ${numberWithCommas(org.money)}$`);
    }
}]