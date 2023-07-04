const { createCanvas, loadImage } = require('canvas'),
    moment = require('moment');;

exports.cit = (msg, forward) => {
    return new Promise(async r => {
        const [user] = await msg.api.users.get({ user_ids: forward.id, fields: "photo_max" }),
            date = new Date();;

        const canvas = createCanvas(1400, 600);

        let photo = await loadImage(user.photo_max),
            background = await loadImage(__dirname + "/background.png");

        let ctx = canvas.getContext('2d');
        ctx.drawImage(background, 0, 0, 1400, 600);

        ctx.font = '45px "Impact"'
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`«${forward.text}»`, 970, 270, 850, 600);

        ctx.font = '75px Impact';
        ctx.fillText(``, 980, 100);

        ctx.font = '30px Impact';
        ctx.textAlign = "left";
        ctx.fillText(`© ${user.first_name} ${user.last_name}, ${moment().format("HH:mm DD-MM-YYYY")}`, 25, 570);

        ctx.drawImage(photo, 25, 25, 500, 500);

        r(canvas.toBuffer());
    });
}