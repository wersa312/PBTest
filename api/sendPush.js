const { getRandomId } = require("vk-io");
const { vkGroup, users, Keyboard } = require("../main"),
    { vkFromDb } = require("../api/acc");

module.exports = {
    /**
     * Sends push for users
     * @param {number|number[]} id - VK ID
     * @param {String} text - message for push
     * @param {Object} options - options for push
     * @param {Boolean=} options.important - send push without check mute
     * @param {String=} options.emoji - use your emoji
     */
    async sendPush(id, text, options) {

        await vkFromDb(id);

        let sendHelp = false;

        if (!Array.isArray(id)) id = [id];
        id = id.filter(i => {
            if (users[i].push == null) {
                sendHelp = true;
                users[i].push = true;
            }
            if (options?.important) return true;
            if (users[i].push != null && !users[i].push) return false;
            return true;
        });

        if (id.length == 0) return;
        let sendParams = {
            user_ids: id.join(","),
            message: `🔔 ${options?.emoji ? options.emoji : ""} ${text}${sendHelp ? "\n🔇 Чтобы отключить уведомления, введите \"Уведомление\"" : ""}`,
            random_id: getRandomId()
        }
        if (id.length == -1 && sendHelp) {
            sendParams.keyboard = Keyboard.keyboard([
                Keyboard.textButton({
                    label: '🔇 Выключить уведомления',
                    payload: {
                        command: 'send_push'
                    },
                    color: Keyboard.NEGATIVE_COLOR
                })
            ]).inline();
        }
        return vkGroup.api.messages.send(sendParams).catch();;
    }
}