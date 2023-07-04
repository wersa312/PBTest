const { Keyboard } = require("vk-io");
const { vkId, vkFromDb } = require("../../api/acc");
const { app, vkApi, users } = require("../../main");
const sha256 = require("crypto-js/sha256");
const { log } = require("../../api/logs");
const { sendPush } = require("../../api/sendPush");
const { numberWithCommas } = require("../../api/utils");

const MONEY_COST = 1000000000;

module.exports = {
    r: /^донат$/i,
    payload: "donate",
    f(msg) {
        msg.send(`🔥 VIP - 100 рублей в месяц
📄 Возможности:
⠀⠀📄 Гет [ссылка/айди] - получить информацию о игроке
⠀⠀💼 Кейс 2 - кейс с особыми оружиями
⠀⠀💻 hack - V.I.P. бонус
⠀⠀🛡 pclan - выкл/вкл отображение клана в нике
⠀⠀🛡 Клан приглашения [вкл/выкл]
⠀⠀💭 Им [текст] - возможность установить именной айди	
⠀⠀💭 Лимит 25 символов в нике
⠀⠀🚗 Парковка на 3 машины
⠀⠀🔫 x2 рейтинг в перестрелках
⠀⠀🔫 Перезарядка 5сек
⠀⠀🔫 Возрождение 30сек
⠀⠀🔫 Капча в перестрелках раз в 15 сообщении
⠀⠀💰 6 переводов денег раз в 6 часов
                
🔥 Premium - 200 рублей в месяц
📄 Возможности:
⠀⠀📄 Все команды VIP
⠀⠀📄 Деньги [кол-во] - изменить себе фейк баланс
⠀⠀📄 Логи [ссылка/айди] - посмотреть чужие логи
⠀⠀🚗 Парковка на 10 машин
⠀⠀🔫 x3 рейтинг в перестрелках
⠀⠀💭 Лимит 35 символов в нике
⠀⠀🔫 Нет перезарядки
⠀⠀🔫 Возрождение 15сек
⠀⠀🔫 Нет капчи в перестрелках
⠀⠀💰 10 переводов денег раз в 6 часов
            
💰 Деньги - 1руб = ${numberWithCommas(MONEY_COST)}$

💵 Донат можно приобрести на сайте pocketbot.ru`, {
            dont_parse_links: 1,
            keyboard: Keyboard.keyboard([
                Keyboard.urlButton({
                    url: "https://pocketbot.ru",
                    label: "↗ На сайт"
                })
            ]).inline()
        });
    }
}

app.get("/donate_unit", async (req, res) => {
    if (!req.query) return res.sendStatus(400);

    let obj = req.query,
        id = await vkId(obj.link);

    if (id == -1) return res.json({ error: 1, message: `Ссылка введена неправильно` });
    await vkFromDb(id);

    if (!users[id]) return res.json({ error: 1, message: `Игрок не зарегистрирован` });
    let [us] = await vkApi.api.users.get({
        user_ids: id,
        fields: "photo_200"
    });
    let dopInfo = {
        id: id,
        nick: users[id].nick,
        api: us
    };
    if (obj.change == "money") {
        if (isNaN(parseInt(obj.rub))) obj.rub = 1;
        let account = `${id}_money`,
            desc = 'Игровая валюта в Pocket Bot'

        let secret = sha256(`${account}{up}RUB{up}${desc}{up}${parseInt(obj.rub)}{up}f3f23790f2501051b502f4bf8d12b068`);
        res.json({
            url: `https://unitpay.ru/pay/177851-1550d?sum=${parseInt(obj.rub)}&account=${account}&desc=${desc}&signature=${secret}&currency=RUB`,
            data: dopInfo,
            desc: desc
        });
    } else if (obj.change == "premium") {
        let account = `${id}_premium${obj.date_type == "0" ? '' : "_30"}`,
            desc = `Статус Premium${obj.date_type == "0" ? " навсегда" : " на 30 дней"} в Pocket Bot`,
            pricee = obj.date_type == "0" ? 200 : 100; //400 : 200

        if (users[id].status.type == 1 && !users[id].donatetime && obj.date_type == "0") {
            desc = `Доплата с V.I.P. навсегда до Premium навсегда`;
            pricee = 140;
        }

        let secret = sha256(`${account}{up}RUB{up}${desc}{up}${pricee}{up}f3f23790f2501051b502f4bf8d12b068`);
        res.json({
            url: `https://unitpay.ru/pay/177851-1550d?sum=${pricee}&account=${account}&desc=${desc}&signature=${secret}&currency=RUB`,
            data: dopInfo,
            desc: desc
        });
    } else if (obj.change == "vip") {
        let account = `${id}_vip${obj.date_type == "0" ? '' : "_30"}`,
            desc = `Статус V.I.P.${obj.date_type == "0" ? " навсегда" : " на 30 дней"} в Pocket Bot`,
            pricee = obj.date_type == "0" ? 100 : 50; //200 : 100

        let secret = sha256(`${account}{up}RUB{up}${desc}{up}${pricee}{up}f3f23790f2501051b502f4bf8d12b068`);
        res.json({
            url: `https://unitpay.ru/pay/177851-1550d?sum=${pricee}&account=${account}&desc=${desc}&signature=${secret}&currency=RUB`,
            data: dopInfo,
            desc: desc
        });
    } else if (obj.change == "mcoin") {
        let decs = 'Мафия коины в Pocket Bot'
        let secret = sha256(`${id}_mcoin{up}RUB{up}${decs}{up}50{up}f3f23790f2501051b502f4bf8d12b068`);
        res.json({
            url: `https://unitpay.ru/pay/177851-1550d?sum=50&account=${id}_mcoin&desc=${decs}&signature=${secret}&currency=RUB`,
            data: dopInfo,
            desc: decs
        });
    }
});

app.get("/result_unit", async function (req, res) {
    res.send("ok");
    let params = req.query,
        [, id, tovar] = params.tovar.match(/([0-9]+)\_(.*)/i);

    await vkFromDb(id);
    if (!users[id]) return sendPush(231812819, `Невалидный донат от *id${id}\n🛒 Товар: ${tovar}\n💸 Сумма: ${params.sum}р.\n🆔 Номер: ${params.id}\n#invalid_donate`);

    sendPush(231812819, `Донат от *id${id}\n🛒 Товар: ${tovar}\n💸 Сумма: ${params.sum}р. (${params.profit}р.)\n🆔 Номер: ${params.id}\n#donate`)

    if (tovar == "premium") {
        if (users[id].donatetime) delete users[id].donatetime;
        users[id].status.type = 2;
        log(id, "Купил Premium навсегда");
        sendPush(id, `Ваш донат обработан.\n👑 Вам выдан статус Premium навсегда. Спасибо за покупку!`, { important: 1 });
    } else if (tovar == "premium_30") {
        if (users[id].status.type == 2 && users[id].donatetime) {
            users[id].status.type = 2;
            users[id].donatetime += (30 * 24 * 60 * 60 * 1000);
            log(id, "Продлил Premium на 30дн.");
            sendPush(id, `Ваш донат обработан.\n👑 Ваш статус Premium продлен еще на 30 дней. Спасибо за покупку!`, { important: 1 });
        } else {
            users[id].status.type = 2;
            users[id].donatetime = +new Date() + (30 * 24 * 60 * 60 * 1000);
            log(id, "Купил Premium на 30дн.");
            sendPush(id, `Ваш донат обработан.\n👑 Вам выдан статус Premium на 30 дней. Спасибо за покупку!`, { important: 1 });
        }
    }

    else if (tovar == "vip") {
        if (users[id].donatetime) delete users[id].donatetime;
        users[id].status.type = 1;
        log(id, "Купил V.I.P. навсегда");
        sendPush(id, `Ваш донат обработан.\n👑 Вам выдан статус V.I.P. навсегда. Спасибо за покупку!`, { important: 1 });
    } else if (tovar == "vip_30") {
        if (users[id].status.type == 1 && users[id].donatetime) {
            users[id].status.type = 1;
            users[id].donatetime += (30 * 24 * 60 * 60 * 1000);
            log(id, "Продлил V.I.P. на 30дн.");
            sendPush(id, `Ваш донат обработан.\n👑 Ваш статус V.I.P. продлен еще на 30 дней. Спасибо за покупку!`, { important: 1 });
        } else {
            users[id].status.type = 1;
            users[id].donatetime = +new Date() + (30 * 24 * 60 * 60 * 1000);
            log(id, "Купил V.I.P. на 30дн.");
            sendPush(id, `Ваш донат обработан.\n👑 Вам выдан статус V.I.P. на 30 дней. Спасибо за покупку!`, { important: 1 });
        }
    }

    else if (tovar == "mcoin") {
        if (!users[id].mafcoin) users[id].mafcoin = 0;
        users[id].mafcoin += 1000;
        log(id, "Купил 1000 Mafia coins");
        sendPush(id, `Ваш донат обработан.\n🧛‍♂️ Вам выданы 1,000 💴 в мафии. Спасибо за покупку!`, { important: 1 });
    }

    else if (tovar == "money") {
        let toGive = params.sum * MONEY_COST;
        users[id].money += toGive;
        log(id, `Задонатил и получил ${numberWithCommas(toGive)}$`);
        sendPush(id, `Ваш донат обработан.\n💸 Вам выдано ${numberWithCommas(toGive)}$. Спасибо за покупку!`, { important: 1 });
    }
});