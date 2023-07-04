let course = { buy: 500000000, sell: 300000000 },
    { numberWithCommas } = require("../../api/utils"),
    { log } = require("../../api/logs");

module.exports = [
    {
        r: /^золото$/i,
        f(msg, user) {
            msg.send(`${msg.prefix}у вас ${numberWithCommas(user.gold ? user.gold : 0)} Pockegold\n🔼 Для покупки, напишите: Золото купить [кол-во]\n🔽 Для продажи, напишите: Золото продать [кол-во]`);
        }
    },
    {
        r: /^(купить золото|золото купить)( (.*))?$/i,

        f(msg, user) {
            if (!msg.match[3]) return msg.send(`🚫 Вы не указали число для приобретения\n✏ Купить золото [число]`);
            if (!user.gold) user.gold = 0;

            let bufc = course.buy,
                gold = parseInt(msg.match[3].replace(/все|всё/, Math.floor(user.money / bufc)).replace(/(k|к)/gi, "000"));

            if (isNaN(gold) || gold < 1) return msg.send(`🚫 Вы не указали правильное число для приобретения\n✏ Купить золото [число]`);
            if (user.money < (gold * bufc)) return msg.send(`🚫 У вас нет ${numberWithCommas(gold * bufc)}$ для приобретения ${numberWithCommas(gold)} pockegold\n💰 Баланс: ${numberWithCommas(user.money)}$`);

            user.money -= gold * bufc;
            user.gold += gold;

            msg.send(`${msg.prefix}вы приобрели ${numberWithCommas(gold)} pockegold (-${numberWithCommas(gold * bufc)}$)\n⚜️ Pockegold: ${numberWithCommas(user.gold)}\n💰 Баланс: ${numberWithCommas(user.money)}$`);

            log(user.vk, `Купил ${numberWithCommas(gold)} pockegold на ${numberWithCommas(gold * bufc)}$`);
        }
    },
    {
        r: /^(продать золото|золото продать)( (.*))?$/i,

        f(msg, user) {
            if (!msg.match[3]) return msg.send(`🚫 Вы не указали число для продажи\n✏ Продать золото [число]`);
            if (!user.gold) user.gold = 0;

            let bufc = course.sell,
                gold = parseInt(msg.match[3].replace(/все|всё/, Math.floor(user.gold)).replace(/(k|к)/gi, "000"));

            if (isNaN(gold) || gold < 1) return msg.send(`🚫 Вы не указали правильное число для продажи\n✏ Продать золото [число]`);
            if (user.gold < gold) return msg.send(`🚫 У вас нет ${numberWithCommas(gold)} pockegold\n⚜️ Pockegold: ${numberWithCommas(user.gold)}`);

            user.money += gold * bufc;
            user.gold -= gold;

            msg.send(`${msg.prefix}вы продали ${numberWithCommas(gold)} pockegold (+${numberWithCommas(gold * bufc)}$)\n⚜️ Pockegold: ${numberWithCommas(user.gold)}\n💰 Баланс: ${numberWithCommas(user.money)}$`);

            log(user.vk, `Продал ${numberWithCommas(gold)} pockegold на ${numberWithCommas(gold * bufc)}$`);
        }
    }]