<script setup lang="ts">

import {computed, onMounted, type Ref, ref} from "vue";
import {useWindowSize} from "@vueuse/core";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import TrayGame from "@/modules/game/TrayGame";
import {io, type Socket} from "socket.io-client";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass.js";
import type {UserInterface} from "@/modules/utils/UserInterface";
import {useRouter} from "vue-router";
import AccountServices from "@/services/account_services";
import type PTObject from "@/modules/game/scene/objects/PTObject";
import type {LobbyInterface} from "@/modules/utils/LobbyInterface";
import LoaderFiller from "@/components/utils/LoaderFiller.vue";
import CheckersHUD from "@/components/game/CheckersHUD.vue";
import GMenu from "@/components/game/GMenu.vue";

const router = useRouter();
if (!AccountServices.isLogged()) AccountServices.logout(router);

const showLoader: Ref<boolean> = ref(true);
const showGMenu: Ref<boolean> = ref(false);
const gMenu: Ref<HTMLElement | null> = ref(null);

let gameTray: TrayGame; // Game Manager
const user: Ref<UserInterface> = ref({
  id: -1,
  username: '',
  points: -1,
  updatedAt: '',
  createdAt: ''
})

const experience: Ref<HTMLCanvasElement | null> = ref<HTMLCanvasElement | null>(null); // VueJS variable, canvas de la scène 3d
let renderer: Ref<THREE.WebGLRenderer>; // Renderer de la caméra
let camera: Ref<THREE.PerspectiveCamera>; // Caméra (vue du joueur)
let controls: Ref<OrbitControls>; // Contrôles orbitaux de la caméra
let scene: THREE.Scene; // Scène 3D
let composer: EffectComposer;
let outlinePass: OutlinePass;

let ws: Socket; // WebSocket pour se connecter au serveur jeu

let {width, height} = useWindowSize(); // Permet d'obtenir la taille de l'écran actuel pour le responsive
const aspectRatio = computed(() => width.value / height.value) // rapport largeur/hauteur

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

/**
 * Permet de setup la scène 3D avec ThreeJS
 */
function init(): void {
  scene = new THREE.Scene();  // Créer la scène

  camera = ref(new THREE.PerspectiveCamera(75, aspectRatio.value, 0.1, 1000)); // Définie la perspective de la caméra
  camera.value.position.set(0, 0, 15); // set camera position

  // setup de la lumière ambiante
  setupLight()

  // setup des modèles de la scène.
  setupModels()

  // methode executé lors de la montée du composant dans le DOM.
  onMounted(() => {

    const escapePressedEvent = new KeyboardEvent("keydown",{
      'key': 'Escape'
    });
    document.dispatchEvent(escapePressedEvent);

    // configuration du renderer
    renderer = ref(new THREE.WebGLRenderer({
      canvas: experience.value as unknown as HTMLCanvasElement,
      powerPreference: "high-performance",
      antialias: false,
    }));

    // configuration du pixel ration en fonction de la fenêtre
    renderer.value.setPixelRatio(window.devicePixelRatio);

    // setup composer
    composer = new EffectComposer(renderer.value);
    composer.addPass(new RenderPass(scene, camera.value));
    composer.setSize(width.value, height.value);

    // outline object
    outlinePass = new OutlinePass(new THREE.Vector2(width.value, height.value), scene, camera.value);
    outlinePass.edgeStrength = 6.0;
    outlinePass.edgeGlow = 0.9;
    outlinePass.edgeThickness = 2.0;
    outlinePass.pulsePeriod = 3.0;
    outlinePass.visibleEdgeColor.set(0x1ba9e7);

    composer.addPass(outlinePass);


    // Paramètre par défaut du contrôle de la caméra
    controls = ref(new OrbitControls(camera.value, renderer.value.domElement));
    controls.value.listenToKeyEvents(window);
    controls.value.keys = {
      LEFT: 'KeyA', //left arrow
      UP: 'KeyW', // up arrow
      RIGHT: 'KeyD', // right arrow
      BOTTOM: 'KeyS' // down arrow
    }
    controls.value.keyPanSpeed = 60;
    controls.value.saveState();
    controls.value.update();

    // Actualisation des paramètres du renderer et de la caméra
    updateCamera();
    updateRenderer();

    // Lancer la boucle
    animate();

    renderer.value.render(scene, camera.value);

    // event listener
    addEventListener('mousemove', (e) => onPointerMove(e));
    addEventListener('click', () => {
      if (!showGMenu.value) selectOnClick()
    });
    addEventListener('touchstart', () => {
      if (!showGMenu.value) selectOnClick()
    });
    addEventListener('keydown', (e) => showGMenuOnPress(e))
  });

  AccountServices.getLobby().then((responseLobby) => {
    const lData: LobbyInterface = responseLobby.data as LobbyInterface;
    console.log(lData);
    AccountServices.getUserInfos().then((responseUser) => {
      const uData: UserInterface = responseUser.data as UserInterface;
      user.value.id = uData.id;
      user.value.username = uData.username;
      user.value.points = uData.points;
      user.value.updatedAt = uData.updatedAt;
      user.value.createdAt = uData.createdAt;

      establishConnectionWithGameServer(lData.lobby, lData.game, lData.serverURL)
    })
  }).catch(() => router.push('/app'))

}

/**
 * Mettre à jour le renderer
 */
function updateRenderer(): void {
  renderer.value.setSize(width.value, height.value); //
  composer.setSize(width.value, height.value);

}

/**
 * Mettre à jour la caméra
 */
function updateCamera(): void {
  camera.value.aspect = aspectRatio.value; // actualisation du rapport d'aspect de la caméra
  camera.value.updateProjectionMatrix(); // mettre à jour la matrice de projection de la caméra
}

/**
 * Mettre à jour le rendu
 */
function updateRender(): void {
  renderer.value.render(scene, camera.value);
  composer.render(500);
}

/**
 * Setup les paramètres de la lumière
 */
function setupLight(): void {
  const ambientLight: THREE.AmbientLight = new THREE.AmbientLight( 0xffffff ); // soft white light
  const hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0x080820, 1 );
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 2);

  const target = new THREE.Object3D;
  target.position.set(0, 0, 0);
  directionalLight.target = target;


  scene.add(ambientLight);
  scene.add(hemisphereLight);

  for (let i: number = -1; i <= 1; i+=2) {
    const _directionalLight = directionalLight.clone();
    _directionalLight.position.set(i*20, 75, 20 * i);

    scene.add(_directionalLight);
  }

}

/**
 * Setup les models de la scène
 */
function setupModels(): void {
  const skyBox: THREE.Mesh = new THREE.Mesh(
      new THREE.BoxGeometry( 900, 900, 900),
      getSkyMeshMaterial("anime")
  )
  skyBox.name = "skyBox";
  scene.add(skyBox); // ajout de la SkyBox
}

/**
 * Établir la connection avec le serveur jeu + la partie
 *
 * @param uuid
 * @param game
 * @param url
 */
function establishConnectionWithGameServer(uuid: string, game: string,  url: string): void {
  console.log(uuid, game, url)
  ws = io(url, {
    auth: {
      user: user.value.id,
      token: AccountServices.getToken(),
      lobbyUUID: uuid
    }
  });

  ws.on('connect_error', () => router.push('/app'))
  ws.on('disconnect', () => router.push('/app'))

  gameTray = new TrayGame(game, "waiting", user, ws, game, scene, camera, controls);
  gameTray.setup(showLoader);
}

/**
 * Permet d'obtenir le matériel texturé de la SkyBox
 * @param skyTextureName Nom du pack de la texture pour la skyBox
 */
function getSkyMeshMaterial(skyTextureName: string): THREE.MeshBasicMaterial[] {

  const textureSkyPath: string = "/src/scene_assets/textures/sky/";

  // chargement des textures
  const textures: THREE.Texture[] = [
      new THREE.TextureLoader().load(new URL(textureSkyPath + skyTextureName + "/" + skyTextureName + "_ft.jpg", import.meta.url).href),
      new THREE.TextureLoader().load(new URL(textureSkyPath + skyTextureName + "/" + skyTextureName + "_bk.jpg", import.meta.url).href),
      new THREE.TextureLoader().load(new URL(textureSkyPath + skyTextureName + "/" + skyTextureName + "_up.jpg", import.meta.url).href),
      new THREE.TextureLoader().load(new URL(textureSkyPath + skyTextureName + "/" + skyTextureName + "_dn.jpg", import.meta.url).href),
      new THREE.TextureLoader().load(new URL(textureSkyPath + skyTextureName + "/" + skyTextureName + "_rt.jpg", import.meta.url).href),
      new THREE.TextureLoader().load(new URL(textureSkyPath + skyTextureName + "/" + skyTextureName + "_lf.jpg", import.meta.url).href),
  ]

  // matériel texturé pour l'intérieur des faces de la SkyBox
  let meshMaterials: THREE.MeshBasicMaterial[] = []
  textures.forEach((texture: THREE.Texture) => {
    meshMaterials.push(new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide}))
  })

  return meshMaterials;
}

/**
 * Actualise la position du pointeur.
 *
 * @param event
 */
function onPointerMove(event: MouseEvent) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

/**
 * Réalise le rendu des bordures de sélection lorsque la souris passe sur un objet.
 */
function renderOutlineSelection() {

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera( pointer, camera.value );

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObject( scene, true );
  if (intersects.length > 0) {
    let obj: THREE.Object3D = intersects[0].object;

    // remonte jusqu'à l'objet parent pour prendre l'objet entièrement.
    while (obj.parent && !(obj.parent == scene || obj.name.includes('parent-select'))) {
      obj = obj.parent
    }
    outlinePass.selectedObjects = [];
    if (gameTray) {
      const _object: PTObject | undefined = gameTray.controller?.getObject(obj.name);
      if (_object && _object.selectable) {
        outlinePass.selectedObjects.push(obj);
      }
    }
  }
}

/**
 * Permet de sélectionné un objet de la scène lorsqu'il est clické.
 */
function selectOnClick() {

  // liste les objets potentiellement sélectionné par la souris (index 0, l'objet au premier plan, ect...)
  const intersects = raycaster.intersectObject( scene, true );

  if (intersects.length > 0 && gameTray.controller) {

    // objet au premier plan
    let obj: THREE.Object3D = intersects[0].object;

    // remonte jusqu'à l'objet parent pour prendre l'objet entièrement.
    while (obj.parent && !(obj.parent == scene || obj.name.includes('parent-select'))) {
      obj = obj.parent
    }

    // s'il ne s'agit pas du plateau ou de la skyBox
    if (!(obj.name.includes("Tray") || obj.name.includes("skyBox"))) {
      if (gameTray.controller.isActuator(obj.name)) {
        gameTray.controller.selectActuator(obj.name);
      } else {

        gameTray.controller.unselectObject();
        gameTray.controller.selectObject(obj.name);
        gameTray.controller.showSelectedObjectActuators();
      }
    } else if (obj.name.includes("Tray")) { // effet de caméra remise à défaut
      gameTray.controller.defaultCamera();
    } else { // désélectionné tout
      gameTray.controller.unselectAll();
    }
  }
}

/**
 * Boucle qui rafraîchie le rendu de la scène.
 */
function animate() {

  if (!showGMenu.value) renderOutlineSelection();

  controls.value.update(); // met à jour le contrôle
  updateRender(); // mise à jour du rendu
  requestAnimationFrame(animate); // permet de relancer la fonction à la frame suivante
}

function showGMenuOnPress (event: KeyboardEvent | null) {
  if (event && event.key === 'Escape') {
    showGMenu.value = !showGMenu.value;
  } else if (!event) {
    showGMenu.value = false;
  }
}


function leaveParty() {
  if (gameTray) gameTray.ws.emit('leave party', (error: any, response: any) => {
   if (response.status == 200) ws.disconnect();
  })
}


init(); //lancer l'initialisation de la scène Three

</script>

<template>
  <LoaderFiller :show-loader="showLoader"/>
  <GMenu ref="gMenu" v-if="showGMenu" :leave-party="leaveParty" :show-g-menu-on-press="showGMenuOnPress"/>
  <div class="game">
    <canvas ref="experience"/>
  </div>

  <div class="hud user-unselect-any">
    <CheckersHUD v-if="gameTray && gameTray.game == 'checkers'"></CheckersHUD>
  </div>

</template>

<style scoped>
.game {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.game canvas {
  width: 100%;
  height: 100%;
}

.hud {
  top: 0;
  left: 0;
  position: fixed;
  overflow: hidden;
  z-index: 1;
}

</style>