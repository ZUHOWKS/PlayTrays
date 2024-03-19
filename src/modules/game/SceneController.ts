import {PerspectiveCamera, Scene} from "three";
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import type {Ref} from "vue";

export default class SceneController {
    scene: Scene;
    cameraRef: Ref<PerspectiveCamera>;
    orbitControlsRef: Ref<OrbitControls | null>;

    constructor(scene: Scene, cameraRef: Ref<PerspectiveCamera>, orbitControlsRef: Ref<OrbitControls | null>) {
        this.scene = scene;
        this.cameraRef = cameraRef;
        this.orbitControlsRef = orbitControlsRef;
    }


}