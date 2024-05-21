import PTObject from "@/modules/game/scene/objects/PTObject";
import {BoxGeometry, Mesh, MeshBasicMaterial, type Object3D, Vector3} from "three";
import {AnimationQueue, type AnimationQueueInterface} from "@/modules/utils/AnimationQueue";


export class playerPawn extends PTObject implements AnimationQueueInterface {
    animationQueue: AnimationQueue;
    case : {casePawnX : number ,casePawnY : number}
    positionTest : Vector3 = new Vector3(0, 0, 0);
    user: string;
    money: number;


    constructor(name: string, object3D: Object3D, user : string, money: number) {
        super(name, object3D);
        this.animationQueue = new AnimationQueue();
        this.user = user;
        this.money = money;

        /*
        Voici comment sont comptées les cases du plateau:

          10 B  B  B  B  B  B  B  B  B  B  B
          9  B                             B
          8  B                             B
          7  B                             B
          6  B                             B
          5  B                             B
          4  B                             B
          3  B                             B
          2  B                             B
          1  B                             B
          0  B  B  B  B  B  B  B  B  B  B  B
             0  1  2  3  4  5  6  7  8  9  10

        Avec chacunes de ces cases ayant un nbCase (commence à 0 et augemente dans le sens des aiguilles d'un montre sur la plateau)

         */
        this.case = {casePawnX : 0 ,casePawnY : 0}
    }

    // Permet d'avancer jusque la case choisie
    moveTo(caseX : number, caseY : number): void {
        //Gere la cas ou la case demandée est la même que celle ou est le pion
        if (this.case.casePawnX == caseX && this.case.casePawnY == caseY) {this.moveCase();}

        //Avance d'une case jusqu'à être à celle demandée
        while (this.case.casePawnX != caseX || this.case.casePawnY != caseY) {
            this.moveCase();
        }
    }

    rotate(x: number, y: number, z: number): void {
    }

    //Affiche le hud du user contenu dans le pion
    select(): void {
        const userElem = (document.querySelector('#other-user') as HTMLElement);
        userElem.style.transform = 'translateX(0)';
        (userElem.querySelector('.username') as HTMLElement).innerHTML = this.user;
        (document.getElementsByClassName("other-money")[0] as HTMLElement).innerText = ""+this.money;
    }

    unselect(): void {
        const userElem = (document.querySelector('#other-user') as HTMLElement);
        userElem.style.transform = 'translateX(150%)';
    }

    //Avance jusque la case suivante de l'objet
    moveCase(anim: boolean = true) : void {
        //Initialisation de constantes utiles
        const GRANDSAUT : number = 2.325;
        const PETITSAUT : number = 1.795;
        const vectDepart: Vector3 = this.positionTest.clone();
        const position: Vector3 = this.object3D.position;
        const dir = ((this.case.casePawnX > 0 && this.case.casePawnY == 10) || (this.case.casePawnX == 0 && this.case.casePawnY > 0)) ? 1 : -1;

        //Definis la direction et la longueur du saut en fonction de la position sur le plateau
        const saut = ((this.case.casePawnX == 0 && this.case.casePawnY == 0) || (this.case.casePawnX == 9 && this.case.casePawnY == 0) || (this.case.casePawnX == 10 && this.case.casePawnY == 0) || (this.case.casePawnX == 10 && this.case.casePawnY == 9) || (this.case.casePawnX == 10 && this.case.casePawnY == 10) || (this.case.casePawnX == 1 && this.case.casePawnY == 10) || (this.case.casePawnX == 0 && this.case.casePawnY == 10) || (this.case.casePawnX == 0 && this.case.casePawnY == 1)
        ) ? GRANDSAUT * dir : PETITSAUT * dir;

        //Definis les valeurs d'arrivée en X et Z
        const tempX: number = ((this.case.casePawnX > 0 && this.case.casePawnY == 10) || (this.case.casePawnX < 10 && this.case.casePawnY == 0)) ? vectDepart.x + saut : vectDepart.x;
        const tempZ: number = ((this.case.casePawnX == 10 && this.case.casePawnY < 10) || (this.case.casePawnX == 0 && this.case.casePawnY > 0)) ? vectDepart.z + saut : vectDepart.z;

        const vectArrivee: Vector3 = new Vector3(tempX, 0, tempZ);
        const movVec: Vector3 = new Vector3((vectArrivee.x - vectDepart.x), 0, vectArrivee.z - vectDepart.z);

        //Modifie la position du pion
        if (this.case.casePawnX < 10 && this.case.casePawnY == 0) {this.case.casePawnX += 1;}
        else if (this.case.casePawnX == 10 && this.case.casePawnY < 10) {this.case.casePawnY += 1;}
        else if (this.case.casePawnX > 0 && this.case.casePawnY == 10) {this.case.casePawnX -= 1;}
        else if (this.case.casePawnX == 0 && this.case.casePawnY > 0) {this.case.casePawnY -= 1;}
        this.positionTest.x = vectArrivee.x;
        this.positionTest.y = vectArrivee.y;
        this.positionTest.z = vectArrivee.z;

        //Si on souhaite afficher le pion bouger
        if (anim){
        this.animationQueue.push({
            duration: 100,
            startCallback: (): void => {
                },
            animationCallback: (progress: number): void => {
                position.x = vectDepart.x + movVec.x * progress;
                position.y = vectDepart.y + movVec.y * progress;
                position.z = vectDepart.z + movVec.z * progress;
                },
            finalCallback: (): void => {
                position.x = vectArrivee.x;
                position.y = vectArrivee.y;
                position.z = vectArrivee.z;
                }
            })
        }
        else{
            position.x = vectArrivee.x;
            position.y = vectArrivee.y;
            position.z = vectArrivee.z;
        }
    }
}