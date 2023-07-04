let course = require("../vars/pockecoins.json"),
    { getRandomInt } = require("../api/utils"),
    fs = require("fs");

function save() {
    fs.writeFileSync(__dirname + "/../vars/pockecoins.json", JSON.stringify({ "course": course.course }), () => { });
}

setInterval(() => {
    let rand = getRandomInt(1, 10), upordown = getRandomInt(0, 1);
    if (course.course <= 1000) {
        upordown = 2;
    } else if (course.course >= 30000) {
        upordown = 1;
    }
    if (upordown) {
        course.course -= rand;
    } else {
        course.course += rand;
    }

    save();
}, 10000)

exports.course = course;

exports.goSave = save;