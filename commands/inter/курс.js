const request = require("request"),
    { course } = require("../../api/pockecoins"),
    { fuel } = require("../../api/fuel"),
    { numberWithCommas } = require("../../api/utils"),
    { Keyboard } = require("../../main");

let courseObj = {};

function updateCourse() {
    request.get("https://www.cbr-xml-daily.ru/daily_json.js", function (e, r, b) {
        try {
            let buffcour = JSON.parse(b).Valute;
            courseObj.KZT = buffcour.KZT.Value / buffcour.KZT.Nominal;
            courseObj.USD = buffcour.USD.Value;
            courseObj.EUR = buffcour.EUR.Value;
            courseObj.BYN = buffcour.BYN.Value;
            courseObj.UAH = buffcour.UAH.Value / buffcour.UAH.Nominal;
        } catch (err) {

        }
    });
};

updateCourse();

setInterval(updateCourse, 10000);

const courseApi = {
    rub: function (n, cs) {
        n = parseFloat(n);
        if (cs == "rub") return n;
        if (cs == "bel") return (n / courseObj.BYN).toFixed(2);
        if (cs == "kzt") return (n / courseObj.KZT).toFixed(2);
        if (cs == "usd") return (n / courseObj.USD).toFixed(2);
        if (cs == "eur") return (n / courseObj.EUR).toFixed(2);
        if (cs == "uah") return (n / courseObj.UAH).toFixed(2);
    },
    kzt: function (n, cs) {
        let kzt = (n * courseObj.KZT);
        return this.rub(kzt, cs);
    },
    usd: function (n, cs) {
        let kzt = (n * courseObj.USD);
        return this.rub(kzt, cs);
    },
    eur: function (n, cs) {
        let kzt = (n * courseObj.EUR);
        return this.rub(kzt, cs);
    },
    bel: function (n, cs) {
        let kzt = (n * courseObj.BYN);
        return this.rub(kzt, cs);
    },
    uah: function (n, cs) {
        let kzt = (n * courseObj.UAH);
        return this.rub(kzt, cs);
    }
};

const wallet = {
    //рубль
    "рубль": "rub",
    "рубля": "rub",
    "рублях": "rub",
    "рублей": "rub",
    "рубли": "rub",

    //белорусский
    "белорусский рубль": "bel",
    "белорусские рубли": "bel",
    "белорусских рублей": "bel",
    "белорусских рублях": "bel",
    "белорусских рубля": "bel",

    //доллар
    "доллар": "usd",
    "доллара": "usd",
    "доллары": "usd",
    "долларов": "usd",
    "долларах": "usd",

    //гривни
    "гривен": "uah",
    "гривня": "uah",
    "гривни": "uah",
    "гривней": "uah",
    "гривень": "uah",
    "гривнях": "uah",
    "гривны": "uah",

    "тенге": "kzt",
    "евро": "eur",

    //simple
    "rub": "рубль",
    "bel": "белорусский рубль",
    "usd": "доллар",
    "kzt": "тенге",
    "eur": "евро",
    "uah": "гривна"
};

module.exports = [{
    r: /^курс+$/i,

    payload: "курс",
    async f(msg, user) {
        if (user.menu && msg.isFromUser) {
            msg.send(`Курс валют:
💵 Доллар: ${courseObj.USD.toFixed(2)} рубль
💶 Евро: ${courseObj.EUR.toFixed(2)} рубль
💸 10 гривен: ${(courseObj.UAH * 10).toFixed(2)} рубль
💴 Белорусский рубль: ${courseObj.BYN.toFixed(2)} рубль
💴 100 тенге: ${(courseObj.KZT * 100).toFixed(2)} рубль` + "\n\nКурс игровых валют:\n💳 Курс pockecoins: " + numberWithCommas(course.course) + "$\n⛽ Литр топлива: " + fuel.fuel + "$\n🏅 Pockegold: 500,000,000" + `$
            
💱 Вы можете сконвертировать сумму, написав "[Сумма] [валюта] в [валюту]"
💱 Пример: 100 рублей в тенге
            `,
                {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: "🔄 Обновить",
                            payload: {
                                command: "курс"
                            },
                            color: Keyboard.POSITIVE_COLOR
                        }),
                        Keyboard.textButton({
                            label: "◀ В меню",
                            payload: {
                                command: "menu",
                                params: "main_menu"
                            },
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ])
                });
            user.scene = "course";
        } else {
            msg.send(`Курс валют:
💵 Доллар: ${courseObj.USD.toFixed(2)} рубль
💶 Евро: ${courseObj.EUR.toFixed(2)} рубль
💸 10 гривен: ${(courseObj.UAH * 10).toFixed(2)} рубль
💴 Белорусский рубль: ${courseObj.BYN.toFixed(2)} рубль
💴 100 тенге: ${(courseObj.KZT * 100).toFixed(2)} рубль` + "\n\nКурс игровых валют:\n💳 Курс pockecoins: " + course.course + "$\n⛽ Литр топлива: " + fuel.fuel + "$\n🏅 Pockegold: 500,000,000" + `$
        
💱 Конвертировать валюту можно введя команду: "Курс [Сумма] [валюта] в [валюту]"
💱 Пример: Курс 100 рублей в тенге`);
        }
    }
},
{
    r: /^курс ([0-9]+) (.*) в (.*)/i,
    scene: "course",

    async f(msg, user) {
        let money;
        if (msg.type == "scene") {
            msg.match = msg.text.match(/([0-9]+) (.*) в (.*)/i);
            if (!msg.match) return msg.send("🚫 Ошибка, вы ввели команду не правильно\n✏ [Сумма] [валюта] в [валюте]\n💱 Пример: 100 рублей в тенге");
            money = parseFloat(msg.match[1]);
            if (wallet[msg.match[2]] == null) return msg.send("🚫 Ошибка. Вы не указали валидную валюту\n✏ [Сумма] [валюта] в [валюту]\n💱 Пример: 100 рублей в тенге");
            if (wallet[msg.match[3]] == null) return msg.send("🚫 Ошибка. Вы не указали валидную валюту\n✏ [Сумма] [валюта] в [валюту]\n💱 Пример: 100 рублей в тенге");
        } else {
            money = parseFloat(msg.match[1]);
            if (wallet[msg.match[2]] == null) return msg.send("🚫 Ошибка. Вы не указали валидную валюту\n✏ Курс [Сумма] [валюта] в [валюту]\n💱 Пример: Курс 100 рублей в тенге");
            if (wallet[msg.match[3]] == null) return msg.send("🚫 Ошибка. Вы не указали валидную валюту\n✏ Курс [Сумма] [валюта] в [валюту]\n💱 Пример: Курс 100 рублей в тенге");
        }
        let finish = courseApi[wallet[msg.match[2]]](money, wallet[msg.match[3]]);
        finish = parseFloat(finish).toFixed(2);
        msg.send("💬 " + numberWithCommas(money) + " " + wallet[wallet[msg.match[2]]] + " = " + numberWithCommas(finish) + " " + wallet[wallet[msg.match[3]]]);
    }
}]