import {Card} from "./Card";
import {TownPrices} from "./TownPrices";

export class TownCard extends Card {

    user: string | undefined;
    hypotheque: boolean = false;
    name: string;
    info: TownPrices;
    nbMaison: number = 0;


    public constructor(caseNb: number, name: string, info: TownPrices) {
        super(caseNb, "ville");
        this.name = name;
        this.info = info;
    }

    public isHypotheque(): boolean {
        return this.hypotheque
    }

}