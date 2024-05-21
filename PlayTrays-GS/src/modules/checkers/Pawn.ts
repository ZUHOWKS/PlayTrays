import {Vec3} from "../utils/Vectors";


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

    /**
     * Remplace la position actuelle par la nouvelle position passée en paramètre
     *
     * @param pos vecteur à 3 coordonnées
     */
    setPosition(pos: Vec3) {
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;

        // deviens reine quand il atteint le quand ennemi
        if (!this.queen && this.z == 21 * (this.name.includes("white") ? 1 : -1)) {
            this.queen = true;
        }
    }
}