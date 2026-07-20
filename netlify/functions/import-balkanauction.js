import {
  BalkanAuctionImportError,
  importBalkanAuctionProduct,
} from '../../src/lib/balkan-auction.js';

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'cache-control': 'no-store',
    },
  });
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json({ error: 'Методът не е позволен.' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Невалидна заявка.' }, 400);
  }

  try {
    return json(await importBalkanAuctionProduct(body?.url));
  } catch (error) {
    if (error instanceof BalkanAuctionImportError) {
      return json({ error: error.message }, error.status);
    }

    console.error('Unexpected BalkanAuction import error', error);
    return json({ error: 'Продуктът не може да бъде импортиран.' }, 500);
  }
}

export const config = {
  path: '/api/import-balkanauction',
};
