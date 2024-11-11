/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ['es2020', 'edge88', 'chrome87'],
    outDir: '../src/main/resources/templates',
  },
  server: {
    port: 5173,
  },
  plugins: [
    splitVendorChunkPlugin(),
    react(),
    wyw({
      include: ['./src/**/*.{ts,tsx}'],
      babelOptions: {
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
      },
    }),
  ],
});
