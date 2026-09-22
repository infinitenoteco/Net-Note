import tailwindcss from '@tailwindcss/vite';

import react from '@vitejs/plugin-react';

import path from 'path';

import {defineConfig} from 'vite';

const GOOGLE_APPS_SCRIPT_HOST = 'https://script.google.com';

const GOOGLE_APPS_SCRIPT_PATH =
  '/macros/s/AKfycbyjFiCgkm8RuQ40zZvVXA5XvO9rrNHlMnX3CyzWI9R8ESGbXkEJd181C2lmWAnoMNbVcw/exec';

export default defineConfig(() => {

  return {

    plugins: [react(), tailwindcss()],

    resolve: {

      alias: {

        '@': path.resolve(__dirname, '.'),

      },

    },

    server: {

      // HMR is disabled in AI Studio via DISABLE_HMR env var.

      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.

      hmr: process.env.DISABLE_HMR !== 'true',

      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.

      watch: process.env.DISABLE_HMR === 'true' ? null : {},

      proxy: {

        '/api': {

          target: GOOGLE_APPS_SCRIPT_HOST,

          changeOrigin: true,

          secure: true,

          followRedirects: true,

          rewrite: () => GOOGLE_APPS_SCRIPT_PATH,

        },

      },

    },

  };

});