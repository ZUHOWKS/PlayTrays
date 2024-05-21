"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardConfig = void 0;
exports.cardConfig = {
    chances: [4, 7, 12, 17, 28, 22, 33, 36],
    batailles: [2, 5, 15, 25, 35, 38],
    start: 0,
    prison: 10,
    bank: 20,
    war: 30,
    villes: [
        { caseNb: 1, user: undefined, nameCity: "Grenoble", infoCard: { m0: 200, m1: 1000, m2: 3000, m3: 9000, m4: 16000, m5: 25000, m6: 3000, maison: 5000, prix: 6000, color: "#091157" } },
        { caseNb: 3, user: undefined, nameCity: "Toulon", infoCard: { m0: 400, m1: 2000, m2: 6000, m3: 18000, m4: 32000, m5: 45000, m6: 3000, maison: 5000, prix: 6000, color: "#091157" } },
        { caseNb: 6, user: undefined, nameCity: "Berlin", infoCard: { m0: 600, m1: 3000, m2: 9000, m3: 27000, m4: 40000, m5: 55000, m6: 5000, maison: 5000, prix: 10000, color: "#6ecce1" } },
        { caseNb: 8, user: undefined, nameCity: "Munich", infoCard: { m0: 600, m1: 3000, m2: 9000, m3: 27000, m4: 40000, m5: 55000, m6: 5000, maison: 5000, prix: 10000, color: "#6ecce1" } },
        { caseNb: 9, user: undefined, nameCity: "Hambourg", infoCard: { m0: 800, m1: 4000, m2: 10000, m3: 30000, m4: 45000, m5: 60000, m6: 6000, maison: 5000, prix: 12000, color: "#6ecce1" } },
        { caseNb: 11, user: undefined, nameCity: "Londres", infoCard: { m0: 1000, m1: 5000, m2: 15000, m3: 45000, m4: 62500, m5: 75000, m6: 7000, maison: 10000, prix: 14000, color: "#9215a7" } },
        { caseNb: 13, user: undefined, nameCity: "Liverpool", infoCard: { m0: 1000, m1: 5000, m2: 15000, m3: 45000, m4: 62500, m5: 75000, m6: 7000, maison: 10000, prix: 14000, color: "#9215a7" } },
        { caseNb: 14, user: undefined, nameCity: "Birmingham", infoCard: { m0: 1200, m1: 6000, m2: 18000, m3: 50000, m4: 70000, m5: 90000, m6: 8000, maison: 10000, prix: 16000, color: "#9215a7" } },
        { caseNb: 16, user: undefined, nameCity: "New Delhi", infoCard: { m0: 1400, m1: 7000, m2: 20000, m3: 55000, m4: 75000, m5: 95000, m6: 9000, maison: 10000, prix: 18000, color: "#f78f01" } },
        { caseNb: 18, user: undefined, nameCity: "Bangalore", infoCard: { m0: 1400, m1: 7000, m2: 20000, m3: 55000, m4: 75000, m5: 95000, m6: 9000, maison: 10000, prix: 18000, color: "#f78f01" } },
        { caseNb: 19, user: undefined, nameCity: "Hyderabad", infoCard: { m0: 1600, m1: 8000, m2: 22000, m3: 60000, m4: 80000, m5: 100000, m6: 10000, maison: 10000, prix: 20000, color: "#f78f01" } },
        { caseNb: 21, user: undefined, nameCity: "Shanghaï", infoCard: { m0: 1800, m1: 9000, m2: 25000, m3: 70000, m4: 87500, m5: 105000, m6: 11000, maison: 15000, prix: 22000, color: "#e3010f" } },
        { caseNb: 23, user: undefined, nameCity: "Pekin", infoCard: { m0: 1800, m1: 9000, m2: 25000, m3: 70000, m4: 87500, m5: 105000, m6: 11000, maison: 15000, prix: 22000, color: "#e3010f" } },
        { caseNb: 24, user: undefined, nameCity: "Hong Kong", infoCard: { m0: 2000, m1: 10000, m2: 30000, m3: 75000, m4: 92000, m5: 110000, m6: 12000, maison: 15000, prix: 24000, color: "#e3010f" } },
        { caseNb: 26, user: undefined, nameCity: "São Paulo", infoCard: { m0: 2200, m1: 11000, m2: 33000, m3: 90000, m4: 97500, m5: 115000, m6: 13000, maison: 15000, prix: 26000, color: "#fded02" } },
        { caseNb: 27, user: undefined, nameCity: "Rio De Janeiro", infoCard: { m0: 2200, m1: 11000, m2: 33000, m3: 90000, m4: 97500, m5: 115000, m6: 13000, maison: 15000, prix: 26000, color: "#fded02" } },
        { caseNb: 29, user: undefined, nameCity: "Brasilia", infoCard: { m0: 2400, m1: 12000, m2: 36000, m3: 36000, m4: 85000, m5: 120000, m6: 14000, maison: 15000, prix: 28000, color: "#fded02" } },
        { caseNb: 31, user: undefined, nameCity: "New York", infoCard: { m0: 2600, m1: 13000, m2: 39000, m3: 90000, m4: 110000, m5: 127000, m6: 15000, maison: 20000, prix: 30000, color: "#1ca74a" } },
        { caseNb: 32, user: undefined, nameCity: "Detroit", infoCard: { m0: 2600, m1: 13000, m2: 39000, m3: 90000, m4: 110000, m5: 127000, m6: 15000, maison: 20000, prix: 30000, color: "#1ca74a" } },
        { caseNb: 34, user: undefined, nameCity: "Las Vegas", infoCard: { m0: 2800, m1: 15000, m2: 45000, m3: 100000, m4: 120000, m5: 140000, m6: 16000, maison: 20000, prix: 32000, color: "#1ca74a" } },
        { caseNb: 37, user: undefined, nameCity: "Lyon", infoCard: { m0: 3500, m1: 17500, m2: 50000, m3: 110000, m4: 130000, m5: 150000, m6: 17500, maison: 20000, prix: 35000, color: "#0369b3" } },
        { caseNb: 39, user: undefined, nameCity: "Paris", infoCard: { m0: 5000, m1: 20000, m2: 60000, m3: 140000, m4: 170000, m5: 200000, m6: 20000, maison: 20000, prix: 40000, color: "#0369b3" } }
    ],
};
