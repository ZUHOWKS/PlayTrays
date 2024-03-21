import {Object3D, PerspectiveCamera, Scene} from "three";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Ref} from "vue";
import {type GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

export default class SceneController {
    scene: Scene;
    cameraRef: Ref<PerspectiveCamera>;
    orbitControlsRef: Ref<OrbitControls | null>;

    /**
     *
     * @param scene La scene utilisé sur la vue
     * @param cameraRef La caméra sous variable Vue
     * @param orbitControlsRef Les contrôles orbitales de la caméra sous variable Vue
     */
    constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls | null>) {
        this.scene = scene;
        this.cameraRef = cameraRef;
        this.orbitControlsRef = orbitControlsRef;
    }

    /**
     * Obtenir la caméra
     */
    getCamera(): PerspectiveCamera {
        return this.cameraRef.value
    }

    /**
     * Obtenir les contrôles orbitales de la caméra.
     */
    getOrbitControls(): OrbitControls | null {
        return this.orbitControlsRef.value
    }

    /**
     * Charger la scène 3D du modèle.
     * @param loader Loader utilisé pour charger les modèles .glb/.gltf
     * @param model chemin d'accès au modèle depuis le dossier "models/"
     */
    async loadGLTFSceneModel(loader: GLTFLoader, model: string): Promise<Object3D> {
        return new Promise((resolve, reject) => {
            loader.load(
                new URL("/src/assets/models/" + model, import.meta.url).href,
                function (gltf: GLTF): void {
                    resolve(gltf.scene);
                },
                undefined,
                function (error: any): void {
                    console.error(error);
                    reject(error);
                }
            );
        });
    }


}