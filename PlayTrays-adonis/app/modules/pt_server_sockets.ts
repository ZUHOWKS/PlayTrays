import {Socket} from "socket.io-client";

/**
 * SINGLETON CLASS
 *
 * Accéder et gérer les sockets connectés aux serveurs jeu.
 */
export default class PTServerSockets {
  private static instance: PTServerSockets | undefined;
  sockets: Map<number, Socket> = new Map<number, Socket>();


  /**
   * Singleton's constructor!
   */
  private constructor() { }

  /**
   * Obtenir l'instance du singleton
   */
  public static getInstance(): PTServerSockets {
    if (!PTServerSockets.instance) {
      PTServerSockets.instance = new PTServerSockets();
    }

    return PTServerSockets.instance;
  }

  /**
   * Enregistrer un socket
   *
   * @param id id du server jeu en DB
   * @param socket websocket connecté au serveur jeu
   */
  public registerSocket(id: number, socket: Socket) {
    this.sockets.get(id)?.disconnect();
    this.sockets.set(id, socket)
  }
}
