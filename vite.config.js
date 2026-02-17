import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: './', // Permet de charger les fichiers localement

  //*-----------------------------
    plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'textures/*',
          dest: 'textures'
        }
      ]
    })
  ],
  //----*/

  resolve: {
    alias: {
      // Alias pour Three.js
      'three': resolve('./node_modules/three'),
      'three/*': resolve('./node_modules/three/src/*'),
      'three/examples/jsm/controls/OrbitControls': resolve('./node_modules/three/examples/jsm/controls/OrbitControls.js'),
      'three/examples/jsm/*': resolve('./node_modules/three/examples/jsm/*'),
      // Alias pour vos propres modules
      '@': resolve(__dirname, './src'),
      '@classes': resolve(__dirname, './src/classes'),
      '@components': resolve(__dirname, './src/components'),
      '@utils': resolve(__dirname, './src/utils'),
      '@textures': resolve(__dirname, './textures'), // Alias pour le dossier textures
    },
  },

  build: {
    outDir: 'dist', // Dossier de sortie
    emptyOutDir: true, // Vide le dossier de sortie avant le build
    rollupOptions: {
      input: {
        // Points d'entrée : utilisez des chemins relatifs à la racine du projet
        main: resolve(__dirname, 'index.html'),
        basic: resolve(__dirname, 'basic.html'),
        snowball: resolve(__dirname, 'snowball.html'),
      },
      output: {
        entryFileNames: `assets/js/[name].js`,
        chunkFileNames: `assets/js/[name].js`,
        //assetFileNames: `assets/[ext]/[name].[ext]`,
        //--------
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.jpg') || assetInfo.name.endsWith('.png')) {
            //return `assets/textures/[name][extname]`; // Place les images dans assets/textures/
            return `textures/[name][extname]`; // Place les images dans assets/textures/
          }
          return `assets/[ext]/[name][extname]`; // Autres fichiers
        },
        //*
      },
    },
  },

  server: {
    port: 3000, // Port du serveur de développement
    open: '/index.html', // Ouvre automatiquement index.html
  },

    optimizeDeps: {
    include: ['three'],
  },
});
