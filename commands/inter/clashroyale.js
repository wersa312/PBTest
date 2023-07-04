const Client = require('clash-royale-api'),
    cr = new Client("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjFmMWExNmNhLWY4Y2EtNGRiZS1hNTcxLTgyYjcxMTU2YzVjMCIsImlhdCI6MTYwNTk2NjgzMSwic3ViIjoiZGV2ZWxvcGVyLzkzM2QxMDViLWMzZTgtYWM4YS0xMGNhLTYzN2VhZmQzYjRkMyIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIzNy45OS4xMTkuMjMyIl0sInR5cGUiOiJjbGllbnQifV19.0KvwmF28n-2Zv1L2880kQuv0LUD965MOllxMLvJlpF7Du365IsPP2wDA7E3hXw5Ou-FV7Z16gppny948dfv5Lw"),
    { Keyboard } = require("../../main"),
    { numberToSmile } = require("../../api/utils");

function translateChest(chest) {
    return chest.replace(/silver/gi, "Серебряный").replace(/golden/gi, "Золотой").replace(/magical/gi, "Магический").replace(/Mega Lightning/gi, "Супер магический").replace(/legendary/gi, "Легендарный").replace(/epic/gi, "Эпический").replace(/giant/gi, "Огромный").replace(/chest/i, "Сундук");
}

module.exports = [{
    r: /^(cr|кр)( ([^\s]+))?$/i,

    scene: "cr",
    payload: "cr_get",
    async f(msg, user) {
        let tag;
        if (msg.type == "cmd") tag = msg.match[3] ? msg.match[3] : user.cr;
        if (msg.type == "scene") tag = msg.text ? msg.text : user.cr;
        if (msg.type == "payload") tag = user.cr;

        if (!(tag + "").startsWith("#")) tag = "#" + tag;

        try {
            let player = (await cr.player(tag)).all;

            msg.send(`📄 Игрок: ${player.name} | ${player.expLevel} уровень
🏆 Кубки: ${player.trophies} | Рекорд: ${player.bestTrophies}
⛳ Арена: ${player.arena.name}

🛡 Клан: ${player.clan ? player.clan.name + ` - ${player.role.replace(/coleader/gi, "со-рук").replace(/leader/gi, "лидер").replace(/member/gi, "участник")}` : "🚫"}
⠀❤ Донатов: ${player.donations} выдано | ${player.donationsReceived} получено
⠀❤ За все время: ${player.totalDonations}

⠀⚔ Побед в кв: ${player.warDayWins}
⠀⚔ Получено карт: ${player.clanCardsCollected}

📊 Статистика:
⠀🔫 ${player.battleCount} игр
⠀⠀⠀🔫 ${player.wins} побед | ${player.losses} проигрышей
⠀⠀⠀🔫 ${player.threeCrownWins} побед в 3 короны
⠀🃏 Карт: ${player.cards.length}
⠀⠀⠀❤ Любимая карта: ${player.currentFavouriteCard.name}
⠀🏹 Рекорд испытании: ${player.challengeMaxWins}
⠀⠀⠀🃏 Выиграно карт: ${player.challengeCardsWon}
⠀🏰 Сыграно турниров: ${player.tournamentBattleCount}
⠀⠀⠀🃏 Выиграно карт: ${player.tournamentCardsWon} ${user.cr != tag ? '\n\n📄 Тэг сохранен. Вы можете следующий раз ввести команду, без указания тега.' : ''}`, {
                keyboard: Keyboard.keyboard([
                    Keyboard.textButton({
                        label: '🔁 Цикл сундуков',
                        payload: {
                            command: 'clashroyale-chests',
                            params: {
                                cr: tag
                            }
                        },
                        color: Keyboard.SECONDARY_COLOR
                    })
                ]).inline()
            });
            user.cr = tag;
        } catch {
            msg.send(`🚫 Тег не найден`)
        }
    }
},
{
    payload: "clashroyale-chests",

    async f(msg) {
        let chests = (await cr.player(msg.params.cr, 'upcomingchests')).all;
        msg.send(`🔁 Цикл сундуков:\n${chests.map(c => "⠀" + numberToSmile((c.index < 10 ? (c.index + 1) : c.index)) + ". " + translateChest(c.name)).join("\n")}`);
    }
}]