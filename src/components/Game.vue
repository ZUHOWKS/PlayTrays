<script setup lang="ts">

import {computed, onMounted, type Ref, ref} from "vue";
import {useWindowSize} from "@vueuse/core";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

const experience = ref<HTMLCanvasElement | null>(null);
let renderer: Ref<THREE.WebGLRenderer | null> = ref(null);
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let scene: THREE.Scene;

declare var require: any;

let {width, height} = useWindowSize(); // Permet d'obtenir la taille de l'écran actuel pour le responsive
const aspectRatio = computed(() => width.value / height.value) // rapport largeur/hauteur


/**
 * Permet de setup la scène 3D avec ThreeJS
 */
function init(): void {

  scene = new THREE.Scene();  // Créer la scène

  camera = new THREE.PerspectiveCamera(80, aspectRatio.value, 0.1, 1000); // Définie la perspective de la caméra
  camera.position.set(0, 0, 15); // set camera position

  // setup de la lumière ambiante
  setupLight()

  // setup des modèles de la scène.
  setupModels()

  // methode executé lors de la montée du composant dans le DOM.
  onMounted(() => {
    // configuration du renderer
    renderer.value = new THREE.WebGLRenderer({
      canvas: experience.value as unknown as HTMLCanvasElement,
      antialias: true, // affine le rendu des bordures des élèments de la scène
    });

    // configuration du pixel ration en fonction de la fenêtre
    renderer.value.setPixelRatio(window.devicePixelRatio)

    // aj
    controls = new OrbitControls(camera, renderer.value.domElement);
    controls.enableDamping = true; // autoriser le control de la caméra (distance, rotation, déplacement)
    controls.enablePan = false //désactiver les déplacements de la caméra
    controls.minDistance = 2.5;
    controls.maxDistance = 220;

    controls.update(); // actualise les paramètres associés au control de la caméra

    // Actualisation des paramètres du renderer et de la caméra
    updateCamera();
    updateRenderer();

    // Lancer la boucle
    loop();

    renderer.value.render(scene, camera);
  })

  const loop = () => {
    updateRender(); // mise à jour du rendu
    controls.update(); // ajoute un control fluide
    requestAnimationFrame(loop); // permet de relancer la fonction à la frame suivante
  }
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
  camera.aspect = aspectRatio.value; // actualisation du rapport d'aspect de la caméra
  camera.updateProjectionMatrix(); // mettre à jour la matrice de projection de la caméra
}

/**
 * Mettre à jour le rendu
 */
function updateRender(): void {
  if (renderer.value != null) {
    renderer.value.render(scene, camera);
  }
}

/**
 * Setup les paramètres de la lumière
 */
function setupLight(): void {
  const light: THREE.AmbientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );


}

/**
 * Setup les models de la scène
 */
function setupModels(): void {

  const skyBox: THREE.Mesh = new THREE.Mesh(
      new THREE.BoxGeometry( 850, 850, 800),
      getSkyMeshMaterial("stormydays")
  )

  scene.add(skyBox); // ajout de la SkyBox

  // cube de test
  const cube: THREE.Mesh  = new THREE.Mesh(
      new THREE.BoxGeometry( 150, 1, 150),
      new THREE.MeshBasicMaterial( { color: 0xffffff } )
  );

  scene.add(cube); // ajout du cube à la scène


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

</template>

<style scoped>
.game {
  width: 100vw !important;
  height: 100vh !important;
  overflow: hidden;
}
</style>