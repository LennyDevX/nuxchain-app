/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║   NUX TOKEN — POST-PRESALE DISTRIBUTION SCRIPT                        ║
 * ║                                                                        ║
 * ║  Reads all confirmed purchases from Firestore and sends NUX tokens     ║
 * ║  to each buyer's Solana wallet. Marks each purchase as "distributed".  ║
 * ║                                                                        ║
 * ║  Run AFTER Tier 2 ends (≥ March 22, 2026).                            ║
 * ║  Can be run multiple times safely — skips already distributed records. ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 *
 * Prerequisites:
 *   - PRIVATE_KEY_SOLANA in .env (deployer holds 100M NUX)
 *   - VITE_NUX_MINT_ADDRESS in .env
 *   - VITE_SOLANA_RPC_QUICKNODE in .env
 *   - serviceAccountKey.json in project root (Firebase Admin)
 *
 * Usage:
 *   npm run distribute:nux              (dry run — shows what WOULD be sent)
 *   npm run distribute:nux -- --execute (live — sends tokens on-chain)
 */

import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bs58 from 'bs58';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import {
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const DRY_RUN    = !process.argv.includes('--execute');
const RPC_URL    = process.env.VITE_SOLANA_RPC_QUICKNODE || 'https://api.mainnet-beta.solana.com';
const MINT_ADDR  = process.env.VITE_NUX_MINT_ADDRESS!;
const PRIV_KEY   = process.env.PRIVATE_KEY_SOLANA!;
const DECIMALS   = 6;
const COLLECTION = 'launchpadPurchases';

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../../../serviceAccountKey.json');
const RESULT_FILE = path.join(__dirname, '../distribute-result.json');

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function log(msg: string)  { console.log(msg); }
function warn(msg: string) { console.warn(`⚠️  ${msg}`); }

// ─── FIREBASE INIT ────────────────────────────────────────────────────────────
function initFirebase() {
  if (getApps().length > 0) return getFirestore();
  const sa = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
  initializeApp({ credential: cert(sa), projectId: sa.project_id });
  return getFirestore();
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log(`║   NUX DISTRIBUTION  ${DRY_RUN ? '(DRY RUN — no tokens sent)' : '⚡ LIVE MODE'}${DRY_RUN ? '' : '             '}   ║`);
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  if (DRY_RUN) {
    log('ℹ️  Running in DRY RUN mode. Pass --execute to send tokens for real.\n');
  }

  // --- Validate env ---
  if (!MINT_ADDR) throw new Error('❌ Missing VITE_NUX_MINT_ADDRESS in .env');
  if (!PRIV_KEY)  throw new Error('❌ Missing PRIVATE_KEY_SOLANA in .env');
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    throw new Error(`❌ serviceAccountKey.json not found at ${SERVICE_ACCOUNT_PATH}`);
  }

  // --- Load payer wallet ---
  const secretKeyBytes = bs58.decode(PRIV_KEY.trim());
  const payer = Keypair.fromSecretKey(new Uint8Array(secretKeyBytes));
  log(`👛 Deployer wallet : ${payer.publicKey.toBase58()}`);

  const connection = new Connection(RPC_URL, 'confirmed');
  const balance    = await connection.getBalance(payer.publicKey);
  log(`💰 SOL balance     : ${(balance / LAMPORTS_PER_SOL).toFixed(6)} SOL`);

  const mintPubkey = new PublicKey(MINT_ADDR);
  log(`🪙  NUX Mint        : ${MINT_ADDR}\n`);

  // --- Fetch confirmed purchases from Firestore ---
  const db   = initFirebase();
  const snap = await db
    .collection(COLLECTION)
    .where('status', '==', 'confirmed')
    .get();

  if (snap.empty) {
    log('✅ No pending purchases to distribute. All caught up!');
    return;
  }

  log(`📋 Found ${snap.docs.length} confirmed purchase(s) to distribute.\n`);

  // --- Aggregate by wallet (handle multiple purchases from same wallet) ---
  const map = new Map<string, { totalNux: number; docIds: string[] }>();
  for (const doc of snap.docs) {
    const d = doc.data();
    const wallet: string = d.wallet;
    const nux: number    = Number(d.nuxAmount) || 0;
    if (!map.has(wallet)) {
      map.set(wallet, { totalNux: 0, docIds: [] });
    }
    const entry = map.get(wallet)!;
    entry.totalNux += nux;
    entry.docIds.push(doc.id);
  }

  log(`👥 Unique wallets  : ${map.size}\n`);
  log('─'.repeat(60));

  // --- Get deployer's ATA (source) ---
  const payerATA = await getAssociatedTokenAddress(mintPubkey, payer.publicKey);
  log(`🏦 Deployer ATA    : ${payerATA.toBase58()}`);

  const results: {
    wallet: string;
    nuxAmount: number;
    txSignature: string | null;
    status: 'distributed' | 'failed' | 'dry_run';
    error?: string;
  }[] = [];

  let successCount  = 0;
  let failCount     = 0;
  let totalNuxSent  = 0;

  for (const [wallet, { totalNux, docIds }] of map.entries()) {
    log(`\n→ ${wallet.slice(0, 8)}...${wallet.slice(-4)}`);
    log(`  NUX to send: ${totalNux.toLocaleString()} NUX (${docIds.length} purchase(s))`);

    if (DRY_RUN) {
      log(`  [DRY RUN] Would send ${totalNux.toLocaleString()} NUX`);
      results.push({ wallet, nuxAmount: totalNux, txSignature: null, status: 'dry_run' });
      successCount++;
      totalNuxSent += totalNux;
      continue;
    }

    try {
      const recipientPubkey = new PublicKey(wallet);

      // Create recipient ATA if it doesn't exist (payer covers rent ~0.002 SOL)
      const recipientATA = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mintPubkey,
        recipientPubkey
      );
      log(`  📬 Recipient ATA: ${recipientATA.address.toBase58()}`);

      // Build transfer instruction
      const rawAmount = BigInt(totalNux) * BigInt(10 ** DECIMALS);
      const ix = createTransferInstruction(
        payerATA,
        recipientATA.address,
        payer.publicKey,
        rawAmount,
        [],
        TOKEN_PROGRAM_ID
      );

      const tx  = new Transaction().add(ix);
      const sig = await sendAndConfirmTransaction(connection, tx, [payer], {
        commitment: 'confirmed',
      });

      log(`  ✅ TX: ${sig}`);

      // Mark all docs for this wallet as distributed
      const batch = db.batch();
      for (const docId of docIds) {
        batch.update(db.collection(COLLECTION).doc(docId), {
          status: 'distributed',
          distributedAt: Timestamp.now(),
          distributionTx: sig,
        });
      }
      await batch.commit();

      results.push({ wallet, nuxAmount: totalNux, txSignature: sig, status: 'distributed' });
      successCount++;
      totalNuxSent += totalNux;

      // Small delay to avoid RPC rate limits
      await new Promise((r) => setTimeout(r, 1200));

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      warn(`Failed for ${wallet}: ${errMsg}`);
      results.push({ wallet, nuxAmount: totalNux, txSignature: null, status: 'failed', error: errMsg });
      failCount++;
    }
  }

  // --- Summary ---
  console.log('\n' + '═'.repeat(60));
  console.log('DISTRIBUTION SUMMARY');
  console.log('═'.repeat(60));
  log(`✅ Successful : ${successCount} wallets`);
  if (failCount > 0) log(`❌ Failed     : ${failCount} wallets`);
  log(`🪙  NUX sent  : ${totalNuxSent.toLocaleString()} NUX`);
  if (DRY_RUN) log('\n⚠️  DRY RUN — nothing was sent. Run with --execute to distribute for real.');

  // Save results
  fs.writeFileSync(RESULT_FILE, JSON.stringify({
    runAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    totalWallets: map.size,
    successCount,
    failCount,
    totalNuxSent,
    results,
  }, null, 2));
  log(`\n💾 Results saved to: distribute-result.json`);
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
