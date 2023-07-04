const wtf = require('wtf_wikipedia');

module.exports = {
    r: /^(wiki|вики)( (.*))?$/i,

    scene: "wiki",
    f(msg) {
        let find;
        if (msg.type == "cmd") find = msg.match[3];
        if (msg.type == "scene") find = msg.text;
        if (!find) return msg.send("🚫 Вы не указали статью, которую надо найти");
        wtf.fetch(find, 'ru').then((doc) => {
            if (!doc) return msg.send("🚫 Такой статьи не найдено");
            let text = doc.sentences(0).text(),
                i = 1;
            while (text.length < 500) {
                text = text + " " + (doc.sentences(i) != null ? doc.sentences(i).text().toString() : "");
                i++;
            }
            msg.send("🔮 " + text + "\n\n📄 " + doc.url());
        });
    }
}