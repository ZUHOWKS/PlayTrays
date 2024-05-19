import {type GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

export class ModelLoader {

    public static MODEL_DIR: string = '/src/scene_assets/models/'

    public static GLTF_LOADER: GLTFLoader = new GLTFLoader();

    public static async loadGLTFSceneModel(loader: GLTFLoader, model: string): Promise<THREE.Object3D> {
        return new Promise((resolve, reject) => {
            loader.load(
                new URL(this.MODEL_DIR + model, import.meta.url).href,
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
    };

    /**
     * Permet d'obtenir le matériel texturé de la SkyBox
     * @param skyTextureName Nom du pack de la texture pour la skyBox
     */
    public static getSkyMeshMaterial(skyTextureName: string): THREE.MeshBasicMaterial[] {

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
}

/**
 * Charger la scène 3D du modèle.
 * @param loader Loader utilisé pour charger les modèles .glb/.gltf
 * @param model chemin d'accès au modèle depuis le dossier "models/"
 */
