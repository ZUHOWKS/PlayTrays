import {Color} from "three";

//Dictionnaire permettant de link des cases à des types
export const cardHelper = {
    "40" : "chance",
    "07" : "chance",
    "02" : "chance",
    "210" : "chance",
    "810" : "chance",
    "103" : "chance",
    "106" : "chance",
    "20" : "bataille",
    "50" : "bataille",
    "05" : "bataille",
    "510" : "bataille",
    "105" : "bataille",
    "108" : "bataille",
    "00" : "start",
    "100" : "prison",
    "1010" : "bank",
    "010" : "war",
}

//Dictionnaire permettant de link des cases à des couleurs
export const cardColorHelper = {
    "10" : new Color(105,179,255),
    "30" : new Color(105,179,255),
    "60" : new Color(110,204,225),
    "80" : new Color(110,204,225),
    "90" : new Color(110,204,225),
    "101" : new Color(146,21,167),
    "103" : new Color(146,21,167),
    "104" : new Color(146,21,167),
    "106" : new Color(247,143,1),
    "108" : new Color(247,143,1),
    "109" : new Color(247,143,1),
    "910" : new Color(227,1,15),
    "710" : new Color(227,1,15),
    "610" : new Color(227,1,15),
    "410" : new Color(253,237,2),
    "310" : new Color(253,237,2),
    "110" : new Color(253,237,2),
    "09" : new Color(28,167,74),
    "08" : new Color(28,167,74),
    "06" : new Color(28,167,74),
    "03" : new Color(3,105,179),
    "01" : new Color(3,105,179)
}