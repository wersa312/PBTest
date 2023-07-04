const Jimp = require("jimp");

exports.kek = (ph) => {
    return new Promise(async r => {
        let photo = await Jimp.read(ph),
            photo2 = photo.clone();

        const size = {
            w: photo.bitmap.width,
            h: photo.bitmap.height
        };

        photo2.crop(0, 0, Math.round(size.w / 2), size.h)
        photo2.flip(true, false);

        photo.composite(photo2, Math.round(size.w / 2), 0);

        photo.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            r(buffer);
        });
    });
}