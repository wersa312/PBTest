function autoCase() {
    let rand = Math.floor(Math.random() * 100);
    let r = Math.floor(Math.random() * 100);
    let rs = Math.floor(Math.random() * 2000);
    let p = 0;
    if (r <= 10) p = 0;
    if (r <= 30) p = 100;
    if (r <= 60) p = 600;
    if (r <= 90) p = 100;
    if (rand <= 1) {
        let cs = [{
            brand: "Tesla",
            model: "Roadster",
            max: 400,
            prob: p,
            class: "sportcar",
            acc: 1.9,
            weight: 1950,
            rare: "legendary"
        },
        {
            brand: "Koenigsegg",
            model: "Agera R",
            max: 418,
            prob: p,
            class: "hypercar",
            acc: 2.9,
            weight: 1290,
            rare: "legendary"
        },
        {
            brand: "Bugatti",
            model: "Veyron Super Sport",
            max: 431,
            prob: p,
            class: "hypercar",
            acc: 2.5,
            weight: 1838,
            rare: "legendary"
        },
        {
            brand: "Hennessey",
            model: "Venom GT",
            max: 442,
            prob: p,
            class: "hypercar",
            acc: 2.5,
            weight: 1244,
            rare: "legendary"
        },
        {
            brand: "Koenigsegg",
            model: "One: 1",
            max: 450,
            prob: p,
            class: "hypercar",
            acc: 2.4,
            weight: 1341,
            rare: "legendary"
        },
        ];
        let carr = cs[Math.floor(Math.random() * cs.length)];
        if (rs == 1) {
            carr.rare = "mystic";
            carr.max = carr.max + 100;
        }
        return carr;
    } else if (rand <= 10) {
        let cs = [{
            brand: "Bugatti",
            model: "Veyron 16.4",
            max: 407,
            prob: p,
            class: "hypercar",
            acc: 2.5,
            weight: 1888,
            rare: "epic"
        },
        {
            brand: "Lamborghini",
            model: "Aventador J",
            max: 350,
            prob: p,
            class: "supercar",
            acc: 3.1,
            weight: 1575,
            rare: "epic"
        },
        {
            brand: "Lamborghini",
            model: "Aventador LP 750 SuperVeloce",
            max: 350,
            prob: p,
            class: "supercar",
            acc: 2.8,
            weight: 1575,
            rare: "epic"
        },
        {
            brand: "SSC",
            model: "Ultimate Aero",
            max: 411,
            prob: p,
            class: "supercar",
            acc: 2.7,
            weight: 1237,
            rare: "epic"
        },
        {
            brand: "SSC",
            model: "Ultimate Aero",
            max: 411,
            prob: p,
            class: "supercar",
            acc: 2.7,
            weight: 1237,
            rare: "epic"
        },
        ];
        let carr = cs[Math.floor(Math.random() * cs.length)];
        if (rs == 1) {
            carr.rare = "mystic";
            carr.max = carr.max + 100;
        }
        return carr;
    } else if (rand <= 25) {
        let cs = [{
            brand: "Aston Martin",
            model: "DB9",
            max: 306,
            prob: p,
            class: "Gran Turismо",
            acc: 4.6,
            weight: 1990,
            rare: "rare"
        },
        {
            brand: "Aston Martin",
            model: "Rapide S",
            max: 303,
            prob: p,
            class: "Gran Turismо",
            acc: 5.3,
            weight: 1950,
            rare: "rare"
        },
        {
            brand: "Lamborghini",
            model: "Huracan LP",
            max: 325,
            prob: p,
            class: "hypercar",
            acc: 3.1,
            weight: 1509,
            rare: "rare"
        },
        {
            brand: "Tesla",
            model: "Ludicrous",
            max: 250,
            prob: p,
            class: "Gran Turismо",
            acc: 2.4,
            weight: 2250,
            rare: "rare"
        },
        {
            brand: "Ferrari",
            model: "LaFerrari",
            max: 330,
            prob: p,
            class: "supercar",
            acc: 2.4,
            weight: 1255,
            rare: "rare"
        },
        ];
        let carr = cs[Math.floor(Math.random() * cs.length)];
        if (rs == 1) carr.rare = "mystic";
        return carr;
    } else if (rand <= 40) {
        let cs = [{
            brand: "BMW",
            model: "i8",
            max: 250,
            prob: p,
            class: "Gran Turismо",
            acc: 4.4,
            weight: 1855,
            rare: "common"
        },
        {
            brand: "BMW",
            model: "M5 F10",
            max: 250,
            prob: p,
            class: "sportcar",
            acc: 4.4,
            weight: 1945,
            rare: "common"
        },
        {
            brand: "Mercedes-Benz",
            model: "E63 AMG S-Model",
            max: 250,
            prob: p,
            class: "sportcar",
            acc: 3.6,
            weight: 1838,
            rare: "common"
        },
        {
            brand: "BMW",
            model: "X6 Hybrid",
            max: 260,
            prob: p,
            class: "sportcar",
            acc: 5.6,
            weight: 2500,
            rare: "common"
        },
        {
            brand: "Mercedes-Benz",
            model: "G 65 AMG",
            max: 230,
            prob: p,
            class: "Off-road",
            acc: 5.3,
            weight: 1341,
            rare: "common"
        },
        ];
        let carr = cs[Math.floor(Math.random() * cs.length)];
        if (rs == 1) {
            carr.rare = "mystic";
            carr.max = carr.max + 100;
        }
        return carr;
    }
    let cs = [{
        brand: "LADA",
        model: "Granta",
        max: 177,
        prob: p,
        class: "sedan",
        acc: 12.4,
        weight: 1515,
        rare: "vedro"
    },
    {
        brand: "LADA",
        model: "Priora",
        max: 170,
        prob: p,
        class: "sedan",
        acc: 10.5,
        weight: 1670,
        rare: "vedro"
    },
    {
        brand: "АвтоВАЗ",
        model: "ВАЗ-2109",
        max: 155,
        prob: p,
        class: "hatchback",
        acc: 13,
        weight: 945,
        rare: "vedro"
    },
    {
        brand: "Volkswagen",
        model: "Golf III",
        max: 193,
        prob: p,
        class: "hatchback",
        acc: 10.4,
        weight: 1075,
        rare: "vedro"
    },
    {
        brand: "Audi",
        model: "80",
        max: 189,
        prob: p,
        class: "sedan",
        acc: 9.6,
        weight: 835,
        rare: "vedro"
    },
    ];
    let carr = cs[Math.floor(Math.random() * cs.length)];
    if (rs == 1) {
        carr.rare = "mystic";
        carr.max = carr.max + 100;
    }
    return carr;
}

exports.car = autoCase;

exports.classToString = (c_cclass) => {
    if (c_cclass == "sedan") return "седан";
    if (c_cclass == "hatchback") return "хэтчбэк";
    if (c_cclass == "Off-road") return "Внедорожник";
    if (c_cclass == "sportcar") return "Спорткар";
    if (c_cclass == "Gran Turismо") return "Gran Turismo";
    if (c_cclass == "hypercar") return "гиперкар";
    return c_cclass;
}