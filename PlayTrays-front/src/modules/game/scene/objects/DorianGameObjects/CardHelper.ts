export interface cardTypeInterface{type : string,
        infocard : null | {
            "m0" : number,
            "m1" : number,
            "m2" : number,
            "m3" : number,
            "m4": number,
            "m5" : number,
            "m6" : number,
            maison : number,
            prix : number,
            nbMaison : number ,
            hypotheque : boolean,
            user: string,
            nameCity: string
    }
}
//Dictionnaire permettant de link des cases à des types
export const cardHelper = {
    "40" : "chance",
    "70" : "chance",
    "102" : "chance",
    "107" : "chance",
    "810" : "chance",
    "210" : "chance",
    "07" : "chance",
    "04" : "chance",
    "02" : "bataille",
    "20" : "bataille",
    "50" : "bataille",
    "05" : "bataille",
    "510" : "bataille",
    "105" : "bataille",
    "00" : "start",
    "100" : "prison",
    "1010" : "bank",
    "010" : "war",
}

//Dictionnaire permettant de link des cases à des couleurs
export const cardCityHelper = {
    "10" : {color : "#091157", cityName : "Grenoble", m0 : 200, m1 : 1000, m2 : 3000, m3 : 9000, m4 : 16000, m5 : 25000, m6 : 3000, maison : 5000, prix : 6000},
    "30" : {color : "#091157", cityName : "Toulon", m0 : 400, m1 : 2000, m2 : 6000, m3 : 18000, m4 : 32000, m5 : 45000, m6 : 3000, maison : 5000, prix : 6000},

    "60" : {color : "#6ecce1", cityName : "Berlin", m0 : 600, m1 : 3000, m2 : 9000, m3 : 27000, m4 : 40000, m5 : 55000, m6 : 5000, maison : 5000, prix : 10000},
    "80" : {color : "#6ecce1", cityName : "Munich", m0 : 600, m1 : 3000, m2 : 9000, m3 : 27000, m4 : 40000, m5 : 55000, m6 : 5000, maison : 5000, prix : 10000},
    "90" : {color : "#6ecce1", cityName : "Hambourg", m0 : 800, m1 : 4000, m2 : 10000, m3 : 30000, m4 : 45000, m5 : 60000, m6 : 6000, maison : 5000, prix : 12000},

    "101" : {color : "#9215a7", cityName : "Londre", m0 : 1000, m1 : 5000, m2 : 15000, m3 : 45000, m4 : 62500, m5 : 75000, m6 : 7000, maison : 10000, prix : 14000},
    "103" : {color : "#9215a7", cityName : "Liverpool", m0 : 1000, m1 : 5000, m2 : 15000, m3 : 45000, m4 : 62500, m5 : 75000, m6 : 7000, maison : 10000, prix : 14000},
    "104" : {color : "#9215a7", cityName : "Birmingham", m0 : 1200, m1 : 6000, m2 : 18000, m3 : 50000, m4 : 70000, m5 : 90000, m6 : 8000, maison : 10000, prix : 16000},

    "106" : {color : "#f78f01", cityName : "New Delhi", m0 : 1400, m1 : 7000, m2 : 20000, m3 : 55000, m4 : 75000, m5 : 95000, m6 : 9000, maison : 10000, prix : 18000},
    "108" : {color : "#f78f01", cityName : "Bangalore", m0 : 1400, m1 : 7000, m2 : 20000, m3 : 55000, m4 : 75000, m5 : 95000, m6 : 9000, maison : 10000, prix : 18000},
    "109" : {color : "#f78f01", cityName : "Hyderabad", m0 : 1600, m1 : 8000, m2 : 22000, m3 : 60000, m4 : 80000, m5 : 100000, m6 : 10000, maison : 10000, prix : 20000},

    "910" : {color : "#e3010f", cityName : "Shanghaï", m0 : 1800, m1 : 9000, m2 : 25000, m3 : 70000, m4 : 87500, m5 : 105000, m6 : 11000, maison : 15000, prix : 22000},
    "710" : {color : "#e3010f", cityName : "Pekin", m0 : 1800, m1 : 9000, m2 : 25000, m3 : 70000, m4 : 87500, m5 : 105000, m6 : 11000, maison : 15000, prix : 22000},
    "610" : {color : "#e3010f", cityName : "Hong Kong", m0 : 2000, m1 : 10000, m2 : 30000, m3 : 75000, m4 : 92000, m5 : 110000, m6 : 12000, maison : 15000, prix : 24000},

    "410" : {color : "#fded02", cityName : "São Paulo", m0 : 2200, m1 : 11000, m2 : 33000, m3 : 90000, m4 : 97500, m5 : 115000, m6 : 13000, maison : 15000, prix : 26000},
    "310" : {color : "#fded02", cityName : "Rio De Janeiro", m0 : 2200, m1 : 11000, m2 : 33000, m3 : 90000, m4 : 97500, m5 : 115000, m6 : 13000, maison : 15000, prix : 26000},
    "110" : {color : "#fded02", cityName : "Brasilia", m0 : 2400, m1 : 12000, m2 : 36000, m3 : 36000, m4 : 85000, m5 : 120000, m6 : 14000, maison : 15000, prix : 28000},

    "09" : {color : "#1ca74a", cityName : "New York", m0 : 2600, m1 : 13000, m2 : 39000, m3 : 90000, m4 : 110000, m5 : 127000, m6 : 15000, maison : 20000, prix : 30000},
    "08" : {color : "#1ca74a", cityName : "Detroit", m0 : 2600, m1 : 13000, m2 : 39000, m3 : 90000, m4 : 110000, m5 : 127000, m6 : 15000, maison : 20000, prix : 30000},
    "06" : {color : "#1ca74a", cityName : "Las Vegas", m0 : 2800, m1 : 15000, m2 : 45000, m3 : 100000, m4 : 120000, m5 : 140000, m6 : 16000, maison : 20000, prix : 32000},

    "03" : {color : "#0369b3", cityName : "Lyon", m0 : 3500, m1 : 17500, m2 : 50000, m3 : 110000, m4 : 130000, m5 : 150000, m6 : 17500, maison : 20000, prix : 35000},
    "01" : {color : "#0369b3", cityName : "Paris", m0 : 5000, m1 : 20000, m2 : 60000, m3 : 140000, m4 : 170000, m5 : 200000, m6 : 20000, maison : 20000, prix : 40000}
}