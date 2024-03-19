<script setup lang="ts">

import {computed, onMounted, type Ref, ref, watch} from "vue";
  import {useWindowSize} from "@vueuse/core";
  import {BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer} from "three";
  import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

  const experience = ref<HTMLCanvasElement | null>(null);
  let renderer: Ref<WebGLRenderer | null> = ref(null);
  let camera: PerspectiveCamera;
  let controls: OrbitControls;
  let scene: Scene;

  let {width, height} = useWindowSize(); // Permet d'obtenir la taille de l'écran actuel pour le responsive
  const aspectRatio = computed(() => width.value / height.value) // rapport largeur/hauteur


/**
 * Permet de setup la scène 3D avec ThreeJS
 */
function setupThree() {

    scene = new Scene();  // Créer la scène

    camera = new PerspectiveCamera(80, aspectRatio.value, 0.1, 1000); // Définie la perspective de la caméra
    camera.position.set(0,0, 5); // set camera position

    // cube de test
    const cube = new Mesh(
        new BoxGeometry( 1, 1, 1 ),
        new MeshBasicMaterial( { color: 0xffffff } )
    );
    scene.add( cube ); // ajout du cube à la scène

    // methode executé lors de la montée du composant dans le DOM.
    onMounted(() => {
      //
      renderer.value = new WebGLRenderer({
        canvas: experience.value as unknown as HTMLCanvasElement,
        antialias: true,
      });
      renderer.value.setPixelRatio(window.devicePixelRatio)

      controls = new OrbitControls( camera, renderer.value.domElement );
      controls.enableDamping = true;
      controls.update();

      updateCamera();
      updateRenderer();
      loop();

      renderer.value.render(scene, camera);
    })

    const loop = () => {
      render();
      requestAnimationFrame(loop);
    }
  }

/**
 * Mettre à jour le renderer
 */
function updateRenderer() {
  if (renderer.value != null) {
    renderer.value.setSize(width.value, height.value); //
  }

}

/**
 * Mettre à jour la caméra
 */
function updateCamera() {
  camera.aspect = aspectRatio.value; // actualisation du rapport d'aspect de la caméra
  camera.updateProjectionMatrix(); // mettre à jour la matrice de projection de la caméra
}

/**
 * Mettre à jour le rendu
 */
function render() {
  if (renderer.value != null) {
    renderer.value.render(scene, camera);
  }
}

setupThree();

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