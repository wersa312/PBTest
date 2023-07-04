const { numberToSmile, numberWithCommas, rareToStr } = require("../../api/utils");

module.exports = {
    r: /^машины/i,
    f(msg, user) {
        if (!user.cars.length) return msg.send("🚫 У вас нет машин");

        msg.send((
            `${msg.prefix}ваш гараж:\n` +
            (user.cars.map((car, id) => {
                return (
                    `${numberToSmile(id + 1)}. ${car.brand} ${car.model}\n` +
                    `⠀🚀 Максимальная скорость: ${car.max}км/час\n` +
                    `⠀🌎 Пробег: ${numberWithCommas(car.prob)}км\n` +
                    `⠀🚘 Класс: ${car.class}\n` +
                    `⠀🚦 Разгон до 100: ${car.acc}сек.\n` +
                    `⠀⚙ Вес: ${car.weight}кг\n` +
                    `⠀💡 Редкость: ${rareToStr(car.rare)}`
                )
            }).join("\n\n"))
        ));
    }
}