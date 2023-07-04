const moment = require("moment");
const { getRandomId } = require("vk-io");
const { vkId, vkFromDb, saveUsersToDb } = require("../../api/acc");
const { getAdmins } = require("../../api/admin_utils");
const { users, vkGroup } = require("../../main");

module.exports = [
    {
        r: /^админ ([^\s]+)$/i,
        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canUp) return;

            let id = await vkId(msg.match[1]);
            await vkFromDb(id);

            if (id == -1 || !users[id]) return msg.send(`🚫 Игрок не найден`);
            let _user = users[id];

            if (_user.status.type == 100) {
                _user.status.type = 0;
                delete _user.admin_events;
                vkGroup.api.messages.send({
                    user_ids: await getAdmins(),
                    message: `⚠ ГА @id${msg.senderId} (${user.nick}) снял с админки @id${id} (${_user.nick})\n#pbchangestatus`,
                    random_id: getRandomId()
                });
                msg.send(`❌ @id${id} (${_user.nick}) снят с админки и был выдан статус "Пользователь"`);
            } else {
                _user.status.type = 100;
                if (_user.cookie == null) _user.cookie = 0;
                _user.admin_events = {
                    kicked: 0,
                    bans_gived: 0,
                    warn_gived: 0,
                    upped: moment().format('L'),
                    upped_by: msg.senderId
                };
                vkGroup.api.messages.send({
                    user_ids: await getAdmins(),
                    message: `⚠ ГА @id${msg.senderId} (${user.nick}) поставил на админку @id${id} (${_user.nick})\n#pbchangestatus`,
                    random_id: getRandomId()
                });
                msg.send(`✅ @id${id} (${_user.nick}) поставлен на админку\n💬 Пока ему доступны следующие возможности: кик, варн, команды V.I.P. и Premium.`);
            }
            return saveUsersToDb(0);
        }
    },

    {
        r: /^админ ([^\s]+) (.*)$/i,
        status: 100,
        async f(msg, user) {
            if (!user.admin_events.canUp) return;

            let id = await vkId(msg.match[1]);
            await vkFromDb(id);

            if (id == -1 || !users[id]) return msg.send(`🚫 Игрок не найден`);
            if (users[id].status.type != 100) return msg.send(`🚫 Не админ`);

            let _user = users[id],
                _text = msg.match[2];

            if (_text == "бан") {
                if (_user.admin_events.canBan) {
                    delete _user.admin_events.canBan;
                    msg.send(`❌ @id${id} (${_user.nick}) потерял силу банов`);
                } else {
                    _user.admin_events.canBan = true;
                    msg.send(`✅ @id${id} (${_user.nick}) овладел силой банов`);
                }
            }

            else if (_text == "иммунитет") {
                if (_user.admin_events.ban_imun) {
                    delete _user.admin_events.ban_imun;
                    msg.send(`❌ @id${id} (${_user.nick}) потерял иммунитет к банам`);
                } else {
                    _user.admin_events.ban_imun = true;
                    msg.send(`✅ @id${id} (${_user.nick}) овладел иммунитетом к банам`);
                }
            }

            else if (_text == "репорт") {
                if (_user.admin_events.canRep) {
                    delete _user.admin_events.canRep;
                    msg.send(`❌ @id${id} (${_user.nick}) потерял доступ к репортам`);
                } else {
                    _user.admin_events.canRep = true;
                    msg.send(`✅ @id${id} (${_user.nick}) получил доступ к репортам`);
                }
            }

            else if (_text == "обнул") {
                if (_user.admin_events.canObnul) {
                    delete _user.admin_events.canObnul;
                    msg.send(`❌ @id${id} (${_user.nick}) потерял силу обнула`);
                } else {
                    _user.admin_events.canObnul = true;
                    msg.send(`✅ @id${id} (${_user.nick}) овладел силой обнулов`);
                }
            }

            else if (_text == "логи") {
                if (_user.admin_events.canLog) {
                    delete _user.admin_events.canLog;
                    msg.send(`❌ @id${id} (${_user.nick}) потерял силу логов`);
                } else {
                    _user.admin_events.canLog = true;
                    msg.send(`✅ @id${id} (${_user.nick}) овладел силой логов`);
                }
            }

            else if (_text == "дб") {
                if (_user.admin_events.canEdit) {
                    delete _user.admin_events.canEdit;
                    msg.send(`❌ @id${id} (${_user.nick}) теперь не может выдавать деньги, коины, голду`);
                } else {
                    _user.admin_events.canEdit = true;
                    msg.send(`✅ @id${id} (${_user.nick}) теперь может выдавать деньги, коины, голду`);
                }
            }

            else if (_text == "дев") {
                if (_user.admin_events.canEval) {
                    delete _user.admin_events.canEval;
                    msg.send(`❌ @id${id} (${_user.nick}) теперь не может пользоваться командой "dev"`);
                } else {
                    _user.admin_events.canEval = true;
                    msg.send(`✅ @id${id} (${_user.nick}) теперь может пользоваться командой "dev"`);
                }
            }

            saveUsersToDb(0);
        }
    }
]