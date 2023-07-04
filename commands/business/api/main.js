module.exports = {
    info(obj) {
        let items = obj.items != null ? obj.items : obj.fuel;
        return {
            items: items,
            money: get
        };
    },
    updateBis(obj, haveBoost) {
        if (!obj.tax) obj.tax = 0;
        if (!obj.money) obj.money = 0;

        let items = obj.items != null ? 'items' : 'fuel';
        let hours = Math.floor((Date.now() - obj.time) / 60 / 60 / 1000);
        let itemLimit = Math.floor(obj[items] / 5);
        if (hours > itemLimit) hours = itemLimit;
        if (!itemLimit) obj.time = +new Date();
        if (hours < 1) return;
        let profit = hours * 1000000 * obj.count;
        if (haveBoost) profit = profit * 2;
        let profitLimit = profit;
        if (profit * 0.13 > 1e6) profitLimit = Math.floor(profit - (profit * 0.13 - 1e6) / 0.13);
        if (profitLimit < profit) profit = profitLimit;
        obj.tax += profit * 0.13;
        obj[items] -= hours * 5;
        obj.money += profit;
        if (profit > 0) obj.time = +new Date();
        return;
    }
}