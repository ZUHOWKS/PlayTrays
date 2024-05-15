import {Card} from "./Card";
import {TownInfo} from "./TownInfo";

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

}