// backend/routes/binance.js
import express from 'express';
import crypto from 'crypto';
import https from 'https';
import NodeCache from 'node-cache';

const router = express.Router();
const priceCache = new NodeCache({ stdTTL: 30 }); // 30-second cache for prices

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Make a signed request to Binance REST API.
 * @param {string} path  e.g. '/api/v3/account'
 * @param {object} params  query params (without timestamp/signature)
 */
function binanceSigned(path, params = {}) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.BINANCE_API_KEY;
        const apiSecret = process.env.BINANCE_SECRET; // matches your .env

        if (!apiKey || !apiSecret) {
            return reject(new Error('BINANCE_API_KEY and BINANCE_SECRET must be set in .env'));
        }

        const timestamp = Date.now();
        const queryString =
            Object.entries({ ...params, timestamp })
                .map(([k, v]) => `${k}=${v}`)
                .join('&');

        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(queryString)
            .digest('hex');

        const fullQuery = `${queryString}&signature=${signature}`;
        const options = {
            hostname: 'api.binance.com',
            path: `${path}?${fullQuery}`,
            method: 'GET',
            headers: {
                'X-MBX-APIKEY': apiKey,
            },
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (parsed.code && parsed.code < 0) {
                        reject(new Error(`Binance API error ${parsed.code}: ${parsed.msg}`));
                    } else {
                        resolve(parsed);
                    }
                } catch {
                    reject(new Error('Invalid JSON from Binance'));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

/**
 * Fetch current USDT prices for a list of symbols.
 * Uses cached prices where possible.
 */
function getPrices(assets) {
    return new Promise((resolve, reject) => {
        // Stablecoins that are always $1
        const stablecoins = new Set(['USDT', 'BUSD', 'USDC', 'TUSD', 'USDP', 'DAI', 'FDUSD']);

        const prices = {};
        const toFetch = [];

        for (const asset of assets) {
            if (stablecoins.has(asset)) {
                prices[asset] = 1;
                continue;
            }
            const cached = priceCache.get(asset);
            if (cached !== undefined) {
                prices[asset] = cached;
            } else {
                toFetch.push(asset);
            }
        }

        if (toFetch.length === 0) return resolve(prices);

        // Build symbols array for batch price endpoint
        const symbols = toFetch.map((a) => `"${a}USDT"`).join(',');
        const path = `/api/v3/ticker/price?symbols=[${encodeURIComponent(symbols)}]`;

        const options = {
            hostname: 'api.binance.com',
            path,
            method: 'GET',
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    const tickers = JSON.parse(body);
                    if (!Array.isArray(tickers)) {
                        // price fetch failed — return $0 for unknowns
                        for (const a of toFetch) prices[a] = 0;
                        return resolve(prices);
                    }
                    for (const t of tickers) {
                        const asset = t.symbol.replace('USDT', '');
                        const price = parseFloat(t.price) || 0;
                        prices[asset] = price;
                        priceCache.set(asset, price);
                    }
                    // For any asset that didn't appear in tickers (no USDT pair), set to 0
                    for (const a of toFetch) {
                        if (prices[a] === undefined) prices[a] = 0;
                    }
                    resolve(prices);
                } catch {
                    for (const a of toFetch) prices[a] = 0;
                    resolve(prices);
                }
            });
        });

        req.on('error', () => {
            for (const a of toFetch) prices[a] = 0;
            resolve(prices);
        });
        req.end();
    });
}

// ─── Route ──────────────────────────────────────────────────────────────────

/**
 * GET /api/binance/holdings
 * Returns all non-zero Spot balances with USD values.
 */
router.get('/holdings', async (req, res) => {
    try {
        const account = await binanceSigned('/api/v3/account');

        // Filter to balances with any free or locked amount
        const nonZero = (account.balances || []).filter(
            (b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
        );

        if (nonZero.length === 0) {
            return res.json({ holdings: [], totalUsdValue: 0 });
        }

        const assets = nonZero.map((b) => b.asset);
        const prices = await getPrices(assets);

        let totalUsdValue = 0;
        const holdings = nonZero
            .map((b) => {
                const free = parseFloat(b.free) || 0;
                const locked = parseFloat(b.locked) || 0;
                const total = free + locked;
                const price = prices[b.asset] || 0;
                const usdValue = total * price;
                totalUsdValue += usdValue;
                return {
                    asset: b.asset,
                    free: b.free,
                    locked: b.locked,
                    total: total.toString(),
                    price,
                    usdValue,
                };
            })
            // Sort by USD value descending
            .sort((a, b) => b.usdValue - a.usdValue);

        res.json({ holdings, totalUsdValue });
    } catch (err) {
        console.error('[Binance /holdings]', err.message);
        res.status(500).json({ error: err.message || 'Failed to fetch Binance holdings' });
    }
});

/**
 * GET /api/binance/price?symbol=BTCUSDT
 * Single-symbol price (existing endpoint kept for compatibility)
 */
router.get('/price', async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'symbol is required' });

    const cached = priceCache.get(symbol);
    if (cached !== undefined) return res.json({ symbol, price: cached });

    const options = {
        hostname: 'api.binance.com',
        path: `/api/v3/ticker/price?symbol=${symbol}`,
        method: 'GET',
    };

    https.request(options, (r) => {
        let body = '';
        r.on('data', (d) => (body += d));
        r.on('end', () => {
            try {
                const data = JSON.parse(body);
                priceCache.set(symbol, data.price);
                res.json(data);
            } catch {
                res.status(500).json({ error: 'Failed to parse price' });
            }
        });
    })
        .on('error', (e) => res.status(500).json({ error: e.message }))
        .end();
});

export default router;