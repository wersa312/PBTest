const Jimp = require("jimp");

exports.flip = (ph, t) => {
    return new Promise(async r => {
        let photo = await Jimp.read(ph);

        if (t == "v") {
            photo.flip(false, true);
        } else {
            photo.flip(true, false);
        }

        photo.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            r(buffer);
        });
    });
}