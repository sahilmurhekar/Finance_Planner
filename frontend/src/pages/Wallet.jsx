//frontend/src/pages/Wallet.jsx
import React, { useEffect, useState } from 'react';
import { Copy, LogOut, Loader, ExternalLink, RotateCw } from 'lucide-react';
import QR from 'qrcode';
import { useWalletStore } from '../store/useWalletStore';

const Wallet = () => {
  const {
    address,
    isConnected,
    isConnecting,
    chainName,
    nativeBalance,
    tokenBalances,
    error,
    isLoading,
    connectWallet,
    disconnectWallet,
    clearError,
    refreshBalances,
  } = useWalletStore();

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (isConnected && !nativeBalance) {
      refreshBalances();
    }
  }, [isConnected, nativeBalance]);

  // Generate QR code when showQR or address changes
  useEffect(() => {
    if (showQR && address) {
      QR.toDataURL(address, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 256,
      })
        .then(setQrDataUrl)
        .catch((err) => console.error('QR Code generation error:', err));
    }
  }, [showQR, address]);

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const openEtherscan = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, '_blank');
    }
  };

  // NOT CONNECTED VIEW
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
            <p className="text-gray-600">Connect your MetaMask wallet</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 font-bold text-lg"
              >
                ×
              </button>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-3xl">🦊</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Connect MetaMask</h2>
              <p className="text-gray-600 text-sm">
                Click the button below to connect your MetaMask wallet and view your assets.
              </p>
            </div>

            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 mx-auto text-sm"
            >
              {isConnecting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>Connect MetaMask</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CONNECTED VIEW
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
          <p className="text-gray-600">Your MetaMask wallet</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={clearError} className="text-red-600 hover:text-red-800 font-bold text-lg">
              ×
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* Address Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Connected Wallet</p>
                <p className="text-gray-900 text-lg font-bold font-mono">{truncateAddress(address)}</p>
                <p className="text-gray-600 text-sm mt-1">
                  Network: <span className="text-blue-600 font-semibold">{chainName}</span>
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={copyAddress}
                  className={`p-2 rounded transition ${copiedAddress
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={openEtherscan}
                  className="p-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={disconnectWallet}
                  className="p-2 rounded bg-red-50 hover:bg-red-100 text-red-600 transition"
                  title="Disconnect"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
            {copiedAddress && <p className="text-green-600 text-xs mt-1">✓ Address copied</p>}
          </div>

          {/* QR Code */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full text-left flex items-center justify-between p-3 hover:bg-gray-50 rounded transition"
            >
              <h3 className="text-base font-semibold text-gray-900">Receive Funds</h3>
              <span className={`transform transition ${showQR ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showQR && (
              <div className="p-4 bg-gray-50 rounded mt-3 flex flex-col items-center">
                <p className="text-gray-600 text-xs mb-3">Scan to send funds to this address</p>
                <div className="bg-white p-2 rounded mb-2">
                  {qrDataUrl && (
                    <img src={qrDataUrl} alt="QR Code" style={{ width: 200, height: 200 }} />
                  )}
                </div>
                <p className="text-gray-600 text-xs text-center break-all font-mono">{address}</p>
              </div>
            )}
          </div>

          {/* ETH Balance */}
          {nativeBalance && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">ETH Balance</p>
                  <p className="text-3xl font-bold text-gray-900">{nativeBalance} ETH</p>
                </div>
                <button
                  onClick={refreshBalances}
                  disabled={isLoading}
                  className="p-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition disabled:opacity-50"
                  title="Refresh"
                >
                  <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* Token Balances */}
          {tokenBalances.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Token Balances</h3>
              <div className="space-y-2">
                {tokenBalances.map((token) => (
                  <div
                    key={token.address}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                  >
                    <div>
                      <p className="text-gray-900 font-semibold">{token.symbol}</p>
                      <p className="text-gray-600 text-xs">{token.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-mono font-semibold">{token.balance}</p>
                      <p className="text-gray-600 text-xs">{token.symbol}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tokenBalances.length === 0 && nativeBalance && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">No token balances found. You only have ETH.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;