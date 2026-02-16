//frontend/src/store/useWalletStore.js
import { create } from 'zustand';
import { BrowserProvider } from 'ethers';

const CHAIN_NAMES = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon',
    56: 'BSC Mainnet',
};

const COMMON_TOKENS = [
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
    { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
];

export const useWalletStore = create((set, get) => ({
    // State
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    chainName: '',
    nativeBalance: null,
    tokenBalances: [],
    error: null,
    isLoading: false,

    // Connect MetaMask
    connectWallet: async () => {
        set({ isConnecting: true, error: null });
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask not installed. Please install it.');
            }

            // Request accounts
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            const address = accounts[0];

            // Get chain ID
            const chainIdHex = await window.ethereum.request({
                method: 'eth_chainId',
            });
            const chainId = parseInt(chainIdHex, 16);

            set({
                address,
                isConnected: true,
                chainId,
                chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
                isConnecting: false,
            });

            // Fetch balances
            await get().fetchNativeBalance();
            await get().fetchTokenBalances();

            // Listen for account changes
            window.ethereum.on('accountsChanged', (newAccounts) => {
                if (newAccounts.length === 0) {
                    get().disconnectWallet();
                } else {
                    set({ address: newAccounts[0] });
                    get().fetchNativeBalance();
                    get().fetchTokenBalances();
                }
            });

            // Listen for network changes
            window.ethereum.on('chainChanged', (newChainId) => {
                const id = parseInt(newChainId, 16);
                set({ chainId: id, chainName: CHAIN_NAMES[id] || `Chain ${id}` });
                get().fetchNativeBalance();
                get().fetchTokenBalances();
            });
        } catch (err) {
            set({
                error: err.message || 'Failed to connect MetaMask',
                isConnecting: false,
                isConnected: false,
            });
        }
    },

    // Disconnect
    disconnectWallet: () => {
        set({
            address: null,
            isConnected: false,
            nativeBalance: null,
            tokenBalances: [],
            chainId: null,
            chainName: '',
            error: null,
        });
        if (window.ethereum) {
            window.ethereum.removeAllListeners?.();
        }
    },

    // Fetch ETH balance
    fetchNativeBalance: async () => {
        try {
            const { address } = get();
            if (!address || !window.ethereum) throw new Error('Not connected');

            const provider = new BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(address);
            const balanceInEth = (Number(balance) / 1e18).toFixed(6);
            set({ nativeBalance: balanceInEth, error: null });
        } catch (err) {
            console.error('Balance fetch error:', err);
        }
    },

    // Fetch token balances
    fetchTokenBalances: async () => {
        try {
            const { address } = get();
            if (!address || !window.ethereum) throw new Error('Not connected');

            const provider = new BrowserProvider(window.ethereum);
            const balances = [];

            for (const token of COMMON_TOKENS) {
                try {
                    const result = await provider.call({
                        to: token.address,
                        data: `0x70a08231000000000000000000000000${address.slice(2)}`,
                    });

                    if (result) {
                        const balanceValue = BigInt(result);
                        const balanceInUnits = Number(balanceValue) / 10 ** token.decimals;

                        if (balanceInUnits > 0) {
                            balances.push({
                                symbol: token.symbol,
                                name: token.symbol,
                                balance: balanceInUnits.toFixed(6),
                                decimals: token.decimals,
                                address: token.address,
                            });
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to fetch ${token.symbol}`);
                }
            }
            set({ tokenBalances: balances, error: null });
        } catch (err) {
            console.error('Token fetch error:', err);
        }
    },

    // Refresh balances
    refreshBalances: async () => {
        set({ isLoading: true });
        await get().fetchNativeBalance();
        await get().fetchTokenBalances();
        set({ isLoading: false });
    },

    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
}));