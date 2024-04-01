

export default class Pawn {
    name: string;
    x: number;
    y: number;
    z: number;
    dead: boolean = false;
    queen: boolean = false;


    constructor(name: string, x: number, y: number, z: number) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.z = z;
    }
}