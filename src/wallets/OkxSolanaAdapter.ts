import { BaseWalletAdapter, scopePollingDetectionStrategy, WalletReadyState, type WalletName, WalletError } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

export const OKX_WALLET_NAME = 'OKX Wallet' as WalletName<'OKX Wallet'>;

export class OkxWalletAdapter extends BaseWalletAdapter {
    name = OKX_WALLET_NAME;
    url = 'https://www.okx.com/web3';
    icon = '/OKXLogo.webp';
    supportedTransactionVersions = new Set(['legacy', 0] as const);

    private _publicKey: PublicKey | null = null;
    private _connecting = false;
    private _readyState: WalletReadyState = typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.NotDetected;

    constructor() {
        super();
        if (typeof window !== 'undefined') {
            this._readyState = WalletReadyState.Installed; // Default to Installed to show it on mobile

            // Still poll to see if it's actually installed as extension
            scopePollingDetectionStrategy(() => {
                const okxwallet = (window as any).okxwallet;
                if (okxwallet?.solana) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this.readyState !== WalletReadyState.Installed) throw new Error('Wallet not installed');

            this._connecting = true;
            const solana = (window as any).okxwallet?.solana;

            if (!solana) {
                // If on mobile and no provider, attempt deep link
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (isMobile) {
                    const dappUrl = encodeURIComponent(window.location.href);
                    const deepLink = `https://www.okx.com/download?deeplink=okx://main/web3/dapp/details?dappUrl=${dappUrl}`;
                    window.location.href = deepLink;
                    // We don't throw here immediately to avoid UI error flash before redirect
                    return;
                }
                throw new Error('OKX Wallet Solana provider not found. Please open in OKX App.');
            }
            this._publicKey = new PublicKey(solana.publicKey.toString());
            this.emit('connect', this._publicKey);
        } catch (error: any) {
            const walletError = new WalletError(error?.message || error);
            this.emit('error', walletError);
            throw walletError;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const solana = (window as any).okxwallet?.solana;
        if (solana && typeof solana.disconnect === 'function') {
            await solana.disconnect();
        }
        this._publicKey = null;
        this.emit('disconnect');
    }

    async sendTransaction(transaction: Transaction | VersionedTransaction, connection: any, options: any = {}): Promise<string> {
        try {
            const solana = (window as any).okxwallet?.solana;
            if (!solana) throw new Error('Wallet not connected');

            const signed = await this.signTransaction(transaction);
            const rawTransaction = (signed as any).serialize();
            return await connection.sendRawTransaction(rawTransaction, options);
        } catch (error: any) {
            const walletError = new WalletError(error?.message || error);
            this.emit('error', walletError);
            throw walletError;
        }
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        const solana = (window as any).okxwallet?.solana;
        if (!solana || typeof solana.signTransaction !== 'function') throw new Error('Wallet not connected');
        return await solana.signTransaction(transaction);
    }

    async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
        const solana = (window as any).okxwallet?.solana;
        if (!solana || typeof solana.signAllTransactions !== 'function') throw new Error('Wallet not connected');
        return await solana.signAllTransactions(transactions);
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        const solana = (window as any).okxwallet?.solana;
        if (!solana || typeof solana.signMessage !== 'function') throw new Error('Wallet not connected');
        const { signature } = await solana.signMessage(message);
        return signature;
    }
}
