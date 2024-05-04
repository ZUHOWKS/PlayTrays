import { Server } from 'socket.io'

import server from '@adonisjs/core/services/server'
import {Socket} from "socket.io";
import User from "#models/user";
import {AccessToken} from "@adonisjs/auth/access_tokens";
import {randomUUID} from "node:crypto";
import db from "@adonisjs/lucid/services/db";
import PTServer from "#models/pt_server";
import Lobby from "#models/lobby";
import Group from "#models/group";

interface AuthUserData {
  user: number;
  token: string;
}

class AdonisWS {
  io: Server | undefined
  private booted = false

  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (!this.booted || !this.io) {
      this.booted = true
      this.io = new Server(server.getNodeServer(), {
        cors: {
          origin: '*',
        },
      })
    }

    return this.io
  }

  /**
   * Initialiser les événements du socket.
   */
  public initSocketEvents() {
    this.io?.use(async (socket, next) => await this.authMiddleware(socket, next))
    this.io?.on('connect', (socket) => {

      /*
      * Évènement émis par l'utilisateur pour lancer un matchmaking
      *
      * Permet à un utilisateur seul ou groupé de rentrer dans la procédure de
      * matchmaking.
      */
      socket.on('matchmaking', async (game: string, callback: any) => {

        // get l'id du group de l'utilisateur
        let group: Group | null = await socket.data.user.getGroup()
        // si le joueur n'est pas leader du groupe >> cancel le matchmaking

        console.log(group?.leader_id, socket.data.user.id)
        if (group && group.leader_id != socket.data.user.id) return callback('You are not the leader of the group', undefined)

        // on obtient la liste des utilisateurs à matcher
        const users: User[] = []
        if (group?.id) (await group.getUsers()).forEach((user) => users.push(user))
        else users.push((socket.data.user as User))

        // on vérifie si le jeu à lancer existe et si le groupe ne dépasse pas le nombre de joueurs requis pour ce même jeu
        const resGame = await db.from('games').select('game', 'max_player as max').where('game', game).first()
        if (resGame?.game && resGame.max >= users.length) {
          callback(undefined, {message: 'Searching a party...'})
          if (group?.id) this.io?.to('g' + group.id).emit('matchmaking_init', {message: "Searching a party...", leader_id: group.leader_id})

          // si le groupe rempli au max un lobby vide >> création d'un lobby privé
          if (resGame.max == users.length) {
            this.setupLobbyOnServer(resGame.game, "private", users)
              .then((lobbyUuid) => {
                this.notifySetupLobby(lobbyUuid, socket, group);
              })

          } else { // si non on recherche un lobby à compléter

            // requête pour obtenir le premier lobby ayant un nombre de place suffisant
            const lobbyFound = await Lobby.query()
              .select('lobbies.uuid')
              .leftJoin('user_lobbies', 'lobbies.uuid', 'user_lobbies.lobby_uuid')
              .select(db.raw('IFNULL(COUNT(user_lobbies.user_id), 0) AS available'))
              .where('lobbies.game', resGame.game)
              .andWhere('lobbies.statut', 'waiting')
              .andWhere('lobbies.visibility', 'public')
              .groupBy('lobbies.uuid')
              .orderBy('available',"desc")
              .havingRaw('? <= (? - COUNT(user_lobbies.user_id))', [users.length, resGame.max as number])
              .first()

            if (lobbyFound?.uuid) { // lobby trouvé

              // on fait rejoindre le lobby
              const lobby: Lobby | null = await Lobby.find(lobbyFound.uuid)
              if (lobby) {

                // ajoute l'utilisateur leader du matchmaking à la room du lobby
                socket.join('l' + lobby.uuid)

                // on fait rejoindre les joueurs
                lobby.joinAllGrouped(users).then(async () => {

                  // si le lobby est prêt (plein) >> lancement de la partie
                  if (await lobby.isReady()) lobby.lauch()
                  else this.io?.to('l' + lobby.uuid).emit('matchmaking_info', {
                    message: "Lobby found ! Searching players..."
                  })
                });
              }

            } else { // aucun lobby à compléter
              this.setupLobbyOnServer(game, "public", users)
                .then((lobbyUuid) => {
                  this.notifySetupLobby(lobbyUuid, socket, group);
                })
            }
          }

        } else if (resGame?.game) { // lorsque le groupe est trop nombreux
          callback('You are too much', undefined)
        } else {
          callback('Unavailable game! Try an another mod', undefined)
        }
      })

      // Join the lobby room
      // !IMPORTANT! permet à tous les joueurs de recevoir la confirmation de matchmaking
      socket.on('lobby_join_room', () => {
        (socket.data.user as User).getGroup().then((g) => {
          g?.getLobby().then((lobby) => {
            if (lobby) socket.join('l'+lobby.uuid)
          })
        })
      })
    })
  }



  /**
   * Notification lors d'une procédure de mise en place d'un lobby
   *
   * @param lobbyUuid uuid du lobby
   * @param socket socket responsable
   * @param group groupe
   * @private
   */
  private notifySetupLobby(lobbyUuid: string | null, socket:  Socket, group: Group | null) {
    if (!lobbyUuid) { // Erreur >> Servers Full!
      socket.emit('matchmaking_error', {
        message: 'Error! Servers full!\nPlease retry later.',
      })
      if (group?.id) this.io?.to('g' + group.id).emit('matchmaking_error', {
        message: 'Error! Servers full!\nPlease retry later.',
      })
    }
  }

  /**
   * Rechercher et setup un lobby sur un serveur en capacité.
   *
   * @param game jeu à setup
   * @param visibility visibilité
   * @param users liste des utilisateurs à faire rejoindre
   * @return uuid du lobby
   * @private
   */
  private async setupLobbyOnServer(game: string, visibility: string, users: User[]): Promise<string | null> {
    const servers: PTServer[] = await PTServer.all()
    let charge: number = 1
    let server: PTServer | undefined

    for (const _server of servers) {
      const total_lobby: number = (await db.from('pt_servers')
        .join('lobbies', (query) => {
          query
            .on('pt_servers.id', '=', 'lobbies.server_id ')
        })
        .count('lobbies.uuid', 'total'))[0].total
      const _charge = (total_lobby / _server.capacity)
      if (_charge < charge) {
        charge = _charge
        server = _server
      }
    }

    if (server) {
      const uuid: string = randomUUID();
      server.setupLobby(uuid, game, visibility, users)
      return uuid;
    } else {
      return null;
    }


  }

  /**
   * Authentifier un utilisateur connecté.
   *
   * @param socket
   * @param next
   * @private
   */
  private async authMiddleware(socket: Socket, next: any) {

    const auth: AuthUserData = socket.handshake.auth as AuthUserData
    if (auth.user && auth.token) {
      const user: User | null = await User.find(Number(auth.user))
      if (user) {
        const decodedToken = AccessToken.decode(auth.token.substring(0, 4), auth.token)
        if (decodedToken && (await (User.accessTokens.all(user)))[0].verify(decodedToken.secret)) {
          socket.data = {};
          socket.data.user = user
          return next()
        }
      }
    }
    return next(new Error('unauthorized'))
  }
}

export default new AdonisWS()
