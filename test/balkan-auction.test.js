import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BalkanAuctionImportError,
  htmlToPlainText,
  importBalkanAuctionProduct,
  parseBalkanAuctionUrl,
} from '../src/lib/balkan-auction.js';

const AUCTION_HTML = `
  <html><body>
    <script>
      window.auctionData = {
        "id": 8192359,
        "title": {
          "bg": "Османски сребърен джобен часовник J.Dent London",
          "en": "Ottoman Silver Pocket Watch J.Dent London"
        },
        "type": "fixedPrice",
        "startPrice": {"amount":"600","currency":{"code":"EUR"}},
        "currentPrice": {"amount":"600","currency":{"code":"EUR"}},
        "buyNowPrice": {"amount":"600","currency":{"code":"EUR"}}
      };
    </script>
    <iframe class="auction-description" src="/auctionDescriptionFrame.php?id=8192359&amp;lang=en"></iframe>
  </body></html>
`;

const DESCRIPTION_HTML = `
  <html><body>
    <div style="margin: 15px 0;">
      <p>Старинен сребърен Османски джобен часовник J.Dent London с ключ.</p>
      <p>&nbsp;</p>
      <p>Часовникът работи перфектно.</p>
    </div>
    <script>throw new Error('This script must not become description text.')</script>
  </body></html>
`;

test('accepts only BalkanAuction product URLs and canonicalizes them', () => {
  assert.deepEqual(
    parseBalkanAuctionUrl('https://www.balkanauction.com/en/auction/8192359?ref=test'),
    {
      auctionId: '8192359',
      pageUrl: 'https://balkanauction.com/en/auction/8192359',
    },
  );

  assert.throws(
    () => parseBalkanAuctionUrl('https://balkanauction.com.example/en/auction/8192359'),
    BalkanAuctionImportError,
  );
  assert.throws(
    () => parseBalkanAuctionUrl('https://balkanauction.com/en/search?q=8192359'),
    BalkanAuctionImportError,
  );
});

test('turns the separate description document into plain text', () => {
  assert.equal(
    htmlToPlainText(DESCRIPTION_HTML),
    'Старинен сребърен Османски джобен часовник J.Dent London с ключ.\nЧасовникът работи перфектно.',
  );
});

test('imports only title, description, and EUR price', async () => {
  const requestedUrls = [];
  const fakeFetch = async url => {
    requestedUrls.push(url);
    if (url === 'https://balkanauction.com/en/auction/8192359') {
      return new Response(AUCTION_HTML, { headers: { 'content-type': 'text/html' } });
    }
    if (url === 'https://balkanauction.com/auctionDescriptionFrame.php?id=8192359&lang=en') {
      return new Response(DESCRIPTION_HTML, { headers: { 'content-type': 'text/html' } });
    }
    return new Response('not found', { status: 404 });
  };

  assert.deepEqual(
    await importBalkanAuctionProduct(
      'https://balkanauction.com/en/auction/8192359',
      fakeFetch,
    ),
    {
      title: 'Османски сребърен джобен часовник J.Dent London',
      description: 'Старинен сребърен Османски джобен часовник J.Dent London с ключ.\nЧасовникът работи перфектно.',
      price: 600,
    },
  );
  assert.deepEqual(requestedUrls, [
    'https://balkanauction.com/en/auction/8192359',
    'https://balkanauction.com/auctionDescriptionFrame.php?id=8192359&lang=en',
  ]);
});
