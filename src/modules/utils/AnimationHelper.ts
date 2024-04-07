/**
 * Réaliser une requête d'animation sur une durée donnée.
 *
 * @param duration
 * @param animationCallback
 * @param finalCallback
 * @deprecated Préférable de gérer les animations via la file d'exécution AnimationQueue
 */
export function animate(duration:number, animationCallback: any, finalCallback?: any): number {
    let start: number | undefined = undefined;

    const step = (timestamp: number) => {

        if(!start) {
            start = timestamp;
        }

        const runtime = timestamp - start;
        const relativeProgress = runtime / duration;

        if (relativeProgress < 1) {
            animationCallback(relativeProgress);
            requestAnimationFrame(step);
        } else if (finalCallback) {
            finalCallback();
        }
    }

    return requestAnimationFrame(step);
}
