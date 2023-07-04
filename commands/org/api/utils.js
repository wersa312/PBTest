const { declOfNum, numberWithCommas } = require("../../../api/utils"),
    { orgs } = require("./org");

exports.workParse = (msg, type, obj) => {
    if (type == "pay_int") {
        let [, match] = msg.match(/int\((.*)\)/i);
        match = declOfNum(obj.int, match.split(","));
        return msg.replace(/\{int\}/g, obj.int).replace(/\{payed\}/g, numberWithCommas(obj.payed)).replace(/int\((.*)\)/i, (match ? match : "[ERROR]"));
    }
}

let baseLvl = 10;

exports.workLvl = (type, lvl, xp) => {
    if (Object.keys(orgs[type].workers).length > lvl) {
        needToUp = lvl * baseLvl;
        if (needToUp <= xp) {
            return { lvlup: true, needToUp: (lvl + 1) * baseLvl }
        } else {
            return { lvlup: false, needToUp: needToUp }
        }
    } else {
        return false;
    }
}