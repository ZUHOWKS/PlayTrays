"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PTLobby_1 = require("../PTLobby");
var Card_1 = require("../../DorianGame/cards/Card");
var CardConfig_1 = require("../../DorianGame/cards/CardConfig");
var TownCard_1 = require("../../DorianGame/cards/TownCard");
var services_1 = require("../../../services");
var DorianGame = /** @class */ (function (_super) {
    __extends(DorianGame, _super);
    function DorianGame(uuid, game, visibility, server) {
        var _this = _super.call(this, uuid, game, visibility, server) || this;
        _this.hasDice = true;
        _this.theOnePlaying = 1;
        _this.register = 1;
        _this.canPlay = false;
        _this.players = new Map();
        _this.cards = new Map();
        //Setup des chances possibles (deux types: argent qui permet de modifier 'argent du joueur ayant tiré la carte et
        // deplacement qui permet de deplacer vers la case voulue en decidant si le joueur va sur la case départ)
        _this.chances = new Array({ message: "C'est votre anniversaire !\n Vous gagnez £ 10.\n\n Hourra!", type: "argent", aideReal: 10 }, { message: "Vous organisez un voyage à toulon\n Dirigez vous vers la case Toulon.\n\nVous recevez les £ 20 000 de la case départ", type: "deplacement", aideReal: { nbCase: 3, caseX: 3, caseY: 0, depart: true, prison: false } }, { message: "Vous vous marriez avec Emma et devez donc subvenir à ses besoins.\n Vous perdez £ 1700.\n\nRelou la meuf...", type: "argent", aideReal: -1700 }, { message: "Vous decouvrez un super magasin de comics.\n Vous perdez £ 10 000.)", type: "argent", aideReal: -10000 }, { message: "Vous n'avez pas reussi à  échapper au fisc.\n Vous perdez £ 20 000.)", type: "argent", aideReal: -20000 }, { message: "Emmanuel Macron est réelu, vous avez de la chance, vous faites parti des 1%.\n\nVous gagnez £ 20 000", type: "argent", aideReal: 20000 }, { message: "Vous décidez de vous familiariser avec le dialecte tant aprecié des lyonnais\n Dirigez vous vers la case Lyon.\n\nVous recevez les £ 20 000 de la case départ", type: "deplacement", aideReal: { nbCase: 37, caseX: 0, caseY: 3, depart: true, prison: false } }, { message: "Les pistons de Detroit jouent un match de charité, vous ne voulez pas y aller mais bon c'est gratuit...\n\nDirigez vous vers la case Detroit.\n\n Vous recevez les £ 20 000 de la case départ", type: "deplacement", aideReal: { nbCase: 32, caseX: 0, caseY: 8, depart: true, prison: false } }, { message: "Vous avez commis une fraude fiscale d'un grande ampleur avec un certain Franck Verdonck, \n\nVous allez en prison sans recevoir les £20 000 de la case départ.", type: "deplacement", aideReal: { nbCase: 10, caseX: 10, caseY: 0, depart: false, prison: true } });
        _this.idOfPlayers = new Array();
        _this.setupGame();
        _this.activeAntiEmptyLobby();
        return _this;
    }
    //Passe au joueur suivant et applique un timeout pour que le joueur
    DorianGame.prototype.finTour = function () {
        var _this = this;
        clearTimeout(this.helpTimeout);
        this.theOnePlaying = (this.theOnePlaying >= this.players.size) ? 1 : this.theOnePlaying + 1;
        this.canPlay = true;
        this.helpTimeout = setTimeout(function () { _this.forfeit(_this.players.get(_this.theOnePlaying)); }, 100000);
    };
    //Permet de return le joueur qui a le nom passé en parametre parmis la liste des joueurs
    DorianGame.prototype.getPlayerByName = function (name) {
        var result = undefined;
        this.players.forEach(function (player) {
            if (player.name === name) {
                result = player;
            }
        });
        return result;
    };
    //Instancie les cartes
    DorianGame.prototype.setupGame = function () {
        var _this = this;
        this.cards.set(CardConfig_1.cardConfig.start, new Card_1.Card(CardConfig_1.cardConfig.start, "start"));
        this.cards.set(CardConfig_1.cardConfig.prison, new Card_1.Card(CardConfig_1.cardConfig.prison, "prison"));
        this.cards.set(CardConfig_1.cardConfig.bank, new Card_1.Card(CardConfig_1.cardConfig.bank, "bank"));
        this.cards.set(CardConfig_1.cardConfig.war, new Card_1.Card(CardConfig_1.cardConfig.war, "war"));
        CardConfig_1.cardConfig.batailles.forEach(function (caseNb) {
            _this.cards.set(caseNb, new Card_1.Card(caseNb, "bataille"));
        });
        CardConfig_1.cardConfig.chances.forEach(function (caseNb) {
            _this.cards.set(caseNb, new Card_1.Card(caseNb, "chances"));
        });
        CardConfig_1.cardConfig.villes.forEach(function (town) {
            _this.cards.set(town.caseNb, new TownCard_1.TownCard(town.caseNb, town.nameCity, town.infoCard));
        });
    };
    //Instancie les sockets
    DorianGame.prototype.registerNewSocket = function (socket) {
        var _this = this;
        var _a;
        this.sockets.set(socket.data.user, socket);
        //Ajoute le joueur aux idPlayer pour convertir ensuite la socket en id simple (Exemple: socket 8 ==> id 1)
        if (!(this.idOfPlayers.includes(socket.data.user)))
            this.idOfPlayers.push(socket.data.user);
        //On verifie si le joueur est existant
        if (!(this.players.get(this.idOfPlayers.indexOf(socket.data.user) + 1))) {
            //Si il n'existe pas on l'ajoute avec les valeur initiales
            console.log("La liste des id socket des joueurs: ", this.idOfPlayers, "\nL'id du joueur venant de se connecter: ", socket.data.user);
            var form = new FormData();
            form.append('userID', socket.data.user);
            services_1.Axios.post('/server/user-info', form).then(function (response) {
                console.log(response.data);
                _this.players.set((_this.register), {
                    name: response.data.username,
                    city: [],
                    exitPrison: 0,
                    tourInprison: 0,
                    money: 150000,
                    caseNb: 0,
                    id: _this.idOfPlayers.indexOf(socket.data.user) + 1,
                    realUserId: socket.data.user,
                    playerName: "User" + (_this.idOfPlayers.indexOf(socket.data.user) + 1),
                    pawnName: "pion" + (_this.idOfPlayers.indexOf(socket.data.user) + 1)
                });
                console.log('DEBUG: Joueur enregistré', _this.players.get(_this.register));
                _this.register += 1;
                //On emit PlayerJoin pour chaques joueurs arrivés sur le serveur pour afficher leurs pions sur chacuns des clients
                for (var i = 1; i <= _this.players.size; i++) {
                    _this.server.io.to(_this.uuid).emit("PlayerJoin", _this.players.get(i));
                }
                //Lance la partie
                if (_this.players.size == 2 && _this.status === 'waiting') {
                    _this.pushStatus('running');
                    _this.disableAntiEmptyLobby();
                    _this.helpTimeout = setTimeout(function () { _this.forfeit(_this.players.get(_this.theOnePlaying)); }, 100000);
                    _this.server.io.to(_this.uuid).emit('start');
                    _this.canPlay = true;
                }
                else {
                    socket.emit('start');
                }
            });
        }
        else {
            //On emit PlayerJoin pour chaques joueurs arrivés sur le serveur pour afficher leurs pions sur chacuns des clients
            for (var i = 1; i <= this.players.size; i++) {
                socket.emit("PlayerJoin", this.players.get(i));
            }
            socket.emit('start');
        }
        socket.join(this.uuid);
        socket.emit("UpdateHUD", (_a = this.players.get(this.idOfPlayers.indexOf(socket.data.user))) === null || _a === void 0 ? void 0 : _a.money);
        //Est appelé lorsqu'un joueur envoi une demande d'achat
        socket.on("achatMaison", function (nbMaison) {
            var player = _this.players.get(_this.theOnePlaying);
            if (player) {
                var cardEnCours = _this.cards.get(player.caseNb);
                if (cardEnCours && cardEnCours instanceof TownCard_1.TownCard) {
                    //On verifie si le joueur peut effectivement acheter
                    if (_this.hasAllProperty(player, cardEnCours)) {
                        //On verifie si le joueur peut poser le nombre de maisons demandé
                        if (player.money >= cardEnCours.info.maison * nbMaison && cardEnCours.nbMaison + nbMaison <= 5) {
                            player.money -= cardEnCours.info.maison * nbMaison;
                            cardEnCours.nbMaison += nbMaison;
                            _this.players.set(_this.theOnePlaying, player);
                            _this.cards.set(player.caseNb, cardEnCours);
                            console.log("la carte ", cardEnCours.name, " a recu ", nbMaison, " maison, elle coute maintenant ", cardEnCours.getPassagePrice());
                        }
                    }
                    _this.finTour();
                }
            }
        });
        //Est émis dès que le joueur clique sur le dé
        socket.on("Lancede", function (callBack) {
            //Verifie si le joueur qui a cliqué peut jouer
            if ((_this.idOfPlayers.indexOf(socket.data.user) + 1) == _this.theOnePlaying && _this.players.get(_this.theOnePlaying) && _this.canPlay && _this.status === 'running') {
                //Retire le timeout et en rajoute un nouveau (le timeout laisse 60 secondes au joueur pour jouer sinon il perds la partie)
                clearTimeout(_this.helpTimeout);
                _this.helpTimeout = setTimeout(function () { _this.forfeit(_this.players.get(_this.theOnePlaying)); }, 100000);
                //Fait en sorte que personne ne joue tant que le tour n'est pas fini
                _this.canPlay = false;
                var player = _this.players.get(_this.theOnePlaying);
                //Definis les dés pour le systeme de double (pour la prison actuellement)
                var de1 = Math.floor(Math.random() * 5 + 1);
                var de2 = Math.floor(Math.random() * 5 + 1);
                var r = (_this.hasDice) ? de1 + de2 : de1;
                if (player != undefined) {
                    //Si le joueur est en prison mais a fait un double
                    if (de1 == de2 && player.tourInprison > 0) {
                        _this.server.io.to(_this.uuid).emit("retirer prison");
                        player.tourInprison = 0;
                    }
                    console.log("Le joueur ", player.name, " a ", player.tourInprison, "tours en prisons et les dés sont: ", de1, de2);
                    //Si le joueur a fait un double ou qu'il n'est pas en prison
                    if (de1 == de2 || player.tourInprison == 0) {
                        //On ajoute le nombre de case tirés au dés au joueur
                        player.caseNb += r;
                        //On verifie si le joueur passe sur la case départ
                        _this.verifStart(player, socket);
                        _this.players.set(_this.theOnePlaying, player);
                        console.log("Le joueur ", player.playerName, " est sur la case ", player.caseNb, " avec £ ", player.money);
                        //On recupere la case sur lasuelle est le joueur et on en déduit les differents choix
                        var caseInfo = _this.cards.get(player.caseNb);
                        if (caseInfo) {
                            _this.server.io.to(_this.uuid).emit("pawnMove", _this.theOnePlaying, r);
                            if (caseInfo.type == "chances") {
                                _this.caseChance(caseInfo, player, socket);
                            }
                            else if (caseInfo.type == "war")
                                _this.finTour();
                            else if (caseInfo.type == "bank")
                                _this.finTour();
                            else if (caseInfo.type == "start")
                                _this.finTour();
                            else if (caseInfo.type == "bataille")
                                _this.finTour();
                            else if (caseInfo.type == "prison")
                                _this.finTour();
                            else if (caseInfo instanceof TownCard_1.TownCard) {
                                _this.caseTown(caseInfo, player, socket);
                            }
                        }
                    }
                    //Si le joueur ne fait pas de double et est en prison
                    else if (de1 != de2 && player.tourInprison > 0) {
                        console.log("Il vous reste ", player.tourInprison - 1, " tours en prison");
                        player.tourInprison -= 1;
                        //retire la prison si le joueur n'a plus qu'un tour
                        if (player.tourInprison == 0) {
                            _this.server.io.to(_this.uuid).emit("retirer prison");
                        }
                        _this.finTour();
                    }
                }
            }
        });
        //Permet d'update les varibales du serveur vers le client
        socket.on("Update", function (callBack) {
            callBack(undefined, {
                playersUpdate: Array.from(_this.players.entries()),
                cardsUpdate: Array.from(_this.cards.entries()),
                player: _this.players.get(_this.theOnePlaying)
            });
        });
        //Fini le tour
        socket.on("FinTour", function () {
            _this.finTour();
        });
        //achete la case sur laquelle est le joueur
        socket.on("Achat", function () {
            var player = _this.players.get(_this.theOnePlaying);
            if (player != undefined) {
                _this.achat(player);
            }
            _this.finTour();
        });
        //Fini le tour pour le joueur
        socket.on("Faillite", function (player) {
            _this.forfeit(player);
        });
        //Bouge le joueur vers la case indiquée par la carte chance
        socket.on("moveChance", function (chanceValue, player) {
            _this.emitWithout(socket, "Carte chance deplacement all", chanceValue, player);
        });
        socket.on("disconnect", function () {
            _this.removeSocket(socket.data.user);
            console.log("The user " + socket.data.user + " leave the lobby " + _this.uuid + ".");
        });
        socket.on('leave party', function (callback) {
            if (_this.status != "finished")
                _this.forfeit(_this.players.get(_this.theOnePlaying));
            callback(undefined, { status: 200 });
        });
    };
    //Verifie si la case depart est franchie
    DorianGame.prototype.verifStart = function (player, socket) {
        if (player.caseNb >= 40) {
            player.caseNb -= 40;
            player.money += 20000;
            socket.emit("Passage case départ", player.money);
        }
    };
    //Fait perdre le joueur
    DorianGame.prototype.forfeit = function (player) {
        var _this = this;
        if (player && this.players) {
            this.pushStatus('finished');
            setTimeout(function () {
                _this.server.io.to(_this.uuid).disconnectSockets();
            }, 25000);
        }
    };
    //Gere les carte chances
    DorianGame.prototype.caseChance = function (caseInfo, player, socket) {
        var chanceValue = this.chances[(Math.floor(Math.random() * this.chances.length))];
        //Si la carte chance est basé sur l'ajout ou le retrait d'argent
        if (chanceValue.type == "argent") {
            player.money += chanceValue.aideReal;
            this.players.set(this.theOnePlaying, player);
            if (player.money < 0)
                this.forfeit(player);
            socket.emit("Carte chance argent", chanceValue, player);
        }
        //Si la carte chance est basé sur le deplacement d'un joueur
        else if (chanceValue.type == "deplacement") {
            //ajoute de l'argent si le joueur passe sur la case départ et a le droit à son argent
            if (player.caseNb >= chanceValue.aideReal.nbCase && chanceValue.aideReal.depart) {
                player.money += 20000;
            }
            //si la carte est une prison, on ajoute le tour en prison et on envoie aux joueurs un socket
            if (chanceValue.aideReal.prison)
                player.tourInprison = 3;
            player.caseNb = chanceValue.aideReal.nbCase;
            this.players.set(this.theOnePlaying, player);
            //Deplace vers les cases données par la carte
            socket.emit("Carte chance deplacement", chanceValue, player);
            if (chanceValue.aideReal.prison)
                this.emitWithout(socket, "joueur en prison", player);
            //else this.emitWithout(socket, "joueur déplacement", player);
        }
    };
    //Achete la case en cours
    DorianGame.prototype.achat = function (player) {
        var cardToSell = this.cards.get(player.caseNb);
        if (cardToSell != undefined && cardToSell instanceof TownCard_1.TownCard) {
            if (player.money > cardToSell.info.prix && cardToSell.user == undefined) {
                player.money -= cardToSell.info.prix;
                player.city.push(cardToSell.name);
                cardToSell.user = player.name;
                this.players.set(this.theOnePlaying, player);
                this.cards.set(player.caseNb, cardToSell);
                this.theOnePlaying = (this.theOnePlaying == this.players.size) ? 1 : this.theOnePlaying + 1;
            }
        }
    };
    //Gere les cartes villes
    DorianGame.prototype.caseTown = function (caseInfo, player, socket) {
        //Si la case n'est pas occupée
        if (caseInfo.user == undefined) {
            socket.emit("CasePossible", caseInfo, player, (player.money >= caseInfo.info.prix), this.theOnePlaying);
        }
        //Si la case est celle du joueur
        else if (caseInfo.user == player.name) {
            var maxHouse = 0;
            for (var i = 1; i < 6; i++) {
                if (caseInfo.info.maison * i <= player.money)
                    maxHouse += 1;
            }
            //Si le joueur possede toutes les autres cases de la meme couleur
            if (this.hasAllProperty(player, caseInfo))
                socket.emit("MaisonPossible", maxHouse, caseInfo, player);
            else
                this.finTour();
        }
        //Si le joueur est sur la case d'un autre
        else {
            //Ajouter un emit pour animation de retirer l'argent
            var playerPaid = this.getPlayerByName(caseInfo.user);
            var prix = caseInfo.getPassagePrice();
            if (playerPaid) {
                //On ajoute l'argent du passage au joueur possedant la carte
                if (player.money >= prix && caseInfo.user) {
                    player.money -= prix;
                    playerPaid.money += prix;
                    this.players.set(this.theOnePlaying, player);
                    this.players.set(playerPaid.id, playerPaid);
                    socket.emit("Paiement", prix, player);
                    console.log("Le joueur ", player.playerName, " (£ ", player.money, "a payé £ ", prix, " à ", playerPaid.playerName, " (£ ", playerPaid.money, ").");
                    this.finTour();
                }
                else {
                }
                console.log("prix: ", prix, player.money);
            }
        }
    };
    //Verifie si le joueur en entrée a toutes les cartes de la meme couleur passée en entrée
    DorianGame.prototype.hasAllProperty = function (playerToCheck, cardToCheck) {
        var cardSameType = [];
        var nbCardSame = 0;
        this.cards.forEach(function (card) {
            if (card instanceof TownCard_1.TownCard && card.info.color == cardToCheck.info.color) {
                cardSameType.push(card.name);
            }
        });
        playerToCheck.city.forEach(function (city) {
            if (cardSameType.includes(city))
                nbCardSame += 1;
        });
        return (nbCardSame == cardSameType.length);
    };
    return DorianGame;
}(PTLobby_1.default));
exports.default = DorianGame;
