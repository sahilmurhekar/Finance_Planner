//frontend/src/pages/Wallet.jsx
import React, { useEffect, useState } from 'react';
import { RotateCw, TrendingUp, TrendingDown, Search, AlertCircle } from 'lucide-react';
import { useWalletStore } from '../store/useWalletStore';

const Wallet = () => {
  const {
    holdings,
    totalUsdValue,
    isLoading,
    error,
    lastUpdated,
    fetchHoldings,
    clearError,
  } = useWalletStore();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHoldings();
  }, []);

  // Filter holdings by search
  const filtered = holdings.filter((h) =>
    h.asset.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatUsd = (val) =>
    val >= 0.01
      ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `<$0.01`;

  const formatQty = (val) => {
    const n = Number(val);
    if (n === 0) return '0';
    if (n < 0.0001) return n.toExponential(4);
    return n.toLocaleString('en-US', { maximumFractionDigits: 6 });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Crypto Holdings</h1>
            <p className="text-gray-500 text-sm">
              Fetched from your Binance Spot account
              {lastUpdated && (
                <span className="ml-2 text-gray-400">
                  · Last updated {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchHoldings}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition text-sm"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">Failed to fetch holdings</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Total Portfolio Value Card */}
        {totalUsdValue > 0 && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 shadow-sm">
            <p className="text-yellow-900 text-sm font-medium mb-1">Total Portfolio Value</p>
            <p className="text-4xl font-bold text-black">
              {formatUsd(totalUsdValue)}
            </p>
            <p className="text-yellow-800 text-sm mt-1">
              {holdings.length} asset{holdings.length !== 1 ? 's' : ''} with balance
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && holdings.length === 0 && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-16 mb-1" />
                      <div className="h-3 bg-gray-100 rounded w-24" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-14" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Holdings List */}
        {!isLoading || holdings.length > 0 ? (
          <>
            {/* Search bar */}
            {holdings.length > 5 && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search asset…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                />
              </div>
            )}

            {filtered.length === 0 && !isLoading && !error && (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500 text-sm">
                  {holdings.length === 0
                    ? 'No holdings found in your Binance Spot account.'
                    : 'No assets match your search.'}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {filtered.map((h) => (
                <div
                  key={h.asset}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-yellow-300 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between">
                    {/* Left: icon + name */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-sm">
                        {h.asset.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{h.asset}</p>
                        <p className="text-gray-500 text-xs">
                          Qty: <span className="font-mono">{formatQty(h.free)}</span>
                          {Number(h.locked) > 0 && (
                            <span className="ml-2 text-orange-500">
                              +{formatQty(h.locked)} locked
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right: USD value + price */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatUsd(h.usdValue)}</p>
                      {h.price && (
                        <p className="text-gray-400 text-xs">
                          @ {formatUsd(h.price)} / {h.asset}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar: % of portfolio */}
                  {totalUsdValue > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Portfolio share</span>
                        <span className="text-xs text-gray-500 font-medium">
                          {((h.usdValue / totalUsdValue) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-yellow-400 h-1.5 rounded-full"
                          style={{ width: `${Math.min((h.usdValue / totalUsdValue) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Wallet;