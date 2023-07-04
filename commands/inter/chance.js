const { randElement, getRandomInt } = require("../../api/utils");

module.exports = {
    r: /^шанс( .*)?$/i,
    scene: "chanse",
    
    f(msg) {
        msg.send(`${msg.prefix}${randElement(["это случится с шансом", "вероятность этого события", "я уверен на"])} ${getRandomInt(0, 100)}%`)
    }
}