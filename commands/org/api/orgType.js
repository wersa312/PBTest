class worker {
    constructor(obj) {
        this.name = obj.name;
        this.work = {
            string: obj.work.string,
            type: obj.work.type,
            pay: obj.work.pay,
            int_range: obj.work.int_range
        };
    }
}

module.exports = class OrgType {
    constructor(obj) {
        this.name = obj.name;
        this.emoji = obj.emoji;
        this.invest = obj.invest;
        /**
         * @type {worker[]}
         */
        this.workers = obj.workers;
    }
}