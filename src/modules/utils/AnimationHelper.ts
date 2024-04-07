/**
 * Réaliser une requête d'animation sur une durée donnée.
 *
 * @param duration
 * @param animationCallback
 * @param finalCallback
 */
export function animate(duration:number, animationCallback: any, finalCallback?: any): number {
    let start: number | undefined = undefined;
    console.log("start animation")
    const step = (timestamp: number) => {

        if(!start) {
            start = timestamp;
        }

        const runtime = timestamp - start;
        const relativeProgress = runtime / duration;
        console.log(relativeProgress, runtime, timestamp)
        if (relativeProgress < 1) {
            animationCallback(relativeProgress);
            requestAnimationFrame(step);
        } else if (finalCallback) {
            finalCallback();
        }
    }

    return requestAnimationFrame(step);

}
