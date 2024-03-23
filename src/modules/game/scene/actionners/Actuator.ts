/**
 * Interface pour les actionneurs. Permet d'associer une action à un objet
 */
export default interface Actuator {
    name: string;
    subject: string;

    /**
     * Obtenir l'identifiant de l'actionneur
     *
     * @return string
     */
    getName(): string;

    /**
     * Obtenir l'identifiant de l'objet
     *
     * @return string
     */
    getSubject(): string;
}