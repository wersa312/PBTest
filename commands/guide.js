module.exports = [
    {
        payload: "guide_clan_boost",
        
        f(msg, user) {
            msg.send(`❔ Очки клана выдаются в конце недели, зависит от положения рейтинга в топе кланов
🔝 Посмотреть ваше положение в рейтинге можно командой "Топ кланы"

🎲 Как выдаются очки:
⠀1⃣ место - 5 💡
⠀2⃣ место - 4 💡
⠀3⃣ место - 3 💡
⠀4⃣ место - 2 💡
⠀5⃣ место - 1 💡`);
        }
    }
];