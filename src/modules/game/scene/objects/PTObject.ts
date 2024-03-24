import type {Object3D} from "three";

export default abstract class PTObject {
    name: string;
    object3D: Object3D;

    /**
     * Représente les objets de la scène et associe un objet 3D de la scène
     * à un identifiant (nom de l'objet).
     *
     * @param name identifiant de l'objet
     * @param object3D objet 3D de la scène
     * @protected
     */
    protected constructor(name: string, object3D: Object3D) {
        this.name = name;
        this.object3D = object3D;
        this.object3D.name = name;
    }

    /**
     * Obtenir l'identifiant
     *
     * @return string
     */
    getName(): string {
        return this.name;
    }

    /**
     * Obtenir l'objet 3D
     *
     * @return Object3D
     */
    getObject3D(): Object3D {
        return this.object3D;
    }

    /**
     * Déplacer l'objet 3D à une certaine position dans l'espace cartésien de la scène
     *
     * @param x
     * @param y
     * @param z
     */
    abstract moveTo(x: number, y:number, z:number): void;

    /**
     * Effectuer une rotation de l'objet 3D autour des axes de l'espace cartésien de la scène
     *
     * @param x
     * @param y
     * @param z
     */
    abstract rotate(x: number, y:number, z:number): void;

    /**
     * Ajouter un effet de sélection à l'objet 3D
     */
    abstract select(): void;

    /**
     * Retirer l'effet de sélection à l'objet 3D
     */
    abstract unselect(): void;
}