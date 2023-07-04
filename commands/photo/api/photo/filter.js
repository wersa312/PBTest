const Jimp = require("jimp");

exports.filter = (ph, t) => {
    return new Promise(async r => {
        let image = await Jimp.read(ph);

        if (t.startsWith("br")) {
            image.brightness((t == "br_min" ? -0.5 : 0.5));
        }

        else if (t.startsWith("cr")) {
            image.contrast((t == "cr_min" ? -0.5 : 0.5));
        }

        else if (t == "dither") {
            image.dither565();
        } else if (t == "greyscale") {
            image.greyscale();
        } else if (t == "invert") {
            image.invert();
        } else if (t == "sepia") {
            image.sepia();
        } else if (t == "art") {
            image.posterize(5);
        }

        image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            r(buffer);
        });
    });
}