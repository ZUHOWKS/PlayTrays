<script setup lang="ts">

import {type Router, useRouter} from "vue-router";
import {computed, onMounted, reactive, type Ref, ref} from "vue";
import AccountServices from "@/services/account_services";
import MainMenu from "@/components/menu/MainMenu.vue";
import TopBarMenu from "@/components/menu/TopBarMenu.vue";
import Popup from "@/components/utils/Popup.vue";
import {io, type Socket} from "socket.io-client";
import type {MatchmakingError, MatchmakingResponse} from "@/modules/utils/matchmaking/MatchmakingResponse";
import PTMatchmaking from "@/modules/utils/matchmaking/PTMatchmaking";
import {PopupObject} from "@/modules/utils/Popup";
import SocialWidget from "@/components/utils/SocialWidget.vue";
import Notification from "@/components/utils/Notification.vue";
import type {FriendInterface, UserInterface} from "@/modules/utils/UserInterface";
import type {GroupInterface} from "@/modules/utils/GroupInterface";
import LoaderFiller from "@/components/utils/LoaderFiller.vue";
import {ADONIS_URL} from "@/config/serverConfig";
import * as THREE from "three";
import {useWindowSize} from "@vueuse/core";
import {ModelLoader} from "@/modules/utils/scene/ModelLoader";

const router: Router = useRouter();
if (!AccountServices.isLogged()) AccountServices.logout(router);

/**
 * THREE JS scene
 */

const experience: Ref<HTMLCanvasElement | null> = ref<HTMLCanvasElement | null>(null); // VueJS variable, canvas de la scène 3d
let renderer: Ref<THREE.WebGLRenderer>; // Renderer de la caméra
let camera: Ref<THREE.PerspectiveCamera>; // Caméra (vue du joueur)
let scene: THREE.Scene; // Scène 3D
let objectRegistry: Map<string, THREE.Object3D> = new Map<string, THREE.Object3D>()

let {width, height} = useWindowSize(); // Permet d'obtenir la taille de l'écran actuel pour le responsive
const aspectRatio = computed(() => width.value / height.value) // rapport largeur/hauteur

/**
 * Mettre à jour la caméra
 */
function updateCamera(): void {
  camera.value.aspect = aspectRatio.value; // actualisation du rapport d'aspect de la caméra
  camera.value.updateProjectionMatrix(); // mettre à jour la matrice de projection de la caméra
}

/**
 * Mettre à jour le renderer
 */
function updateRenderer(): void {
  renderer.value.setSize(width.value, height.value)
  renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

/**
 * Mettre à jour le rendu
 */
function updateRender(): void {
  renderer.value.render(scene, camera.value)
}

/**
 * Boucle qui rafraîchie le rendu de la scène.
 */
function animate(time: number) {
  for (let i = 1; i <= 4; i++) {
    const userObj: THREE.Object3D | undefined = objectRegistry.get('user'+i);
    if (userObj) {
      userObj.position.y = Math.cos((time + i * Math.random()) * 0.0015 + i) * 0.02
      userObj.rotation.z = Math.sin(Math.cos((time + i * Math.random()) * 0.00075 + i) * Math.PI) * Math.PI/64 + Math.PI/8
      userObj.rotation.y = Math.sin(Math.cos((time + i * Math.random()) * 0.00075 + i) * Math.PI) * Math.PI/64 + Math.PI/3
    }
  }

  updateCamera(); // mise à jour de la caméra
  updateRenderer(); // mise à jour du renderer
  updateRender(); // mise à jour du rendu

  requestAnimationFrame(animate); // permet de relancer la fonction à la frame suivante
}

async function generateCasa() {
  const casa: THREE.Object3D = await ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, 'casa/casa_default.glb');
  casa.rotation.y = -Math.PI/2
  casa.name = 'casa'
  scene.add(casa)

  objectRegistry.set('casa', casa)

  const user: THREE.Object3D = await ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, 'checkers/pawn_white.glb')
  user.position.set(-0.1,0, 3.375)
  user.scale.set(0.0625,0.0625,0.0625)
  user.rotation.set(0, Math.PI/3, Math.PI/8)

  scene.add(user)
  objectRegistry.set('user1', user)
}

async function generateUserMember(n: number) {
  const user: THREE.Object3D = await ModelLoader.loadGLTFSceneModel(ModelLoader.GLTF_LOADER, 'checkers/pawn_black.glb')
  user.scale.set(0.0625,0.0625,0.0625)
  user.rotation.set(0, Math.PI/3, Math.PI/8)
  switch (n) {
    case 2:
      user.position.set(-0.4,0, 3.05);
      break
    case 3:
      user.position.set(0.25,0, 2.95);
      break
    case 4:
      user.position.set(0.6,0, 2.65);
      break
  }

  user.name = 'user'+n
  scene.add(user)

  objectRegistry.set('user'+n, user)
}

function lookCasa() {
  camera.value.position.set(0,0.3, 6.5)
}


function setupLights() {
  const ambient: THREE.AmbientLight = new THREE.AmbientLight();
  ambient.position.y = 5;
  ambient.color.setRGB(255, 255, 255);
  ambient.intensity = 0.005

  const directional1 = new THREE.DirectionalLight( 0xffffff, 1.5)
  directional1.position.set(8, 10, 7.5)
  const directional2 = new THREE.DirectionalLight( 0xffffff, 1.5)
  directional2.position.set(10, 10, 2)

  const targetObject = new THREE.Object3D();
  scene.add(targetObject);

  directional2.target = targetObject
  targetObject.position.set(0, 5, -10)

  scene.add(ambient);
  scene.add(directional1);
  scene.add(directional2);

}

/**
 *
 *   AMIS, GROUPES & MATCHMAKING
 *
 */

const matchmakingBanner: Ref<HTMLElement | null> = ref(null);
const wsocial: Ref<HTMLElement | null> = ref(null);
const showLoader: Ref<boolean> = ref(true);

let ws: Socket;

// permet de stocker de manière dynamique des variables utiles pour les composants
const menuInfo = reactive({
  page: "main",
  matchmaking: new PTMatchmaking(),
  grouped_users: undefined,
  showSocialWidget: false,
  friendList: ([] as FriendInterface[]),
  group: (undefined as GroupInterface | undefined)
});

const notification = reactive({
  id: 0,
  message: '',
  action: null,
  showNotification: false,
})

const popup: Ref<PopupObject> = ref(new PopupObject("", ""))

const user: Ref<UserInterface> = ref({
  id: -1,
  username: '',
  points: -1,
  updatedAt: '',
  createdAt: ''
})

/**
 * Obtenir la liste d'ami et l'afficher
 */
async function getFriendList() {
  return AccountServices.getFriends().then((response) => {
    const _friends: FriendInterface[] = (response.data as FriendInterface[])
    if (menuInfo.friendList.length == 0) menuInfo.friendList = _friends;

    const friends: FriendInterface[] = ([] as FriendInterface[]);
    let pushed: number = 0;

    _friends.forEach((friend) => {
      ws.emit('user_ping', friend.id, (error: any, response: FriendInterface) => {
        if (!error) {
          friend.status = response.status
          friend.online = response.online
          friends.push(friend)
          pushed++;
        }
        if (pushed == _friends.length) menuInfo.friendList = friends;
      })
    })
  })
}

/**
 * Obtenir les informations du groupe et l'afficher
 */
function getGroupInfo() {
  ws.emit('group_info',async (error: any, response: any) => {
    for (let i=2; i <= 4; i++) {
      objectRegistry.get('user'+i)?.removeFromParent();
      objectRegistry.delete('user'+i);
    }

    if (response) {
      menuInfo.group = {
        group: response.group,
        leader: response.leader,
        players: response.players as FriendInterface[]
      } as GroupInterface;

      let n = 2;

      for (const member of menuInfo.group.players) {
        if (n < 5) {
          if (user.value.id != member.id) {
            await generateUserMember(n)
            n++
          }
        } else {
          return
        }
      }
    } else {
      menuInfo.group = undefined;
    }
  })
}

function init() {
  scene = new THREE.Scene();  // Créer la scène

  camera = ref(new THREE.PerspectiveCamera(25, aspectRatio.value, 0.1, 1000)); // Définie la perspective de la caméra
  lookCasa();

  onMounted(() => {
    // configuration du renderer
    renderer = ref(new THREE.WebGLRenderer({
      canvas: experience.value as unknown as HTMLCanvasElement,
      powerPreference: "high-performance",
      antialias: false,
    }));

    renderer.value.setClearColor( 0x000000, 0 ); // the default

    // Actualisation des paramètres du renderer et de la caméra
    updateCamera();
    updateRenderer();

    setupLights();

    // Lancer la boucle
    animate(0);

    generateCasa().then(() => {
      AccountServices.getUserInfos().then((response) => {
        user.value.id = response.data.id;
        user.value.username = response.data.username;
        user.value.points = response.data.points;
        user.value.updatedAt = response.data.updatedAt;
        user.value.createdAt = response.data.createdAt;

        ws = io(ADONIS_URL, {
          auth: {
            user: user.value.id,
            token: AccountServices.getToken(),
          }
        });

        ws.connect();

        // lorsque le socket est connecté
        ws.on('connect', () => {
          menuInfo.matchmaking.canStart = true;
          getGroupInfo();
          getFriendList().then(() => showLoader.value = false);
        });

        ws.on('reconnect', () => {
          menuInfo.matchmaking.canStart = true;
          getGroupInfo();
          getFriendList().then(() => showLoader.value = false);
        });

        // lors d'une déconnexion
        ws.on('disconnect', () => {
          menuInfo.matchmaking.canStart = false;
        });

        // Initialisation du matchmaking
        ws.on('matchmaking_init', (response: MatchmakingResponse) => {
          menuInfo.matchmaking.response = response;
          getGroupInfo();
          if (!menuInfo.matchmaking.isInQueue) showMatchmakingBanner();
        });

        // Information du matchmaking
        ws.on('matchmaking_info', (response: MatchmakingResponse) => {
          menuInfo.matchmaking.response = response;
        });

        // MatchmakingError >> cancel
        ws.on('matchmaking_error', (error: MatchmakingError) => {
          matchmakingError(error);
        });

        // Matchmaking confirm >> lancement de la partie
        ws.on('matchmaking_confirm', (response: MatchmakingResponse) => {
          menuInfo.matchmaking.response = response;
          ws.disconnect();
          router.push('/game');
        });

        ws.on('matchmaking_leave', () => {
          if (menuInfo.matchmaking.isInQueue) showMatchmakingBanner()
        });

        // Join lobby room (cas où le joueur membre d'un groupe)
        // !IMPORTANT! permet au joueur membre d'un groupe de recevoir la confirmation de matchmaking
        ws.on('lobby_join_room', () => {
          ws.emit('lobby_join_room');
        });

        // Ping par le serveur
        ws.on('ping', (callback) => {
          return callback(undefined, "here")
        });

        // Lorsqu'un utilisateur nous invite
        ws.on('group_invite', (userId: number, response: {message: string}) => {
          showNotification(response.message, () => acceptGroupInvitation(userId), true)
        });

        ws.on('group_update', () => {
          getGroupInfo();
        });

      }).catch(error => {
        AccountServices.logout(router);
      });
    });


  })


}

/**
 * Afficher une fenêtre Popup.
 *
 * @param title titre
 * @param message message
 */
function showPopup(title: string, message: string) {
  popup.value.setContent(title, message);
  popup.value.show();
}


/**
 * Afficher une erreur lié au matchmaking
 *
 * @param error
 */
function matchmakingError(error: MatchmakingError) {
  console.error(error.error_type);
  showMatchmakingBanner();
  showPopup("Any trays in the sky!", error.message);
}

/**
 * Lancer un matchmaking
 *
 * @param game
 */
function startMatchmaking(game: string) {

  if (menuInfo.matchmaking.canStart) {
    menuInfo.matchmaking.response = {message: "Searching a party..."}
    showMatchmakingBanner();
    ws.emit('matchmaking', game, (error: MatchmakingError, response: MatchmakingResponse) => {
      if (error) { // pas de matchmaking
        matchmakingError(error)
      } else {
        menuInfo.matchmaking.response = response
      }
    })
  } else {
    console.error("Server connection not instanced!")
  }
}

/**
 * Afficher ou Cacher la bannière de matchmaking.
 */
function showMatchmakingBanner() {

  if (matchmakingBanner.value) {
    menuInfo.matchmaking.isInQueue = !menuInfo.matchmaking.isInQueue;
    if (menuInfo.matchmaking.isInQueue) {
      matchmakingBanner.value.style.setProperty('transition', 'all .1s');
      matchmakingBanner.value.style.opacity = 1+"";
      matchmakingBanner.value.style.transform = "scaleX(1)";
    } else {
      matchmakingBanner.value.style.setProperty('transition', '');
      matchmakingBanner.value.style.opacity = 0+"";
      matchmakingBanner.value.style.transform = "scaleX(0)";
    }
  }


}


/**
 * Afficher ou Cacher le widget social.
 */
function showSocialWidget() {
  if (wsocial.value) {
    if (menuInfo.showSocialWidget) {
      wsocial.value.style.transform = "translateX(300px)";
    } else {
      getFriendList()
      wsocial.value.style.transform = "translateX(0)"
    }
    menuInfo.showSocialWidget = !menuInfo.showSocialWidget;
  }
}

/**
 * Accepter l'invitation au groupe.
 *
 * @param userId
 */
function acceptGroupInvitation(userId: number) {
  ws.emit('group_accept', userId, (error: any, response: any) => {
    if (!error) {
      showNotification(response.message, null, true);
    }
  })
}

/**
 * Afficher une notification.
 *
 * @param message message de la notification.
 * @param action action possible à exécuter.
 * @param closeIt fermé automatiquement la notification ?
 */
function showNotification(message: string, action: any, closeIt: boolean) {
  notification.id++;
  notification.message = message;
  notification.action = action;
  notification.showNotification = true;

  if (closeIt) closeNotification();
}

/**
 * Permet de fermer la notification automatiquement si celle-ci n'as pas été fermé
 * ou remplacé par une autre.
 */
function closeNotification() {
  const _id = notification.id;
  setTimeout(() => {
    if (notification.id == _id) notification.showNotification = false
  }, 6000)
}

/**
 * Inviter un utilisateur dans un groupe.
 *
 * @param userId
 */
function inviteInGroup(userId: number) {
  ws.emit('group_invite', userId, (error: any, response: any) => {
    if (!error) {
      notification.id++;
      notification.message = response.message;
      notification.action = null;
      notification.showNotification = true;
      closeNotification();
    }
  })
}

function leaveGroup() {
  ws.emit('group_leave', (error: any, response: any) => {
    if (!error) showNotification(response.message, undefined, true)
  })
}

init();

</script>

<template>
  <LoaderFiller :show-loader="showLoader"/>

  <Popup :popup="popup"/>
  <Notification :notification="notification"/>

  <div class="social-widget" ref="wsocial">
    <SocialWidget :menu-info="menuInfo" :show-social-widget="showSocialWidget" :invite-in-group="inviteInGroup" :get-friend-list="getFriendList" :show-notification="showNotification"/>
  </div>
  <!-- Contenue de la page ainsi que la top bar -->
  <main>

    <section class="top-section">
      <div class="matchmaking-banner" ref="matchmakingBanner">
        <p>{{menuInfo.matchmaking.response?.message}}</p>
        <svg xmlns="http://www.w3.org/2000/svg" class="icon-load" viewBox="0 0 512 512"><path d="M434.67 285.59v-29.8c0-98.73-80.24-178.79-179.2-178.79a179 179 0 00-140.14 67.36m-38.53 82v29.8C76.8 355 157 435 256 435a180.45 180.45 0 00140-66.92" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="46"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 256l44-44 46 44M480 256l-44 44-46-44"/></svg>
        <svg @click="() => ws.emit('matchmaking_leave')" xmlns="http://www.w3.org/2000/svg" class="cancel-button" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144M368 144L144 368"/></svg>
      </div>
      <TopBarMenu :menu-info="menuInfo" :show-social-widget="showSocialWidget" :leave-group="leaveGroup"></TopBarMenu>
    </section>

    <!-- Contenue de la page -->
    <section class="container-section">

      <canvas class="scene" ref="experience"></canvas>
      <!--
        Le contenue de la catégorie sélectionné via la barre de navigation
        sera placé dans cette section

        Ainsi ce qui reste affiché de manière permanente dans le menu sera
        la Side Nav & la Barre Top
      -->

      <!-- Affiche de manière conditionnel un des composants -->
      <MainMenu v-if="menuInfo.page == 'main'" :menu-info="menuInfo" :start-matchmaking="startMatchmaking">
        <img src="@/assets/image/casa/casa_default_sky.jpg" alt="casa default background">
      </MainMenu>
    </section>
  </main>
</template>

<style scoped>

  .top-section {
    height: 14vh;
    width: 100vw;
    background: linear-gradient(180deg, rgba(var(--background-color), 0.75) 0%, rgba(var(--background-color), 0.6) 40%, rgba(var(--background-color), 0) 100%);
    position: fixed;
    z-index: 2;
  }

  .matchmaking-banner {
    z-index: 10;
    top: 0;
    height: 5vh;
    padding: 0.1% 1%;
    width: 100vw;
    background: linear-gradient(90deg, rgb(var(--secondary-color)) 0%, rgb(var(--primary-color)) 20%, rgb(var(--secondary-color)) 40%, rgb(var(--primary-color)) 60%, rgb(var(--secondary-color)) 80%, rgb(var(--primary-color)) 100%);
    position: fixed;
    background-size: 600% 600%;
    animation: matchBannerAnimation 7.5s linear infinite;
    opacity: 0;
    transform: scaleX(0);
    transform-origin: center;

    color: white;
    box-shadow: 0 0 15px rgba(0,0,0, 0.2);

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  @keyframes matchBannerAnimation {
    0% {
      background-position: 5% 50%;
    }
    100% {
      background-position: 100% 50%;
    }
  }

  .matchmaking-banner>svg {
    height: 3.75vh;
  }

  .matchmaking-banner>.icon-load {
    margin-left: 0.25%;
    animation: loadAnimation 5s linear infinite;
  }

  .matchmaking-banner>.cancel-button {
    position: absolute;
    right: 2.5%;
    cursor: pointer;
  }

  @keyframes loadAnimation {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .matchmaking-banner>p {
    font-size: max(1.85vh, 2vw);
    font-weight: 600;
    margin-right: 0.25%;
    width: max-content;
    transition: width .25s;
  }

  .container-section {
    z-index: 1;
    top: 12vh;
    width: 100vw;
    position: absolute;
  }

  .container-section>.scene {
    position: fixed;
    top: 0;
    z-index: 0;
    width: 100vw;
    height: 88vh;
  }

  .container-section>img {
    height: 100vh;
    width: 100vw;
    top: 0;
    position: fixed;
    z-index: -1;
  }

  .social-widget {
    overflow-y: scroll;
    overflow-x: hidden;
    scrollbar-color: rgba(var(--link-color), 0.25);
    scrollbar-width: thin;

    height: 100vh;
    width: 300px;
    position: fixed;
    z-index: 3;
    top: 0;
    right: 0;
    transform: translateX(300px);
    background-color: rgb(var(--primary-color));
    transition: transform .2s ease-in-out;
    box-shadow: 0 0 15px rgba(0,0,0, 0.2);
  }

  @media screen and (max-width: 800px) {
    .matchmaking-banner>svg {
      height: 2.75vh;
    }
  }

</style>