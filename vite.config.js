import { defineConfig } from 'vite';
import { handleApiAndMedia } from './src/server/api-handler.js';

// Betech Digital × Gánh Mưu Sinh API & Media Middleware (reloaded)
function betechGmsApiPlugin() {
  return {
    name: 'betech-gms-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleApiAndMedia(req, res);
          if (!handled) next();
        } catch (err) {
          next(err);
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleApiAndMedia(req, res);
          if (!handled) next();
        } catch (err) {
          next(err);
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [betechGmsApiPlugin()],
  server: {
    port: 4173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
