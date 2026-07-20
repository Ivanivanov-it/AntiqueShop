const BALKAN_AUCTION_ORIGIN = 'https://balkanauction.com';
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;

export class BalkanAuctionImportError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = 'BalkanAuctionImportError';
    this.status = status;
  }
}

export function parseBalkanAuctionUrl(value) {
  let url;

  try {
    url = new URL(String(value || '').trim());
  } catch {
    throw new BalkanAuctionImportError('Въведете валиден BalkanAuction URL.', 400);
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!['balkanauction.com', 'www.balkanauction.com'].includes(hostname)) {
    throw new BalkanAuctionImportError('URL адресът трябва да е от balkanauction.com.', 400);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new BalkanAuctionImportError('URL адресът трябва да използва HTTP или HTTPS.', 400);
  }

  const match = url.pathname.match(/^\/(?:[a-z]{2}\/)?auction\/(\d+)\/?$/i);
  if (!match) {
    throw new BalkanAuctionImportError('URL адресът трябва да сочи към BalkanAuction продукт.', 400);
  }

  return {
    auctionId: match[1],
    pageUrl: `${BALKAN_AUCTION_ORIGIN}/en/auction/${match[1]}`,
  };
}

function extractJsonAssignment(html, variableName) {
  const assignmentStart = html.indexOf(variableName);
  if (assignmentStart === -1) return null;

  const jsonStart = html.indexOf('{', assignmentStart + variableName.length);
  if (jsonStart === -1) return null;

  let depth = 0;
  let quoted = false;
  let escaped = false;

  for (let index = jsonStart; index < html.length; index += 1) {
    const character = html[index];

    if (quoted) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        quoted = false;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(jsonStart, index + 1));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function decodeHtmlEntities(value) {
  const namedEntities = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] === '#') {
      const isHex = code[1].toLowerCase() === 'x';
      const number = Number.parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
    }

    return namedEntities[code.toLowerCase()] ?? entity;
  });
}

export function htmlToPlainText(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;

  return decodeHtmlEntities(
    body
      .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p\s*>/gi, '\n')
      .replace(/<\/div\s*>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\u00a0/g, ' ')
    .split(/\r?\n/)
    .map(line => line.replace(/[\t ]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

function getBulgarianTitle(auctionData) {
  const title = auctionData?.title;
  if (typeof title === 'string') return title.trim();
  return String(title?.bg || title?.en || title?.ro || title?.el || '').trim();
}

function getEuroPrice(auctionData, html) {
  const candidates = [
    auctionData?.currentPrice,
    auctionData?.buyNowPrice,
    auctionData?.startPrice,
  ];

  for (const candidate of candidates) {
    if (candidate?.currency?.code === 'EUR') {
      const amount = Number.parseFloat(String(candidate.amount).replace(',', '.'));
      if (Number.isFinite(amount)) return amount;
    }
  }

  const visiblePrice = html.match(
    /(?:Price:\s*)?<span\b[^>]*class=["'][^"']*price[^"']*["'][^>]*>[\s\S]{0,200}?€(?:\s|&nbsp;)*<span\b[^>]*class=["'][^"']*int-part[^"']*["'][^>]*>\s*([\d., ]+)\s*<\/span>\s*<sup\b[^>]*>\s*(\d{1,2})/i,
  );

  if (visiblePrice) {
    const whole = visiblePrice[1].replace(/[ ,.]/g, '');
    const amount = Number(`${whole}.${visiblePrice[2].padEnd(2, '0')}`);
    if (Number.isFinite(amount)) return amount;
  }

  return null;
}

function getDescriptionUrl(html, auctionId) {
  const framePath = html.match(/["']([^"']*auctionDescriptionFrame\.php\?[^"']+)["']/i)?.[1];
  const descriptionUrl = new URL(
    framePath ? decodeHtmlEntities(framePath) : `/auctionDescriptionFrame.php?id=${auctionId}&lang=en`,
    BALKAN_AUCTION_ORIGIN,
  );

  if (
    descriptionUrl.origin !== BALKAN_AUCTION_ORIGIN ||
    descriptionUrl.pathname !== '/auctionDescriptionFrame.php' ||
    descriptionUrl.searchParams.get('id') !== auctionId
  ) {
    throw new BalkanAuctionImportError('BalkanAuction върна невалиден адрес за описанието.');
  }

  descriptionUrl.searchParams.set('lang', 'en');
  return descriptionUrl.href;
}

async function fetchHtml(url, fetchImpl) {
  let response;

  try {
    response = await fetchImpl(url, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'AntiqueShop CMS importer/1.0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new BalkanAuctionImportError('BalkanAuction не отговори. Опитайте отново.');
  }

  if (!response.ok) {
    throw new BalkanAuctionImportError(`BalkanAuction върна грешка ${response.status}.`);
  }

  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
    throw new BalkanAuctionImportError('Отговорът от BalkanAuction е прекалено голям.');
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_RESPONSE_BYTES) {
    throw new BalkanAuctionImportError('Отговорът от BalkanAuction е прекалено голям.');
  }

  return new TextDecoder().decode(buffer);
}

export async function importBalkanAuctionProduct(value, fetchImpl = fetch) {
  const { auctionId, pageUrl } = parseBalkanAuctionUrl(value);
  const pageHtml = await fetchHtml(pageUrl, fetchImpl);
  const auctionData = extractJsonAssignment(pageHtml, 'window.auctionData');

  if (!auctionData || String(auctionData.id) !== auctionId) {
    throw new BalkanAuctionImportError('Продуктът не може да бъде разпознат в BalkanAuction.');
  }

  const title = getBulgarianTitle(auctionData);
  const price = getEuroPrice(auctionData, pageHtml);

  if (!title || price === null) {
    throw new BalkanAuctionImportError('Заглавието или цената не могат да бъдат извлечени.');
  }

  const descriptionHtml = await fetchHtml(getDescriptionUrl(pageHtml, auctionId), fetchImpl);
  const description = htmlToPlainText(descriptionHtml);

  if (!description) {
    throw new BalkanAuctionImportError('Описанието не може да бъде извлечено.');
  }

  return { title, description, price };
}
