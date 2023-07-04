module.exports = {
    r: /^(clear|очистить)$/i,
    status: 100,
    f(msg) {
        msg.send("1", {
            keyboard: JSON.stringify({
                buttons: []
            })
        })
    }
}