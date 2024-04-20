/**
 * Structure de donnée d'une animation
 */
export interface Animation {
    duration:number;
    startCallback: any;
    animationCallback: any;
    finalCallback?: any;
}

/**
 * Permet de créer une file d'animation utilisant l'API Web requestAnimationFrame.
 * On est ainsi capable d'associer une file d'exécution d'animation successive par frame,
 *
 */
export class AnimationQueue {
    queue: Animation[]; // file, l'animation à l'index 0 est la prochaine.
    currentAnimationFrame: number | undefined; // id de la requête d'animation courante

    constructor() {
        this.queue = [];
    }


    /**
     * Ajoute dans la file l'animation donnée.
     * L'élément à l'index 0, this.queue[0], est toujours l'animation à suivre.
     *
     * @param animation Animation
     */
    push(animation: Animation) {
        this.queue.push(animation)
        console.log("Nombre d'animation => ", this.queue.length);
        if (!this.currentAnimationFrame) {
            console.log("Passe à la next", this.queue.length);
            this.next();
        }
    }

    /**
     * Permet d'obtenir la fonction exécutant l'animation et celle qui suive dans la file.
     *
     * @param duration durée de l'animation
     * @param startCallback fonction exécutée au commencement de l'animation
     * @param animationCallback fonction exécutée au cours de l'animation
     * @param finalCallback fonction exécutée en fin d'animation
     * @return une fonction prenant en paramètre l'horodatage en milliseconde, exécutant
     * l'animation et celle qui suive dans la file s'il y en a.
     * @private
     */
    private getAnimate(duration:number, startCallback: any, animationCallback: any, finalCallback?: any): ((timestamp: number) => void) {
        let start: number | undefined = undefined;
        startCallback();
        const step = (timestamp: number) => {

            if(!start) {
                start = timestamp;
            }

            const runtime = timestamp - start;
            const relativeProgress = runtime / duration;
            if (relativeProgress < 1) {
                animationCallback(relativeProgress);
                this.currentAnimationFrame = requestAnimationFrame(step);
            } else {
                if (finalCallback) finalCallback();
                this.next();
            }
        }

        return step;
    }

    /**
     * Passer à la prochaine animation (qui est à l'index 0).
     *
     * @private
     */
    private next() {
        if (this.queue.length > 0) {
            const animation = this.queue[0];
            this.currentAnimationFrame = requestAnimationFrame(this.getAnimate(animation.duration, animation.startCallback, animation.animationCallback, animation.finalCallback));
            this.queue.shift(); // retire le premier élément de la file
        } else {
            this.currentAnimationFrame = undefined;
        }
    }

    /**
     * Supprime toutes les animations dans la file.
     */
    clear() {
        this.queue = [];
    }

    /**
     * Annule l'animation en cours et exécute la suivante.
     */
    cancel() {
        if (this.currentAnimationFrame) cancelAnimationFrame(this.currentAnimationFrame);
        this.next();
    }
}

/**
 * Implémenter une file d'animation
 */
export interface AnimationQueueInterface {
    animationQueue: AnimationQueue;
}