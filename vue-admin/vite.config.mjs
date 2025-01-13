import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
  return {
    plugins: [vue()],
    base: './',
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    resolve: {
      alias: [
        // webpack path resolve to vitejs
        {
          find: /^~(.*)$/,
          replacement: '$1',
        },
        {
          find: '@/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
        {
          find: '@',
          replacement: path.resolve(__dirname, '/src'),
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.scss'],
    },
    server: {
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',  // 你的本地服务器地址
          changeOrigin: true,
          pathRewrite: {
            '^/api': ''  // 将 /api 前缀去掉
          }
        }
      },
    },
    // devServer: {
    //   port: 8080,
    //   proxy: {
    //     '/api': {
    //       target: 'http://localhost:3001',  // 你的本地服务器地址
    //       changeOrigin: true,
    //       pathRewrite: {
    //         '^/api': ''  // 将 /api 前缀去掉
    //       }
    //     }
    //   }
    // },
  }
})
