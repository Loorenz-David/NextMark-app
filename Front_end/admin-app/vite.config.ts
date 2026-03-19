import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [ react(), tailwindcss(), svgr() ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@app', replacement: path.resolve(__dirname, 'src/shared') },
      { find: '@features', replacement: path.resolve(__dirname, 'src/features') },
      { find: '@packages', replacement: path.resolve(__dirname, '../packages') },
      { find: /^zustand$/, replacement: path.resolve(__dirname, './node_modules/zustand/esm/index.mjs') },
      { find: /^zustand\/react$/, replacement: path.resolve(__dirname, './node_modules/zustand/esm/react.mjs') },
      { find: /^zustand\/react\/shallow$/, replacement: path.resolve(__dirname, './node_modules/zustand/esm/react/shallow.mjs') },
      { find: /^react$/, replacement: path.resolve(__dirname, './node_modules/react/index.js') },
      { find: /^react\/jsx-runtime$/, replacement: path.resolve(__dirname, './node_modules/react/jsx-runtime.js') },
      { find: /^framer-motion$/, replacement: path.resolve(__dirname, './node_modules/framer-motion/dist/es/index.mjs') },
      { find: '@shared-utils', replacement: path.resolve(__dirname, '../packages/shared-utils/src') },
      { find: '@shared-domain', replacement: path.resolve(__dirname, '../packages/shared-domain') },
      { find: '@shared-api', replacement: path.resolve(__dirname, '../packages/shared-api') },
      { find: '@shared-store', replacement: path.resolve(__dirname, '../packages/shared-store/src') },
      { find: '@shared-optimistic', replacement: path.resolve(__dirname, '../packages/shared-optimistic/src') },
      { find: '@shared-message-handler', replacement: path.resolve(__dirname, '../packages/shared-message-handler/src') },
      { find: '@shared-google-maps', replacement: path.resolve(__dirname, '../packages/shared-google-maps') },
      { find: '@shared-icons', replacement: path.resolve(__dirname, '../packages/shared-icons') },
      { find: '@shared-realtime', replacement: path.resolve(__dirname, '../packages/shared-realtime/src') },
      { find: '@shared-inputs', replacement: path.resolve(__dirname, '../packages/shared-inputs/src') },
      { find: /^socket\.io-client$/, replacement: path.resolve(__dirname, './node_modules/socket.io-client/build/esm/index.js') },
    ],
  },
  server:{
    host:true
  }
})
