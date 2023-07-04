const { vkManager } = require("../../main");

const pbChats = require("../../vars/manage.json")

module.exports = {
    r: /^(?:беседы|беседа|chats)/i,
    payload: "chats",
    async f(msg) {
        let chats = await vkManager.api.messages.getConversationsById({
            peer_ids: Object.keys(pbChats).join(",")
        });
        msg.send(`💭 Беседы PB Chats:\n⠀⠀` +
            `${chats.items.map(c => `${c.chat_settings.members_count == 2000 ? "🔸" : "🔹"} ${c.chat_settings.title} (${c.chat_settings.members_count}/2000): ${pbChats[c.peer.id].link}`).join("\n⠀⠀")}\n\n` +
            `❔ Исключили из беседы? Заполни амнистию, что бы вернуться: https://vk.cc/azDbWE`);
    }
}