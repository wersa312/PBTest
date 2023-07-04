const { getRandomId } = require("vk-io");
let { chats, db, vkGroup } = require("../../../../main");

module.exports = async (id, message) => {
    delete chats[id].mafia;
    await db.collection("mafia").deleteMany({ id: id });
    vkGroup.api.messages.send({
        peer_id: 2e9 + id,
        message: message,
        keyboard: JSON.stringify({
            buttons: []
        }), 
        random_id: getRandomId()
    })
}