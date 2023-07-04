let course = require("../vars/fuel.json"),
    fs = require("fs");

function save() {
    fs.writeFileSync(__dirname + "/../vars/fuel.json", JSON.stringify({ "fuel": course.fuel }), (err) => { });
}

setInterval(() => {
    let rand = Math.floor(Math.random() * 7),
        upordown = Math.floor(Math.random() * 4);
    if ((course.fuel - rand) <= 7) {
        upordown = 1;
    }
    if (upordown == 1) {
        course.fuel += rand;
    } else {
        course.fuel -= rand;
    }

    save();
}, 300000);

exports.fuel = course;

exports.goSave = save();