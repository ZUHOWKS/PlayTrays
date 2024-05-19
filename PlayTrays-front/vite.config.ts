import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {viteStaticCopy} from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  const plugins: any[] = [
    vue()
  ];
  if (command === 'build') {
    plugins.push(
        viteStaticCopy({
          targets: [
            {
              src: 'src/scene_assets',
              dest: 'src' // Cela conservera le chemin src/assets dans le dossier dist
            }
          ]
        })
    );
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.jpg'],
  }


})
