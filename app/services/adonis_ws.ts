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
import {MatchmakingError, MatchmakingResponse} from "../modules/utils/MatchmakingResponse.js";
import {FriendInterface} from "../modules/utils/UserInterface.js";

interface AuthUserData {
  user: number;
  token: string;
}

/**
 * Class AdonisWS
 *
 * Websocket server pour l'application Adonis >> Synchronise les
 * données en temps réel tel que le groupage, les notifications,
 * le matchmaking et d'autres fonctionnalités qui nécessitent une
 * synchronisation en temps réel.
 */
class AdonisWS {
  io: Server | undefined
  private booted = false

  /**
   * Boote le websocket.
   */
  public boot() {

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
   * Authentifier un utilisateur connecté.
   *
   * @param socket socket client
   * @param next callback pour passer au prochain middleware
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

  /**
   * Initialiser les événements du socket client.
   */
  public initSocketEvents() {
    this.io?.use(async (socket, next) => await this.authMiddleware(socket, next))
    this.io?.on('connect', async (socket) => {
      socket.rooms.clear();
      socket.join('u'+(socket.data.user as User).id)
      /*
      * Évènement émis par l'utilisateur pour lancer un matchmaking
      *
      * Permet à un utilisateur seul ou groupé de rentrer dans la procédure de
      * matchmaking.
      */
      socket.on('matchmaking', async (game: string, callback: any) => {
        try {
          const _l: Lobby | null = (await (socket.data.user as User).getLobby());
          if (!_l) { // le joueur n'est pas dans un lobby
            await this.startMatchmaking(socket, callback, game)
          } else { // si le joueur est déjà dans un lobby

            if (await _l.isReady()) {
              socket.emit('matchmaking_confirm', {
                message: 'Connection to the party...'
              })
            }
            else {
              socket.emit('matchmaking_info', {
                message: "Lobby found ! Searching players..."
              } as MatchmakingResponse)
            }
          }

        } catch (e) {
          console.error(e)
        }
      })

      socket.on('matchmaking_leave', async () => {
        try {
          (socket.data.user as User).leaveLobby()
        } catch (e) {
          console.error(e)
        }
      })

      // Join the lobby room pour les utilisateurs membre d'un groupe
      // !IMPORTANT! permet à tous les joueurs de recevoir la confirmation de matchmaking
      socket.on('lobby_join_room', () => {
        this.joinLobbyRoom(socket)
      })

      socket.on('user_ping', async (userId: number, callback) => {
        try {
          await this.pingFriend(userId, (socket.data.user as User), callback);
        } catch (e) {
          console.error(e)
        }

      })

      socket.on('group_invite', async (userId: number, callback) => {
        try {
          await this.groupInvitation(socket, userId, callback);
        } catch (e) {
          console.error(e)
        }

      })

      socket.on('group_accept', async (userId: number, callback) => {
        try {
          await this.acceptGroupInvitation(userId, socket, callback);
        } catch (e) {
          console.error(e)
        }
      })

      socket.on('disconnect', () => {
        try {
          (socket.data.user as User).leaveLobby()
        } catch (e) {
          console.error(e)
        }
      })

      // join la room du groupe
      const _g: Group | null = await (socket.data.user as User).getGroup();
      if (_g) {
        socket.join('g'+_g.id);
      }

    })
  }

  /**
   * Accepter l'invitation d'un groupe.
   *
   * @param userId ID de l'utilisateur responsable de l'invitation
   * @param socket utilisateur qui accept l'invitation
   * @param callback callback
   * @private
   */
  private async acceptGroupInvitation(userId: number, socket: Socket, callback: any) {
    const friend: User | null = await User.find(userId); // l'ami qui a invité l'utilisateur
    const user: User = (socket.data.user as User) // l'utilisateur qui accepte l'invitation

    if (friend && await user.isFriend(friend)) {
      const _g: Group | null = await friend.getGroup()

      if (_g && await _g.isInvited(user.id)) _g.confirmInvitationOf(user).then(async () => {
        socket.join('g' + _g.id)

        callback(undefined, {message: 'Vous avez rejoins !', group: await _g.getUsers()})
      })
      else return callback("Unauthorized!", undefined)

    } else {
      return callback("Unauthorized!", undefined)
    }
  }

  /**
   * Inviter un utilisateur en ami dans un groupe.
   *
   * @param socket utilisateur responsable de l'invitation.
   * @param userId ID de l'utilisateur invité
   * @param callback callback
   * @private
   */
  private async groupInvitation(socket: Socket, userId: number, callback: any) {
    const user: User = (socket.data.user as User); // utilisateur qui réalise l'invitation
    const friend: User | null = await User.find(userId); // l'ami qui est invité

    if (friend && await user.isFriend(friend)) {
      let g: Group | null = await user.getGroup()

      if (!g) {
        g = await Group.create({
          leader_id: user.id
        })
        socket.join('g'+g.id)
      }

      if ((await friend.getGroup())?.id != g.id) {
        g.invite(userId).then(
          () => {
            callback(undefined, {message: "Invitation envoyée !"})
            this.io?.to('u'+friend.id).emit('group_invite', user.id, {
              message: user.username.charAt(0).toUpperCase() + user.username.slice(1) + " invited you !"
            })
          }
        )
      } else {
        callback('Unauthorized!', undefined)
      }

    } else {
      callback('Unauthorized!', undefined)
    }
  }

  /**
   * Ping un utilisateur ami pour obtenir l'état d'activité de celui-ci.
   *
   * @param friendId id de l'ami
   * @param user utilisateur responsable
   * @param callback réponse cliente
   * @private
   */
  private async pingFriend(friendId: number, user: User, callback: any) {
    const friend: User | null = await User.find(friendId)
    if (friend) {
      if (await user.isFriend(friend)) {

        this.io?.to("u" + friend.id).timeout(5000).emit('ping', async (error: any, response: any) => {
          if (!error && response.length > 0) {
            const _l: Lobby | null = await friend.getLobby();
            if (_l) return callback(undefined, {
              id: friend.id,
              username: friend.username,
              online: true,
              status: "In " + _l.game.charAt(0).toUpperCase() + _l.game.slice(1) + " Party"
            } as FriendInterface);

            const _g: Group | null = await friend.getGroup();
            if (_g) return callback(undefined, {
              id: friend.id,
              username: friend.username,
              online: true,
              status: "Grouped in " + await _g.getMemberNumber() + " stacks"
            } as FriendInterface);

            return callback(undefined, {
              id: friend.id,
              username: friend.username,
              online: true,
              status: "Online : In the menu"
            } as FriendInterface);

          } else {
            return callback(undefined, {
              id: friend.id,
              username: friend.username,
              online: false,
              status: 'Offline'
            } as FriendInterface);
          }
        })
      } else {
        return callback("Unauthorized!", undefined)
      }
    } else {
      return callback("Unauthorized!", undefined)
    }
  }

  /**
   * Lancer la procédure de matchmaking lorsque l'utilisateur est leader.
   * Si le mode de jeu est inexistant en DB ou que le groupe est trop
   * nombreux >> annulation du matchmaking.
   *
   * Algorithme :
   * Si l'utilisateur forme un groupe parfait >> lancement d'une partie dans
   * un Lobby privé !
   *
   * Sinon recherche d'un lobby >>
   * |- Si un lobby est trouvé >> il est rejoint.
   * |- Sinon >> création d'un lobby public !
   *
   * Si aucun lobby n'est créé >> annulation du matchmaking.
   *
   * @param socket socket responsable de l'émission
   * @param callback renvoyer une réponse au client
   * @param game mode de jeu à lancer
   * @private
   */
  private async startMatchmaking(socket: Socket, callback: any, game: string) {
    // get l'id du group de l'utilisateur
    let group: Group | null = await socket.data.user.getGroup()
    // si le joueur n'est pas leader du groupe >> cancel le matchmaking

    if (group && group.leader_id != socket.data.user.id) return callback({
      message: 'You are not the leader of the group',
      error_type: 'none_leader_permission'
    } as MatchmakingError, undefined)

    // on obtient la liste des utilisateurs à matcher
    const users: User[] = []
    if (group?.id) (await group.getUsers()).forEach((user) => users.push(user))
    else users.push((socket.data.user as User))

    // on vérifie si le jeu à lancer existe et si le groupe ne dépasse pas le nombre de joueurs requis pour ce même jeu
    const resGame = await db.from('games').select('game', 'max_player as max').where('game', game).first()
    if (resGame?.game && resGame.max >= users.length) {
      callback(undefined, {message: 'Searching a party...'})
      if (group?.id) this.io?.to('g' + group.id).emit('matchmaking_init', {message: "Searching a party..."} as MatchmakingResponse, group.leader_id)

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
          .orderBy('available', "desc")
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
              } as MatchmakingResponse)
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
      callback({
        message: 'You are too much',
        error_type: 'max_capacity_exceed'
      } as MatchmakingError, undefined)
    } else {
      callback({
        message: 'Unavailable game! Try an another mod.',
        error_type: 'unavailable_game'
      } as MatchmakingError, undefined)
    }
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
        error_type: 'servers_full'
      } as MatchmakingError)
      if (group?.id) {
        this.io?.to('g' + group.id).emit('matchmaking_error', {
          message: 'Error! Servers full!\nPlease retry later.',
          error_type: 'servers_full'
        } as MatchmakingError)
      }
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
    const servers: PTServer[] = await PTServer.query().where('statut', 'online')
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
      let uuid: string = randomUUID()
      let _lobby: Lobby | null = await Lobby.find(uuid)
      let tryIt: number = 1;

      // génère un UUID v4 au maximum X fois tant qu'il n'existe pas dans la table
      while (_lobby && tryIt < 20) { // valeur arbitraire
        uuid = randomUUID();
        _lobby = await Lobby.find(uuid)
        tryIt++
      }

      if (!_lobby) {
        server.setupLobby(uuid, game, visibility, users)
        return uuid;
      }
    }

    return null;
  }

  /**
   * Join la room du lobby afin de recevoir les notifications sur l'avancement
   * du matchmaking.
   *
   * @param socket socket du client
   * @private
   */
  private joinLobbyRoom(socket: Socket) {
    (socket.data.user as User).getLobby().then(async (lobby) => {
      if (lobby) {
        socket.join('l' + lobby.uuid)
        if (await lobby.isReady()) socket.emit('matchmaking_confirm', {
          message: 'Connection to the party...'
        })
        else socket.emit('matchmaking_info', {
          message: "Lobby found ! Searching players..."
        } as MatchmakingResponse)
      }
    })
  }
}

export default new AdonisWS()
