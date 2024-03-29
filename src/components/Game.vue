<script setup lang="ts">

import {computed, onMounted, type Ref, ref} from "vue";
import {useWindowSize} from "@vueuse/core";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import HUD from "@/components/game/HUD.vue";
import TrayGame from "@/modules/game/TrayGame";
import {io} from "socket.io-client";

let gameTray: TrayGame; // Game Manager

const experience: Ref<HTMLCanvasElement | null> = ref<HTMLCanvasElement | null>(null);
let renderer: Ref<THREE.WebGLRenderer>;
let camera: Ref<THREE.PerspectiveCamera>;
let controls: Ref<OrbitControls | null> = ref<OrbitControls | null>(null);
let scene: THREE.Scene

let {width, height} = useWindowSize(); // Permet d'obtenir la taille de l'écran actuel pour le responsive
const aspectRatio = computed(() => width.value / height.value) // rapport largeur/hauteur
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



  const loop = () => {
    updateRender(); // mise à jour du rendu

    if (controls.value != null) {
      controls.value.update(); // ajoute un control fluide
    }

    requestAnimationFrame(loop); // permet de relancer la fonction à la frame suivante
  }

  // methode executé lors de la montée du composant dans le DOM.
  onMounted(() => {
    // configuration du renderer
    renderer = ref(new THREE.WebGLRenderer({
      canvas: experience.value as unknown as HTMLCanvasElement,
      antialias: true, // affine le rendu des bordures des élèments de la scène
    }));

    // configuration du pixel ration en fonction de la fenêtre
    renderer.value.setPixelRatio(window.devicePixelRatio);

    // Paramètre par défaut du contrôle de la caméra
    controls.value = new OrbitControls(camera.value, renderer.value.domElement);
    controls.value.enableDamping = true; // autoriser le contrôle de la caméra (distance, rotation, déplacement)
    controls.value.enablePan = false //désactiver les déplacements de la caméra
    controls.value.minDistance = 2.5;
    controls.value.maxDistance = 220;
    controls.value.update(); // actualise les paramètres associés au control de la caméra

    // test
    const socketAdonis = io("localhost:25525", {
      auth: {
        identifier: "Abc",
        key: "Abc"
      }
    });

    const ws = io("localhost:25525", {
      auth: {
        user: "ZUHOWKS",
        lobbyUUID: "testCheckers"
      }
    });

    socketAdonis.emit("create lobby", "testCheckers", "checkers", "public", (err: any, response: any) => {
      if (err) {
        console.log(err);
      } else {
        console.log(response);
        //socket.connect();
      }
    });



    gameTray = new TrayGame("checkers-test", "waiting", "ZUHOWKS", ws, "checkers", scene, camera, controls);
    gameTray.setup();

    // Actualisation des paramètres du renderer et de la caméra
    updateCamera();
    updateRenderer();

    // Lancer la boucle
    loop();

    renderer.value.render(scene, camera.value);
  })
}

/**
 * Mettre à jour le renderer
 */
function updateRenderer(): void {
  if (renderer.value != null) {
    renderer.value.setSize(width.value, height.value); //
  }

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
  if (renderer.value != null) {
    renderer.value.render(scene, camera.value);
  }
}

/**
 * Setup les paramètres de la lumière
 */
function setupLight(): void {
  const light: THREE.AmbientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
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

  scene.add(skyBox); // ajout de la SkyBox


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