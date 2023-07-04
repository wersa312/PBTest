const { Keyboard } = require("vk-io");
const { firstLetterToUpper } = require("../../api/utils"),
    moment = require('moment'),
    request = require('request');

module.exports = {
    r: /^(weather|погода)( (.*))?$/i,
    payload: 'weather',
    scene: "weather",

    f(msg) {
        if (msg.type == "cmd" && !msg.match[3]) return msg.send("🚫 Вы не указали город\n✏ Погода [город]");
        let query;
        if (msg.type == "payload") {
            query = "?lat=" + msg.geo.coordinates.latitude + "&lon=" + msg.geo.coordinates.longitude;
        } else {
            query = msg.type == "scene" ? "?q=" + encodeURIComponent(msg.text) : "?q=" + encodeURIComponent(msg.match[3]);
        }
        request.get("http://api.openweathermap.org/data/2.5/weather" + query + "&lang=ru&units=metric&appid=5d8820e4be0b3f1818880ef51406c9ee", function (e, r, b) {
            let data = JSON.parse(b);
            if (!data.name) return msg.send(" Город не найден.", {
                keyboard: JSON.stringify({ "inline": true, "buttons": [[{ "action": { "type": "location", "payload": "{\"command\": \"weather\",\"params\":null}" } }]] })
            });
            let time = {
                sunrise: moment.utc(data.sys.sunrise * 1000).utcOffset(data.timezone / 60),
                sunset: moment.utc(data.sys.sunset * 1000).utcOffset(data.timezone / 60)
            };

            let keyboard = [[
                Keyboard.locationRequestButton({
                    payload: {
                        command: "weather"
                    }
                })
            ]];

            if (msg.isFromUser) keyboard.push([
                Keyboard.textButton({
                    label: "✉ Подписаться на рассылку",
                    payload: {
                        command: "weather_sub"
                    }
                })
            ])

            msg.send(`🗺 Погода ${data.name} ${countrySmiles[data.sys.country] != null ? countrySmiles[data.sys.country] : data.sys.country}
🔹 ${firstLetterToUpper(data.weather[0].description)}
🌡 Температура: ${data.main.temp} ℃
🙆‍♂️ Ощущается как ${data.main.feels_like} ℃
💧 Влажность: ${data.main.humidity}%
📊 Давление: ${data.main.pressure * 0.75} мм рт. ст.
👁 Видимость: ${data.visibility / 100}%
☁ Облачность: ${data.clouds.all}%
🌀 Ветер: ${data.wind.speed} м/с ${data.wind.deg != null ? data.wind.deg + "°" : ""}
🌅 Рассвет: ${time.sunrise.format("HH:mm")}
🌃 Закат: ${time.sunset.format("HH:mm")}`, {
                lat: data.coord.lat,
                long: data.coord.lon,
                keyboard: Keyboard.keyboard(keyboard).inline()
            });
        });

    }
}

const countrySmiles = {
    "RU": "🇷🇺",
    "KZ": "🇰🇿",
    'BY': "🇧🇾",
    "UA": "🇺🇦",
    "DE": "🇩🇪",
    "CN": "🇨🇳",
    "ES": "🇪🇸",
    "FR": "🇫🇷",
    "GB": "🇬🇧",
    "IT": "🇮🇹",
    "JP": "🇯🇵",
    "KR": "🇰🇷",
    "US": "🇺🇸",
    "AU": "🇦🇺",
    "AT": "🇦🇹",
    "BR": "🇧🇷",
    "VN": "🇻🇳",
    "HK": "🇭🇰",
    "DK": "🇩🇰",
    "IL": "🇮🇱",
    "IN": "🇮🇳",
    'ID': "🇮🇩",
    "IE": "🇮🇪",
    "CA": "🇨🇦",
    "CO": "🇨🇴",
    "MO": "🇲🇴",
    "MY": "🇲🇾",
    "MX": "🇲🇽",
    "NL": "🇳🇱",
    "NZ": "🇳🇿",
    "NO": "🇳🇴",
    "AE": "🇦🇪",
    "PL": "🇵🇱",
    "PT": "🇵🇹",
    "PR": "🇵🇷",
    "SA": "🇸🇦",
    "SG": "🇸🇬",
    "TR": "🇹🇷",
    "PH": "🇵🇭",
    "FI": "🇫🇮",
    "CL": "🇨🇱",
    "CH": "🇨🇭",
    "SE": "🇸🇪",
    "ZA": "🇿🇦",
    "AR": "🇦🇷",
    "CR": "🇨🇷",
    "EG": "🇪🇬",
    "HR": "🇭🇷",
    "IR": "🇮🇷",
    "MA": "🇲🇦",
    "NG": "🇳🇬",
    "PA": "🇵🇦",
    "PE": "🇵🇪",
    "RS": "🇷🇸",
    "SN": "🇸🇳",
    "UY": "🇺🇾",
    "IS": "🇮🇸",
    "TN": "🇹🇳"
};