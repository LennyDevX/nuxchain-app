#!/usr/bin/env node

/**
 * 🔍 UNIFIED WALLET DEBUG ANALYZER
 * 
 * Combines backend validation logic, detailed on-chain analysis, 
 * and interactive debugging for Solana wallets.
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const readline = require('readline');
require('dotenv').config();

const SOLANA_RPC = process.env.SOLANA_RPC_QUICKNODE || 'https://api.mainnet-beta.solana.com';

// ============================================================================
// CONSTANTS & RULES (Synced with Backend)
// ============================================================================
const RULES = {
    MIN_SOL_BALANCE: 0.01,
    MIN_WALLET_AGE_DAYS: 3,
    MIN_TRANSACTIONS: 1,
    LEGACY_WALLET_AGE_DAYS: 90,
    ACTIVE_WALLET_TX_THRESHOLD: 2,
    ACTIVE_WALLET_BALANCE_THRESHOLD: 0.02,
    HIGH_BALANCE_THRESHOLD: 0.1,
};

const CEX_WALLETS = {
    '5tzFkiK7jzspR9uUTi6tS9ai2LUMv87UXcrXAykyvH8': 'Binance',
    '9WzDX9Gk9y89yAyXfE7C6v6m4VvR3C6u7C6v6m4VvR3C': 'Binance 2',
    '2AQdpHJt9bmvBsT9HFrEE2r3o8Gq6fWPb82nFis2N': 'Coinbase',
    '6D4P6D4P6D4P6D4P6D4P6D4P6D4P6D4P6D4P6D4P': 'Gate.io',
};

// ============================================================================
// UTILITIES
// ============================================================================
function printDivider() { console.log('═'.repeat(80)); }
function printSection(title) { console.log(`\n📊 ${title}\n` + '─'.repeat(80)); }
function formatDate(ts) { return new Date(ts * 1000).toLocaleString(); }
function daysSince(ts) { return Math.floor((Date.now() / 1000 - ts) / (60 * 60 * 24)); }

// ============================================================================
// CORE DATA GATHERING
// ============================================================================
async function analyzeWallet(connection, walletAddress) {
    try {
        const pubkey = new PublicKey(walletAddress);

        console.log(`\n🔍 Fetching data for: ${walletAddress}...`);

        // 1. Balance
        const balanceLamports = await connection.getBalance(pubkey);
        const solBalance = balanceLamports / LAMPORTS_PER_SOL;

        // 2. Transacciones 
        const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 1000 });
        const transactionCount = signatures.length;

        let oldestTimestamp = null;
        let newestTimestamp = null;
        let walletAgeDays = 0;
        let isCEXFunded = false;
        let fundedBy = 'Unknown/Private';

        if (signatures.length > 0) {
            const validSigs = signatures.filter(s => s.blockTime);
            if (validSigs.length > 0) {
                oldestTimestamp = validSigs[validSigs.length - 1].blockTime;
                newestTimestamp = validSigs[0].blockTime;
                walletAgeDays = daysSince(oldestTimestamp);

                // CEX Funding check (Oldest Tx)
                try {
                    const tx = await connection.getParsedTransaction(validSigs[validSigs.length - 1].signature, {
                        maxSupportedTransactionVersion: 0,
                        commitment: 'confirmed'
                    });
                    if (tx && tx.transaction?.message?.accountKeys?.length > 0) {
                        const firstAccount = tx.transaction.message.accountKeys[0].pubkey.toBase58();
                        if (CEX_WALLETS[firstAccount]) {
                            isCEXFunded = true;
                            fundedBy = CEX_WALLETS[firstAccount];
                        } else {
                            fundedBy = firstAccount;
                        }
                    }
                } catch (e) { /* silent fail on tx parsing */ }
            }
        }

        // 3. Validation Logic (Mimic Backend)
        let validationStatus = '❌ REJECTED';
        let reason = 'Unknown';
        let step = 0;

        if (transactionCount > 0) {
            const effectiveMinBalance = walletAgeDays >= RULES.LEGACY_WALLET_AGE_DAYS ? 0.001 : RULES.MIN_SOL_BALANCE;

            if (solBalance < effectiveMinBalance) {
                reason = `Balance too low (${solBalance.toFixed(4)} < ${effectiveMinBalance} SOL)`;
                step = 3;
            } else if (walletAgeDays < RULES.MIN_WALLET_AGE_DAYS) {
                // Exceptions for new wallets
                if (solBalance >= RULES.HIGH_BALANCE_THRESHOLD) {
                    validationStatus = '✅ APPROVED (Exception: High Balance)';
                    reason = 'High balance bypass';
                } else if (transactionCount >= RULES.ACTIVE_WALLET_TX_THRESHOLD && solBalance >= RULES.ACTIVE_WALLET_BALANCE_THRESHOLD) {
                    validationStatus = '✅ APPROVED (Exception: Active Wallet)';
                    reason = 'Activity bypass';
                } else if (isCEXFunded) {
                    validationStatus = '✅ APPROVED (Exception: CEX Funded)';
                    reason = 'Trust bypass (CEX)';
                } else {
                    reason = `Wallet too new (${walletAgeDays}d < ${RULES.MIN_WALLET_AGE_DAYS}d)`;
                    step = 4;
                }
            } else {
                validationStatus = '✅ APPROVED';
                reason = 'Passed all standard checks';
            }
        } else {
            reason = 'No transaction history';
            step = 1;
        }

        // ============================================================================
        // OUTPUT
        // ============================================================================
        printSection('GENERAL DATA');
        console.log(`SOL Balance:    ${solBalance.toFixed(6)} SOL`);
        console.log(`Transactions:   ${transactionCount} total (fetched last 1000)`);
        console.log(`Wallet Age:     ${walletAgeDays} days`);
        console.log(`Born:           ${oldestTimestamp ? formatDate(oldestTimestamp) : 'N/A'}`);
        console.log(`Last Active:    ${newestTimestamp ? formatDate(newestTimestamp) : 'N/A'}`);
        console.log(`Funded By:      ${fundedBy} ${isCEXFunded ? '(Known CEX)' : ''}`);

        printSection('BACKEND VALIDATION SIMULATION');
        console.log(`Status:         ${validationStatus}`);
        console.log(`Reason:         ${reason}`);
        if (step > 0) console.log(`Failed Step:    ${step}`);

        if (validationStatus.includes('❌')) {
            console.log('\n💡 Tip: To pass, add more SOL or wait for the wallet to age.');
        }

    } catch (err) {
        console.error(`❌ Error analyzing wallet: ${err.message}`);
    }
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
    printDivider();
    console.log('🔍 UNIFIED WALLET DEBUG ANALYZER');
    printDivider();
    console.log(`RPC Node: ${SOLANA_RPC}`);

    const connection = new Connection(SOLANA_RPC, 'confirmed');
    const walletArg = process.argv[2];

    if (walletArg) {
        await analyzeWallet(connection, walletArg.trim());
        process.exit(0);
    }

    // Interactive Mode
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = () => {
        rl.question('\n📝 Enter wallet address (or "exit"): ', async (ans) => {
            if (ans.toLowerCase() === 'exit') process.exit(0);
            if (ans.trim()) await analyzeWallet(connection, ans.trim());
            ask();
        });
    };
    ask();
}

main();
