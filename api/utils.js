const config = require("../config");

module.exports = {
    /**
     * @description Number like 1000000 convers to 1,000,000
     * @param {number} x - number
     * @param {Boolean=} point - use points (.) instead (,)
     * @returns {string} String like 1,000,000
     */
    numberWithCommas(x, point) {
        if (point) {
            let parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return parts.join(",");
        }
        let parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    },
    /**
     * @description Converts Status Object to String
     * @param {Object} status Status Object
     * @returns {String} String
     */
    statusToStr(status) {
        let toReturn;
        switch (status.type) {
            case 0:
                toReturn = "Пользователь";
                break;
            case 1:
                toReturn = "V.I.P.";
                break;
            case 2:
                toReturn = "Premium";
                break;
            case 3:
                toReturn = "Тестер";
                break;
            case 100:
                toReturn = "Администратор"
                break;
        }
        return toReturn;
    },
    /**
     * @description Picks random elements from array
     * @param {[]} arr Array
     * @param {number?} n Elements count (Default: 1)
     */
    randElement(arr, n = 1) {
        if (n == 1) return arr[Math.floor(Math.random() * arr.length)];
        let result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError("randElement: more elements taken than available");
        while (n--) {
            let x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    },
    /**
     * @description Converts seconds to time like H:M:S (2:46:12)
     * @param {number} time 
     * @returns {String} H:M:S (2:46:12)
     */
    fancyTimeFormat(time) {
        let hrs = ~~(time / 3600);
        let mins = ~~((time % 3600) / 60);
        let secs = time % 60;
        let ret = "";

        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }

        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    },
    /**
     * @description divide array to 2d array
     * @param {[]} array - array to divide
     * @param {number} size - how much colums
     * @returns {[]} Array
     */
    chunks(array, size) {
        let results = [];
        while (array.length) {
            results.push(array.splice(0, size));
        }
        return results;
    },
    /**
     * @param {String} str String
     * @returns {string} new string with first letter upper
     */
    firstLetterToUpper(str) {
        if (!str) return str;
        return (str[0].toUpperCase() + str.slice(1)).replace(/!/gi, ".");
    },
    /**
     * @description Filter for bad words
     * @author Cyvvv
     * @param {String} str String
     * @param {String} replace replace with your char
     * @returns {String} New filtred string
     */
    antiBan(str, replace) {
        return String(str).replace(/&#[0-9]+;|[сcs]+[кki{|{c]+[рrp]+[иui]+[пnp]+[тmt]+|[тmt]+[аa@oо]+[рrp]+[гrg]+[еёe]+[тmt]+|[m]+[i]+([кki{|{]+[сcs]+|[xх]+)|[лlji]+[iаa@oоиу]+[kкйuyi]+[eекki{|{]+|\\u[0-9abcdef]{1,4}|\[(club|id)[^|]+\|[^]]+\]|\.|￾|[*@][a-z0-9_]+(\s+)?\([^\)]+\)|[@*](id|club)[0-9a-z_]+/gi, replace || '?');
    },
    /**
     * 
     * @param {Date} d Date Object
     * @returns {string} formated date like 05-06-2020 21:22
     */
    dateFormat(d) {
        if (!d) return "1.01.1970 00:00";
        return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    },
    /**
     * @description Convers number to emojies like 🔟
     * @param {Number} n Integer
     * @returns {string} emojied number
     */
    numberToSmile(n) {
        n = n + "";
        if (n == "10") return "🔟";
        n = n.replace(/1/gi, "1⃣").replace(/2/gi, "2⃣").replace(/3/gi, "3⃣").replace(/4/gi, "4⃣").replace(/5/gi, "5⃣").replace(/6/gi, "6⃣").replace(/7/gi, "7⃣").replace(/8/gi, "8⃣").replace(/9/gi, "9⃣").replace(/0/gi, "0⃣");
        return n;
    },
    /**
     * 
     * @param {Number} seconds seconds
     * @returns {string} like 6д:22ч:40м:00с
     */
    timeFormat(seconds) {
        let days = Math.floor(seconds / (3600 * 24));
        seconds -= days * 3600 * 24;
        let hrs = Math.floor(seconds / 3600);
        seconds -= hrs * 3600;
        let mnts = Math.floor(seconds / 60);
        seconds -= mnts * 60;
        let ret = "";

        if (days > 0) {
            ret += days + "д:";
            ret += hrs + "ч:";
        } else if (hrs > 0) {
            ret += hrs + "ч:";
        }

        ret += "" + mnts + "м:" + (seconds < 10 ? "0" : "");
        ret += "" + seconds + "с";
        return ret;
    },
    /**
     * @description returns random number from min to max
     * @param {Number} min 
     * @param {Number} max 
     * @returns {Number} Random number from range
     */
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    /**
     * @description function to random sort array
     */
    sortRandom() {
        return Math.random() - 0.5;
    },
    /**
     * @description Для склонения чисел
     * @param {Number} n Number
     * @param {[String]} titles String
     */
    declOfNum(n, titles) {
        n = Math.abs(n);
        return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2]
    },
    /**
     * 
     * @param {String} text 
     */
    clubLink(text) {
        return `@club151782797 (${text})`
    },
    /**
     * 
     * @param {Object} obj 
     * @param {Number} obj.peerId
     * @param {Number} obj.conversationMessageId
     */
    generateContentSource(obj) {
        return JSON.stringify({
            type: 'message',
            peer_id: obj.peerId,
            conversation_message_id: obj.conversationMessageId,
            owner_id: config.token.main.id
        })
    },
    rareToStr(rare){
        return rare.replace("halloween", "хэллоуинская").replace("legendary", "легендарная").replace("epic", "эпическая").replace("rare", "редкая").replace("common", "обычная").replace("vedro", "ведро").replace("mystic", "мистическая");
    }
}