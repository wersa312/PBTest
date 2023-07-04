const moment = require("moment");
const { getRandomId } = require("vk-io");
const { users, vkGroup, Keyboard } = require("../../main"),
    { fancyTimeFormat, dateFormat, numberWithCommas } = require("../../api/utils"),
    { vkId, vkFromDb } = require("../../api/acc");

let slowmarry = {};

const marryApi = {
    lvl(exp) {
        if (exp < 20) {
            return "молодожены";
        } else if (exp < 50) {
            return "Женаты";
        }
    },
    default: {
        id: 0,
        gay: false,
        sex: false,
        kids: {},
        marriedDate: +new Date(),
        exp: 0,
        bank: 0,
        boost: {}
    },
    checkLegit(marry) {
        for (let i in this.default) {
            if (!marry.hasOwnProperty(i)) {
                if (i == "marriedDate") {
                    marry[i] = +new Date();
                } else {
                    marry[i] = this.default[i];
                }
            }
        }
        return marry;
    }
};

module.exports = [{
    r: /^(?:свадьба)( (.*))?$/i,
    payload: "marry",

    async f(msg, user) {
        if (msg.type == "payload") msg.match = [0, 1, msg.params.id];
        if (user.married) {
            vkGroup.api.messages.send({
                message: "💔 Ваш" + (user.married.sex == 1 ? " муж попытался" : "а жена попыталась") + " вам изменить",
                user_ids: user.married.id,
                random_id: getRandomId()
            });
            msg.send("🚫 Вы в браке\n✏ Чтобы развестись, введите: \"Брак развод\"");
        } else {
            if (!msg.match[2]) return msg.send("🚫 Вы не указали человека\n✏ Свадьба [ID/ссылка]");

            let id = await vkId(msg.match[2]);
            await vkFromDb(id);
            if (!users[id]) return msg.send("🚫 Данного игрока не существует\n✏ Свадьба [ID/ссылка]");
            if (id == msg.senderId) return msg.send("🚫 Возможно, вы так любите себя, что готовы выйти замуж за себя, но мы не разрешаем вам");
            if (users[id].married) return msg.send("🚫 Увы, ваша любовь уже женат/замужем");

            let m = await vkGroup.api.users.get({
                user_ids: msg.senderId + "," + id,
                fields: "sex, first_name_dat"
            }),
                marry = users[id];

            if (!user.marry_inv) user.marry_inv = {};
            if (!marry.marry_inv) marry.marry_inv = {};

            if (user.marry_inv[id]) {
                user.married = {
                    id: id,
                    gay: m[0].sex == m[1].sex,
                    sex: m[1].sex,
                    kids: {},
                    marriedDate: +new Date(),
                    exp: 0,
                    bank: 0,
                    leader: msg.senderId
                };
                marry.married = {
                    id: msg.senderId,
                    leader: msg.senderId,
                    gay: m[0].sex == m[1].sex,
                    sex: m[0].sex
                };
                user.marry_inv = {};
                marry.marry_inv = {};
                vkGroup.api.messages.send({
                    message: `${m[0].sex == m[1].sex ? '🏳️‍🌈' : '❤'} @id${id} (${m[1].first_name}) и @id${msg.senderId} (${m[0].first_name}) заключили брак`,
                    user_ids: id,
                    random_id: getRandomId()
                });
                msg.send(`${m[0].sex == m[1].sex ? '🏳️‍🌈' : '❤'} @id${msg.senderId} (${m[0].first_name}) и @id${id} (${m[1].first_name}) заключили брак`,
                    {
                        disable_mentions: 1
                    });
            } else {
                let time = +new Date();
                if (slowmarry[msg.senderId] && slowmarry[msg.senderId] > time) return msg.send(`🚫 Предложения можно кидать раз в 3 минуты\n🕒 Подождите: ${fancyTimeFormat(Math.floor((slowmarry[msg.senderId] - time) / 1000))}`);
                slowmarry[msg.senderId] = time + 180000;

                marry.marry_inv[msg.senderId] = true;
                msg.send(`${m[0].sex == m[1].sex ? '🏳️‍🌈' : '❤'} @id${msg.senderId} (${m[0].first_name}) предложил свое сердце и руку @id${id} (${m[1].first_name_dat})`,
                    {
                        disable_mentions: 1
                    });
                vkGroup.api.messages.send({
                    message: `${m[0].sex == m[1].sex ? '🏳️‍🌈' : '❤'} @id${msg.senderId} (${m[0].first_name}) предложил${m[0].sex == 1 ? 'а' : ''} вам свое сердце и руку`,
                    user_ids: id,
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: `${m[0].sex == m[1].sex ? '🏳️‍🌈' : '❤'} Согласиться`,
                            payload: {
                                command: 'marry',
                                params: {
                                    id: msg.senderId
                                }
                            },
                            color: Keyboard.POSITIVE_COLOR
                        })
                    ]).inline(),
                    random_id: getRandomId()
                });
            }
        }
    }
},
{
    r: /^брак( (.*))?$/i,

    async f(msg, user) {
        if (!user.married) return msg.send("🚫 Вы не в браке\n✏ Что бы вступить в брак, введите \"Свадьба [ссылка]\"");

        let id = user.married.id;
        await vkFromDb(id);

        if (!user.married.leader) {
            user.married.leader = msg.senderId;
            users[id].married.leader = msg.senderId;

            user.married.kids = {};
            user.married.exp = 0;
            user.married.bank = 0;
        }

        let marry = users[user.married.leader].married;
        marry = marryApi.checkLegit(marry);

        if (msg.match[2] == "развод") {

            msg.send(`💔 Вы развелись с @id${id} (${users[id].nick})`);
            vkGroup.api.messages.send({
                user_ids: id,
                message: `💔 @id${msg.senderId} (${user.nick}) ${user.married.sex == 1 ? "развелся" : "развелась"} с вами`,
                random_id: getRandomId()
            });

            delete user.married;
            delete users[id].married;
            user.marry_inv = {};
            users[id].marry_inv = {};
        } else {
            if (Object.keys(marry.kids).length) await vkFromDb(Object.keys(marry.kids));
            moment.locale("ru");
            msg.send(`${user.married.gay ? '🏳️‍🌈' : '❤'} Вы в браке с @id${id} (${users[id].nick})
▶ Уровень брака: ${marryApi.lvl(marry.exp)}
💲 Сбережения: ${numberWithCommas(marry.bank)}$
👶 ${(Object.keys(marry.kids).length ? `Дети:\n${Object.keys(marry.kids).map(id => `${marry.kids[id].sex == 1 ? '👧' : '👦'} @id${id} (${users[id].nick})`).join("\n")}` : 'Детей: нет')}
📅 Брак заключен: ${marry.marriedDate ? `${dateFormat(new Date(marry.marriedDate))} (${moment(marry.marriedDate).fromNow()})` : "Неизвестно"}`,
                {
                    disable_mentions: 1
                });
        }
    }
}];