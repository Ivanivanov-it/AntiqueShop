// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const optimizeImagesScript = path.join(__dirname, 'scripts', 'optimize-images.js');

function imageOptimizationWatcher() {
  let timer;
  let running = false;
  let queued = false;

  const runOptimizer = () => {
    if (running) {
      queued = true;
      return;
    }

    running = true;
    execFile(process.execPath, [optimizeImagesScript], { cwd: __dirname }, (error, stdout, stderr) => {
      running = false;

      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (error) console.error(`Image optimization failed: ${error.message}`);

      if (queued) {
        queued = false;
        runOptimizer();
      }
    });
  };

  const scheduleOptimizer = () => {
    clearTimeout(timer);
    timer = setTimeout(runOptimizer, 300);
  };

  return {
    name: 'image-optimization-watcher',
    configureServer(server) {
      const watchedPaths = [
        path.join(__dirname, 'src', 'content', 'antiques'),
        path.join(__dirname, 'public', 'images', 'uploads'),
      ];
      const isWatchedChange = (file) => {
        const normalizedFile = path.resolve(file);
        return watchedPaths.some((watchedPath) => normalizedFile.startsWith(path.resolve(watchedPath) + path.sep));
      };
      const scheduleWatchedOptimizer = (file) => {
        if (isWatchedChange(file)) scheduleOptimizer();
      };

      server.watcher.add(watchedPaths);
      server.watcher.on('add', scheduleWatchedOptimizer);
      server.watcher.on('change', scheduleWatchedOptimizer);
      server.watcher.on('unlink', scheduleWatchedOptimizer);
      runOptimizer();
    },
  };
}

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: 'bg',
    locales: ['bg', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [imageOptimizationWatcher(), tailwindcss()],
  },
});
