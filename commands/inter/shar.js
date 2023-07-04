const { randElement, getRandomInt } = require("../../api/utils");

module.exports = {
    r: /^шар( .*)?$/i,
    scene: "shar",

    f(msg) {
        let positive = getRandomInt(0, 1);
        if (positive) {
            msg.send(`🔮 ${randElement(["Шар говорит - да", "Определенно", "Разумеется", "Бессомненно", "Я уверен на 100%"])}`);
        } else {
            msg.send(`🔮 ${randElement(["Шар говорит - нет", "Невозможно", "Никак нет", "Нет шансов"])}`);
        }
    }
}