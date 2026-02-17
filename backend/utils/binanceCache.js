//backend/utils/binanceCache.js (UPDATED WITH API KEYS)
import NodeCache from "node-cache";
import axios from "axios";
import crypto from "crypto";

// Cache for 60 seconds
const priceCache = new NodeCache({ stdTTL: 60 });

const BINANCE_API = "https://api.binance.com/api/v3";
const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Binance API credentials from env
const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_SECRET = process.env.BINANCE_SECRET;

/**
 * Generate Binance API signature
 */
const generateSignature = (queryString) => {
    return crypto
        .createHmac("sha256", BINANCE_SECRET)
        .update(queryString)
        .digest("hex");
};

/**
 * Get crypto price from Binance with caching (PUBLIC - NO AUTH)
 */
export const getBinancePrice = async (symbol) => {
    const cacheKey = `binance_${symbol}`;
    const cached = priceCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const response = await axios.get(`${BINANCE_API}/ticker/price`, {
            params: { symbol: symbol.toUpperCase() },
            timeout: 5000,
        });

        const price = parseFloat(response.data.price);
        priceCache.set(cacheKey, price);
        return price;
    } catch (error) {
        console.error(`Binance API error for ${symbol}:`, error.message);
        throw new Error(`Failed to fetch price for ${symbol}`);
    }
};

/**
 * Get multiple crypto prices at once (PUBLIC - NO AUTH)
 */
export const getMultipleBinancePrices = async (symbols) => {
    try {
        const promises = symbols.map((symbol) => getBinancePrice(symbol));
        const prices = await Promise.all(promises);

        return symbols.reduce((acc, symbol, index) => {
            acc[symbol] = prices[index];
            return acc;
        }, {});
    } catch (error) {
        console.error("Multiple Binance prices error:", error.message);
        throw error;
    }
};

/**
 * Get Binance Spot Account Balances (PRIVATE - REQUIRES API KEY)
 * This fetches your actual holdings from Binance
 */
export const getBinanceSpotBalances = async () => {
    if (!BINANCE_API_KEY || !BINANCE_SECRET) {
        throw new Error("Binance API credentials not configured");
    }

    try {
        const timestamp = Date.now();
        const queryString = `timestamp=${timestamp}`;
        const signature = generateSignature(queryString);

        const response = await axios.get(`${BINANCE_API}/account`, {
            params: {
                timestamp,
                signature,
            },
            headers: {
                "X-MBX-APIKEY": BINANCE_API_KEY,
            },
            timeout: 10000,
        });

        // Filter out zero balances
        const balances = response.data.balances.filter(
            (balance) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
        );

        return balances.map((balance) => ({
            asset: balance.asset,
            free: parseFloat(balance.free),
            locked: parseFloat(balance.locked),
            total: parseFloat(balance.free) + parseFloat(balance.locked),
        }));
    } catch (error) {
        console.error("Binance account balances error:", error.response?.data || error.message);
        throw new Error("Failed to fetch Binance balances");
    }
};

/**
 * Get crypto price from CoinGecko (fallback)
 */
export const getCoinGeckoPrice = async (coinId) => {
    const cacheKey = `coingecko_${coinId}`;
    const cached = priceCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const response = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
                ids: coinId.toLowerCase(),
                vs_currencies: "usd",
            },
            timeout: 5000,
        });

        const price = response.data[coinId.toLowerCase()]?.usd || 0;
        priceCache.set(cacheKey, price);
        return price;
    } catch (error) {
        console.error(`CoinGecko API error for ${coinId}:`, error.message);
        throw new Error(`Failed to fetch price for ${coinId}`);
    }
};

/**
 * Get Mutual Fund NAV from MFApi.in
 */
export const getMutualFundNAV = async (schemeCode) => {
    const cacheKey = `mf_${schemeCode}`;
    const cached = priceCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const response = await axios.get(
            `https://api.mfapi.in/mf/${schemeCode}`,
            { timeout: 5000 }
        );

        const navData = response.data?.data?.[0];
        if (!navData || !navData.nav) {
            throw new Error("NAV data not found");
        }

        const nav = parseFloat(navData.nav);
        priceCache.set(cacheKey, nav);
        return nav;
    } catch (error) {
        console.error(`MF API error for ${schemeCode}:`, error.message);
        throw new Error(`Failed to fetch NAV for scheme ${schemeCode}`);
    }
};

/**
 * Clear cache (useful for testing)
 */
export const clearCache = () => {
    priceCache.flushAll();
};