let { VK, getRandomId } = require("vk-io"),
    config = require("../config");

let tokens = config.token.main.helpers.map(x => {
    return new VK({ token: x, language: 'ru', apiMode: 'parallel', apiLimit: 25, apiExecuteCount: 25, apiWait: 100, apiRetryLimit: 1, apiTimeout: 10 * 60 * 1000 });
});

let tokensLoad = tokens.map((x, y) => {
    return { num: y, load: 0, total: 0 };
});

function getLeastLoaded() {
    let group = tokensLoad.sort((a, b) => a.load - b.load)[0];
    group.load++;
    group.total++;
    return group;
}

module.exports = (peer_id) => {
    return function (msg, data = {}) {
        return new Promise(async res => {
            let group = getLeastLoaded();
            await tokens[group.num].api.messages.send(Object.assign({
                peer_id: peer_id,
                message: msg,
                random_id: getRandomId(),
                disable_mentions: 1
            }, data))
            res(group.load--);
        });
    }
}