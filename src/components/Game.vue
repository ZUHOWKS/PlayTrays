<script setup lang="ts">

import {computed, onMounted, type Ref, ref} from "vue";
import {useWindowSize} from "@vueuse/core";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import HUD from "@/components/game/HUD.vue";
import TrayGame from "@/modules/game/TrayGame";
import {io, type Socket} from "socket.io-client";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass.js";


let gameTray: TrayGame; // Game Manager

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

    // Connection à la partie + setup du jeu
    establishConnectionWithGameServer("checkers");

    // Actualisation des paramètres du renderer et de la caméra
    updateCamera();
    updateRenderer();

    // Lancer la boucle
    animate();

    renderer.value.render(scene, camera.value);

    // event listener
    addEventListener('mousemove', (e) => onPointerMove(e));
    addEventListener('dblclick', (e) => selectOnClick(e));
  })
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
  const light: THREE.AmbientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 4 );
  scene.add( directionalLight );
  scene.add(light);


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
 * @param game
 */
function establishConnectionWithGameServer(game: string): void {
  ws = io("http://localhost:25525", {
    auth: {
      user: "ZUHOWKS",
      lobbyUUID: "testCheckers"
    }
  });

  gameTray = new TrayGame("checkers-test", "waiting", "ZUHOWKS", ws, game, scene, camera, controls);
  gameTray.setup();
}

/**
 * Permet d'obtenir le matériel texturé de la SkyBox
 * @param skyTextureName Nom du pack de la texture pour la skyBox
 */
function getSkyMeshMaterial(skyTextureName: string): THREE.MeshBasicMaterial[] {

  const textureSkyPath: string = "/src/assets/textures/sky/";

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

function onPointerMove(event: any) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function renderOutlineSelection() {

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera( pointer, camera.value );

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObject( scene, true );
  if (intersects.length > 0) {
    let obj: THREE.Object3D = intersects[0].object;
    while (obj.parent && obj.parent != scene) {
      obj = obj.parent
    }
    outlinePass.selectedObjects = [];
    outlinePass.selectedObjects.push(obj);
  }


}

function selectOnClick(event: any) {
  const intersects = raycaster.intersectObject( scene, true );
  if (intersects.length > 0 && gameTray.controller) {
    let obj: THREE.Object3D = intersects[0].object;
    while (obj.parent && obj.parent != scene) {
      obj = obj.parent
    }
    if (!(obj.name.includes("Tray") || obj.name.includes("skyBox"))) {
      if (gameTray.controller.isActuator(obj.name)) {

      } else {

        gameTray.controller.unselectObject();
        gameTray.controller.selectObject(obj.name);
        gameTray.controller.showSelectedObjectActuators();
      }
    } else {
      gameTray.controller.defaultCamera();
    }
  }
}

function animate() {

  renderOutlineSelection();

  controls.value.update(); // met à jour le contrôle
  updateRender(); // mise à jour du rendu
  requestAnimationFrame(animate); // permet de relancer la fonction à la frame suivante
}

init(); //lancer l'initialisation de la scène Three

</script>

<template>
  <div class="game">
    <canvas ref="experience"/>
  </div>
  <HUD class="hud"></HUD>
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
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}
</style>