const { firstLetterToUpper } = require("../../../../api/utils");

module.exports = (role, firstLetter = false) => {
    let toReturn = "";
    switch (role) {
        case "don":
            toReturn = "дон мафии";
            break;
        case "mafia":
            toReturn = "мафия";
            break;
        case "doc":
            toReturn = "доктор";
            break;
        case "putana":
            toReturn = "путана";
            break;
        case "com":
            toReturn = "комиссар";
            break;
        default:
            toReturn = "мирный житель";
            break;
    }
    return (firstLetter ? firstLetterToUpper(toReturn) : toReturn);
}