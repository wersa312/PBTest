const { randElement, generateContentSource } = require("../../api/utils");

module.exports = {
    r: /^выбери(?: (.*))?$/i,
    /**
     * 
     * @param {import("vk-io").MessageContext} msg 
     */
    async f(msg) {
        if (!msg.match[1] || msg.match[1].split(" или ").length < 2) return msg.send(`✏ Используй: Выбери [предложение] или [предложение]\n📝 Пример: Выбери играть или делать домашнее задание`);
        let choised = randElement(msg.match[1].split(" или "), 2);
        msg.send(`${msg.prefix}${randElement([
            `я выберу ${choised[0]}`,
            `думаю ${choised[0]}, но ${choised[1]} тоже не плох`,
            `скорее всего ${choised[0]}`,
            `конечно же ${choised[0]}`,
            `возможно ${choised[0]}`
        ])}`, {
            content_source: generateContentSource({
                peerId: msg.peerId,
                conversationMessageId: msg.conversationMessageId
            })
        })
    }
}