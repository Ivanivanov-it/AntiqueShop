// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BalkanAuctionImportError,
  importBalkanAuctionProduct,
} from './src/lib/balkan-auction.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cmsLogPath = path.join(__dirname, '.cms-proxy.log');
const optimizeImagesScript = path.join(__dirname, 'scripts', 'optimize-images.js');
const MAX_LOG_BODY_LENGTH = 4000;

function formatLogBody(buffer) {
  if (!buffer.length) return '';

  return buffer
    .toString('utf8')
    .replace(/\s+/g, ' ')
    .slice(0, MAX_LOG_BODY_LENGTH);
}

function cmsProxyLogger() {
  let refreshRunning = false;
  let refreshQueued = false;

  const runCmsRefresh = (server) => {
    if (refreshRunning) {
      refreshQueued = true;
      return;
    }

    refreshRunning = true;
    execFile(process.execPath, [optimizeImagesScript], { cwd: __dirname }, (error, stdout, stderr) => {
      refreshRunning = false;

      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (error) console.error(`CMS refresh failed: ${error.message}`);

      setTimeout(() => {
        server.restart?.();
      }, 500);

      if (refreshQueued) {
        refreshQueued = false;
        runCmsRefresh(server);
      }
    });
  };

  return {
    name: 'cms-proxy-logger',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url || '/', 'http://localhost').pathname;
        if (pathname !== '/api/import-balkanauction') {
          next();
          return;
        }

        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.setHeader('cache-control', 'no-store');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Методът не е позволен.' }));
          return;
        }

        try {
          const chunks = [];
          let bodyLength = 0;

          for await (const chunk of req) {
            bodyLength += chunk.length;
            if (bodyLength > 8192) {
              res.statusCode = 413;
              res.end(JSON.stringify({ error: 'Заявката е прекалено голяма.' }));
              return;
            }
            chunks.push(chunk);
          }

          const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          const product = await importBalkanAuctionProduct(body?.url);
          res.statusCode = 200;
          res.end(JSON.stringify(product));
        } catch (error) {
          if (error instanceof SyntaxError) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Невалидна заявка.' }));
            return;
          }

          if (error instanceof BalkanAuctionImportError) {
            res.statusCode = error.status;
            res.end(JSON.stringify({ error: error.message }));
            return;
          }

          console.error('Unexpected BalkanAuction import error', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Продуктът не може да бъде импортиран.' }));
        }
      });

      server.middlewares.use((req, res, next) => {
        if (req.method === 'POST' && req.url?.startsWith('/api/cms-refresh')) {
          res.statusCode = 202;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
          fs.appendFile(cmsLogPath, `${new Date().toISOString()} POST /api/cms-refresh status=202 remote=${req.socket.remoteAddress}\n`, () => {});
          runCmsRefresh(server);
          return;
        }

        if (!req.url?.startsWith('/api/v1')) {
          next();
          return;
        }

        const startedAt = Date.now();
        const chunks = [];
        const responseChunks = [];
        const originalWrite = res.write.bind(res);
        const originalEnd = res.end.bind(res);

        res.write = (chunk, ...args) => {
          if (chunk) responseChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return originalWrite(chunk, ...args);
        };

        res.end = (chunk, ...args) => {
          if (chunk) responseChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return originalEnd(chunk, ...args);
        };

        req.on('data', chunk => chunks.push(chunk));

        res.on('finish', () => {
          const bodySize = chunks.reduce((total, chunk) => total + chunk.length, 0);
          const requestBody = formatLogBody(Buffer.concat(chunks));
          const shouldLogResponseBody = !requestBody.includes('"action":"getMedia"');
          const responseBody = shouldLogResponseBody ? formatLogBody(Buffer.concat(responseChunks)) : '';
          const line = [
            new Date().toISOString(),
            req.method,
            req.url,
            `status=${res.statusCode}`,
            `ms=${Date.now() - startedAt}`,
            `bytes=${bodySize}`,
            `remote=${req.socket.remoteAddress}`,
            `ua=${req.headers['user-agent'] || ''}`,
            requestBody ? `request=${requestBody}` : '',
            responseBody ? `response=${responseBody}` : '',
          ].join(' ');

          fs.appendFile(cmsLogPath, `${line}\n`, () => {});

          if (res.statusCode === 200 && requestBody.includes('"action":"persistEntry"')) {
            runCmsRefresh(server);
          }
        });

        res.on('close', () => {
          if (res.writableEnded) return;

          const bodySize = chunks.reduce((total, chunk) => total + chunk.length, 0);
          const line = [
            new Date().toISOString(),
            req.method,
            req.url,
            'closed_before_finish',
            `ms=${Date.now() - startedAt}`,
            `bytes=${bodySize}`,
            `remote=${req.socket.remoteAddress}`,
            `ua=${req.headers['user-agent'] || ''}`,
          ].join(' ');

          fs.appendFile(cmsLogPath, `${line}\n`, () => {});
        });

        next();
      });
    },
  };
}

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  i18n: {
    defaultLocale: 'bg',
    locales: ['bg', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    server: {
      watch: {
        ignored: [
          '**/src/content/antiques/**',
          '**/public/images/uploads/**',
          '**/public/images/cms-uploads/**',
          '**/public/images/optimized/**',
          '**/src/generated/**',
        ],
      },
      proxy: {
        '/api/v1': {
          target: 'http://127.0.0.1:8081',
          changeOrigin: true,
          timeout: 120000,
          proxyTimeout: 120000,
        },
      },
    },
    plugins: [cmsProxyLogger(), tailwindcss()],
  },
});
