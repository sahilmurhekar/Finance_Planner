//backend/utils/binanceCache.js
import NodeCache from "node-cache";
import axios from "axios";

// Cache for 60 seconds
const priceCache = new NodeCache({ stdTTL: 60 });

const BINANCE_API = "https://api.binance.com/api/v3";
const COINGECKO_API = "https://api.coingecko.com/api/v3";

/**
 * Get crypto price from Binance with caching
 * @param {string} symbol - Trading pair (e.g., "BTCUSDT")
 * @returns {Promise<number>} - Current price
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
 * Get multiple crypto prices at once
 * @param {string[]} symbols - Array of trading pairs
 * @returns {Promise<Object>} - Object with symbol: price mapping
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
 * Get crypto price from CoinGecko (fallback)
 * @param {string} coinId - CoinGecko coin ID (e.g., "bitcoin")
 * @returns {Promise<number>} - Current price in USD
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
 * @param {string} schemeCode - MF scheme code
 * @returns {Promise<number>} - Current NAV
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