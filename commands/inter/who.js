const { randElement, numberToSmile, antiBan } = require("../../api/utils"),
    { vkGroup } = require("../../main"),
    strings = require("../../vars/strings.json");

module.exports = [
    {
        r: /^кто( (.*))?$/i,
        async f(msg) {
            if (msg.isFromUser) return msg.send(`🚫 Данная команда доступа только в беседе`);
            try {
                let { profiles } = await vkGroup.api.messages.getConversationMembers({
                    peer_id: msg.peerId,
                    fields: "online, first_name_gen, last_name_gen, first_name_dat, last_name_dat"
                });
                if (msg.match[2]) {
                    if (msg.match[2] == "онлайн" || msg.match[2] == "тут") {
                        profiles = profiles.filter(p => p.online);
                        return msg.send(`${msg.prefix}${profiles.length} людей онлайн:\n${profiles.map((p, i) => `${numberToSmile(i + 1)} @id${p.id} (${p.first_name} ${p.last_name}) | ${p.online_mobile ? "📱" : "💻"}`).join("\n")}`, { disable_mentions: 1 });
                    } else if (msg.match[2].startsWith("у кого")) {
                        if (profiles.length == 1) return msg.send(`🚫 В беседе мало участников для данной функции`);
                        profiles = randElement(profiles, 2);
                        let f = profiles[0],
                            s = profiles[1];
                        return msg.send(`${msg.prefix}${randElement(["разумеется", "конечно же", "наверное", "инфа сотка", "я думаю", "возможно", "по моей информации"])} @id${f.id} (${f.first_name} ${f.last_name}) у @id${s.id} (${s.first_name_gen} ${s.last_name_gen})`, { disable_mentions: 1 });
                    } else if (msg.match[2].startsWith("кого") || msg.match[2].startsWith("каво")) {
                        if (profiles.length == 1) return msg.send(`🚫 В беседе мало участников для данной функции`);
                        profiles = randElement(profiles, 2);
                        let f = profiles[0],
                            s = profiles[1];
                        return msg.send(`${msg.prefix}${randElement(["разумеется", "конечно же", "наверное", "инфа сотка", "я думаю", "возможно", "по моей информации"])} @id${f.id} (${f.first_name} ${f.last_name}) @id${s.id} (${s.first_name_gen} ${s.last_name_gen})`, { disable_mentions: 1 });
                    } else if (msg.match[2].startsWith("кому")) {
                        if (profiles.length == 1) return msg.send(`🚫 В беседе мало участников для данной функции`);
                        profiles = randElement(profiles, 2);
                        let f = profiles[0],
                            s = profiles[1];
                        return msg.send(`${msg.prefix}${randElement(["разумеется", "конечно же", "наверное", "инфа сотка", "я думаю", "возможно", "по моей информации"])} @id${f.id} (${f.first_name} ${f.last_name}) @id${s.id} (${s.first_name_dat} ${s.last_name_dat})`, { disable_mentions: 1 });
                    }
                }
                profile = randElement(profiles);
                return msg.send(`${msg.prefix}${randElement(["разумеется", "конечно же", "наверное", "инфа сотка", "я думаю", "возможно", "по моей информации"])} это @id${profile.id} (${profile.first_name} ${profile.last_name})`, { disable_mentions: 1 });
            } catch (e) {
                msg.send(strings.chats.bot_isnt_admin);
            }
        }
    },

    {
        r: /^кому( (.*))?$/i,
        async f(msg) {
            if (msg.isFromUser) return msg.send(`🚫 Данная команда доступа только в беседе`);
            try {
                let { profiles } = await vkGroup.api.messages.getConversationMembers({
                    peer_id: msg.peerId,
                    fields: "first_name_dat, last_name_dat"
                });
                if (msg.match[2]) {
                    if (msg.match[2].startsWith("кто")) {
                        if (profiles.length == 1) return msg.send(`🚫 В беседе мало участников для данной функции`);
                        profiles = randElement(profiles, 2);
                        let f = profiles[0],
                            s = profiles[1];
                        return msg.send(`${msg.prefix}${randElement(["разумеется", "конечно же", "наверное", "инфа сотка", "я думаю", "возможно", "по моей информации"])} @id${f.id} (${f.first_name_dat} ${f.last_name_dat}) ${antiBan(msg.match[2].replace(/кто( )?/i, ""))} @id${s.id} (${s.first_name} ${s.last_name})`, { disable_mentions: 1 });
                    }
                }
                profile = randElement(profiles);
                return msg.send(`${msg.prefix}${randElement(["разумеется", "конечно же", "наверное", "инфа сотка", "я думаю", "возможно", "по моей информации"])} @id${profile.id} (${profile.first_name_dat} ${profile.last_name_dat})`, { disable_mentions: 1 });
            } catch (e) {
                msg.send(strings.chats.bot_isnt_admin);
            }
        }
    },

    {
        r: /^кого( (.*))?$/i,
        async f(msg) {
            if (msg.isFromUser) return msg.send(`🚫 Данная команда доступа только в беседе`);
            try {
                let { profiles } = await vkGroup.api.messages.getConversationMembers({
                    peer_id: msg.peerId,
                    fields: "first_name_acc, last_name_acc"
                });
                if (msg.match[2]) {
                    if (msg.match[2].startsWith("кто")) {
                        if (profiles.length == 1) return msg.send(`🚫 В беседе мало участников для данной функции`);
                        profiles = randElement(profiles, 2);
                        let f = profiles[0],
                            s = profiles[1];
                        return msg.send(`${msg.prefix}${randElement(["разумеется", "конечно же", "наверное", "инфа сотка", "я думаю", "возможно", "по моей информации"])} @id${f.id} (${f.first_name_acc} ${f.last_name_acc}) ${antiBan(msg.match[2].replace(/кто( )?/i, ""))} @id${s.id} (${s.first_name} ${s.last_name})`, { disable_mentions: 1 });
                    }
                }
                profile = randElement(profiles);
                return msg.send(`${msg.prefix}${randElement(["разумеется", "конечно же", "наверное", "инфа сотка", "я думаю", "возможно", "по моей информации"])} @id${profile.id} (${profile.first_name_acc} ${profile.last_name_acc})`, { disable_mentions: 1 });
            } catch (e) {
                msg.send(strings.chats.bot_isnt_admin);
            }
        }
    }
];