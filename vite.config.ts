import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function adminUrlBannerPlugin(): Plugin {
  return {
    name: 'admin-url-banner',
    configureServer(server) {
      const originalPrintUrls = server.printUrls.bind(server)
      server.printUrls = () => {
        originalPrintUrls()
        let port = server.config.server.port || 5176
        const address = server.httpServer?.address()
        if (address && typeof address === 'object') {
          port = address.port
        }
        console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mAdmin:\x1b[0m   \x1b[36mhttp://localhost:${port}/admin/login\x1b[0m`)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), adminUrlBannerPlugin()],
  server: {
    port: 5176,
  },
})

