

export default class Pawn {
    name: string;
    x: number;
    y: number;
    dead: boolean = false;


    constructor(name: string, x: number, y: number) {
        this.name = name;
        this.x = x;
        this.y = y;
    }
}