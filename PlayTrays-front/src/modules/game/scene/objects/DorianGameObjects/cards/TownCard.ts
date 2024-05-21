
import type {TownInfo} from "@/modules/game/scene/objects/DorianGameObjects/cards/TownInfo";
import {Card} from "@/modules/game/scene/objects/DorianGameObjects/cards/Card";


export class TownCard extends Card {

    user: string | undefined;
    hypotheque: boolean = false;
    name: string;
    info: TownInfo;
    nbMaison: number = 0;


    public constructor(caseNb: number, name: string, info: TownInfo) {
        super(caseNb, "ville");
        this.name = name;
        this.info = info;
    }

    public isHypotheque(): boolean {
        return this.hypotheque
    }

    public getPassagePrice(): number{
        let price: number = 0
        if (!this.isHypotheque()){
            if (this.nbMaison == 0) price = this.info.m0;
            if (this.nbMaison == 1) price = this.info.m1;
            if (this.nbMaison == 2) price = this.info.m2;
            if (this.nbMaison == 3) price = this.info.m3;
            if (this.nbMaison == 4) price = this.info.m4;
            if (this.nbMaison == 5) price = this.info.m5;
        }
        return price
    }

}