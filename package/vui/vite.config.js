import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      outputDir: 'dist/esm',
    }),
    dts({
      outputDir: 'dist/lib',
    }),
  ],
  publicDir: './src/public',
  resolve: {
    alias: {
      '@': './',
      '@src': './src',
      '@component': './src/component',
      '@service': './src/service',
    },
  },
  build: {
    target: 'modules',
    outDir: 'dist',
    assetsDir: 'dist/assets',
    minify: true,
    // cssCodeSplit: true,
    rollupOptions: {
      external: ['vue'],
      input: 'src/index.ts',
      output: [
        {
          format: 'es',
          entryFileNames: 'index.js',
          dir: 'dist/esm',
        },
        {
          format: 'cjs',
          entryFileNames: 'index.js',
          dir: 'dist/lib',
        },
      ],
    },
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
    },
  },
})
