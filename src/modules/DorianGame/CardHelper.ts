export interface cardTypeInterface{
        type : string,
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

export const cardAllHelper = {

    "4" : {type: "chance", infoCard: null},
    "7" : {type: "chance", infoCard: null},
    "12" : {type: "chance", infoCard: null},
    "17" : {type: "chance", infoCard: null},
    "28" : {type: "chance", infoCard: null},
    "22" : {type: "chance", infoCard: null},
    "33" : {type: "chance", infoCard: null},
    "36" : {type: "chance", infoCard: null},

    "2" : {type: "bataille", infoCard: null},
    "5" : {type: "bataille", infoCard: null},
    "15" : {type: "bataille", infoCard: null},
    "25" : {type: "bataille", infoCard: null},
    "35" : {type: "bataille", infoCard: null},
    "38" : {type: "bataille", infoCard: null},

    "0" : {type: "start", infoCard: null},
    "10" : {type: "prison", infoCard: null},
    "20" : {type: "bank", infoCard: null},
    "30" : {type: "war", infoCard: null},

    "1" : {type: "ville", infoCard: {"m0" : 200, "m1" : 1000, "m2" : 3000, "m3" : 9000, "m4": 16000, "m5" : 25000, "m6" : 3000, maison : 5000, prix : 6000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Grenoble"}},
    "3" : {type: "ville", infoCard: {"m0" : 400, "m1" : 2000, "m2" : 6000, "m3" : 18000, "m4" : 32000, "m5" : 45000, "m6" : 3000, maison : 5000, prix : 6000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Toulon"}},

    "6" : {type: "ville", infoCard: {"m0" : 600, "m1" : 3000, "m2" : 9000, "m3" : 27000, "m4" : 40000, "m5" : 55000, "m6" : 5000, maison : 5000, prix : 10000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Berlin"}},
    "8" : {type: "ville", infoCard: {"m0" : 600, "m1" : 3000, "m2" : 9000, "m3" : 27000, "m4" : 40000, "m5" : 55000, "m6" : 5000, maison : 5000, prix : 10000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Munich"}},
    "9" : {type: "ville", infoCard: {"m0" : 800, "m1" : 4000, "m2" : 10000, "m3" : 30000, "m4" : 45000, "m5" : 60000, "m6" : 6000, maison : 5000, prix : 12000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Hambourg"}},

    "11" : {type: "ville", infoCard: {"m0" : 1000, "m1" : 5000, "m2" : 15000, "m3" : 45000, "m4" : 62500, "m5" : 75000, "m6" : 7000, maison : 10000, prix : 14000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Londres"}},
    "13" : {type: "ville", infoCard: {"m0" : 1000, "m1" : 5000, "m2" : 15000, "m3" : 45000, "m4" : 62500, "m5" : 75000, "m6" : 7000, maison : 10000, prix : 14000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Liverpool"}},
    "14" : {type: "ville", infoCard: {"m0" : 1200, "m1" : 6000, "m2" : 18000, "m3" : 50000, "m4" : 70000, "m5" : 90000, "m6" : 8000, maison : 10000, prix : 16000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Birmingham"}},

    "16" : {type: "ville", infoCard: {"m0" : 1400, "m1" : 7000, "m2" : 20000, "m3" : 55000, "m4" : 75000, "m5" : 95000, "m6" : 9000, maison : 10000, prix : 18000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "New Delhi"}},
    "18" : {type: "ville", infoCard: {"m0" : 1400, "m1" : 7000, "m2" : 20000, "m3" : 55000, "m4" : 75000, "m5" : 95000, "m6" : 9000, maison : 10000, prix : 18000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Bangalore"}},
    "19" : {type: "ville", infoCard: {"m0" : 1600, "m1" : 8000, "m2" : 22000, "m3" : 60000, "m4" : 80000, "m5" : 100000, "m6" : 10000, maison : 10000, prix : 20000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Hyderabad"}},

    "21" : {type: "ville", infoCard: {"m0" : 1800, "m1" : 9000, "m2" : 25000, "m3" : 70000, "m4" : 87500, "m5" : 105000, "m6": 11000, maison : 15000, prix : 22000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Shanghaï"}},
    "23" : {type: "ville", infoCard: {"m0" : 1800, "m1" : 9000, "m2" : 25000, "m3" : 70000, "m4" : 87500, "m5" : 105000, "m6" : 11000, maison : 15000, prix : 22000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Pekin"}},
    "24" : {type: "ville", infoCard: {"m0" : 2000, "m1" : 10000, "m2" : 30000, "m3" : 75000, "m4" : 92000, "m5" : 110000, "m6" : 12000, maison : 15000, prix : 24000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Hong Kong"}},

    "26" : {type: "ville", infoCard: {"m0" : 2200, "m1" : 11000, "m2" : 33000, "m3" : 90000, "m4" : 97500, "m5" : 115000, "m6" : 13000, maison : 15000, prix : 26000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "São Paulo"}},
    "27" : {type: "ville", infoCard: {"m0" : 2200, "m1" : 11000, "m2" : 33000, "m3" : 90000, "m4" : 97500, "m5" : 115000, "m6" : 13000, maison : 15000, prix : 26000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Rio De Janeiro"}},
    "29" : {type: "ville", infoCard: {"m0" : 2400, "m1" : 12000, "m2" : 36000, "m3" : 36000, "m4" : 85000, "m5" : 120000, "m6" : 14000, maison : 15000, prix : 28000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Brasilia"}},

    "31" : {type: "ville", infoCard: {"m0" : 2600, "m1" : 13000, "m2" : 39000, "m3" : 90000, "m4" : 110000, "m5" : 127000, "m6" : 15000, maison : 20000, prix : 30000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "New York"}},
    "32" : {type: "ville", infoCard: {"m0" : 2600, "m1" : 13000, "m2" : 39000, "m3" : 90000, "m4" : 110000, "m5" : 127000, "m6" : 15000, maison : 20000, prix : 30000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Detroit"}},
    "34" : {type: "ville", infoCard: {"m0" : 2800, "m1" : 15000, "m2" : 45000, "m3" : 100000, "m4" : 120000, "m5" : 140000, "m6" : 16000, maison : 20000, prix : 32000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Las Vegas"}},

    "37" : {type: "ville", infoCard: {"m0" : 3500, "m1" : 17500, "m2" : 50000, "m3" : 110000, "m4" : 130000, "m5" : 150000, "m6" : 17500, maison : 20000, prix : 35000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Lyon"}},
    "39" : {type: "ville", infoCard: {"m0" : 5000, "m1" : 20000, "m2" : 60000, "m3" : 140000, "m4" : 170000, "m5" : 200000, "m6" : 20000, maison : 20000, prix : 40000, nbMaison : 0 , hypotheque : false, user: "noUser", nameCity: "Paris"}},
}
