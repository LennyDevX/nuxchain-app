import { useState, useCallback, useMemo } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { getContract, isAddress } from 'viem';
import type { Abi } from 'viem';
import GameifiedMarketplaceCoreABI from '../../abi/GameifiedMarketplaceCoreV1.json';
// Ensure the JSON file exists at the specified path.
// If you still get type errors, add a declaration for '*.json' imports in your project.
import GameifiedMarketplaceSkillsABI from '../../abi/GameifiedMarketplaceSkillsV2.json';
import { uploadFileToIPFS, uploadJsonToIPFS } from '../../utils/ipfs/ipfsUtils';

interface MintNFTParams {
  file: File;
  name: string;
  description: string;
  category: string;
  royalty: number;
  skills?: Array<{
    skillType: number;  // 0-17: All 18 official skills
    rarity: number;     // 0-4: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
    level: number;      // Nivel de la skill (1-100)
  }>;
}

interface MintNFTResult {
  success: boolean;
  txHash: string;
  tokenId: number | null;
  imageUrl: string;
  metadataUrl: string;
  contractAddress: string;
}

// Nueva arquitectura: Proxy + Modules
const PROXY_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY;
const SKILLS_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_SKILLS;

// Category mapping for Spanish/English normalization
const categoryMap: Record<string, string> = {
  'art': 'arte',
  'artwork': 'arte',
  'collectible': 'coleccionables',
  'collectibles': 'coleccionables',
  'photography': 'fotografia',
  'photo': 'fotografia',
  'music': 'musica',
  'audio': 'musica',
  'video': 'video',
  'generic': 'coleccionables'
};

export default function useMintNFT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  // Validate contract addresses
  const validatedProxyAddress = useMemo(() => {
    if (!PROXY_ADDRESS) return null;
    return isAddress(PROXY_ADDRESS) ? PROXY_ADDRESS : null;
  }, []);

  const validatedSkillsAddress = useMemo(() => {
    if (!SKILLS_ADDRESS) return null;
    return isAddress(SKILLS_ADDRESS) ? SKILLS_ADDRESS : null;
  }, []);

  // Mint NFT using new modular architecture
  const mintNFT = useCallback(async ({ 
    file, 
    name, 
    description, 
    category, 
    royalty, 
    skills = [] 
  }: MintNFTParams): Promise<MintNFTResult> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      console.log("🎨 Starting NFT minting process (New Architecture)");
      
      // Validate addresses
      if (!validatedProxyAddress || !validatedSkillsAddress) {
        throw new Error('Contract addresses not configured. Check .env file.');
      }
      
      // Check wallet connection
      if (!walletClient || !address) {
        throw new Error('Please connect your wallet to mint NFTs');
      }
      
      console.log("✅ Wallet connected:", address);
      console.log("📍 Proxy Address:", validatedProxyAddress);
      console.log("📍 Skills Address:", validatedSkillsAddress);

      // Normalize category
      const normalizedCategory = categoryMap[category] || 'coleccionables';
      console.log("📂 Category:", category, "→", normalizedCategory);

      // Validate skills if present
      if (skills && skills.length > 0) {
        if (skills.length > 5) {
          throw new Error('Maximum 5 skills allowed per NFT');
        }

        // Validate skill types (0-5 for CODING to WRITING)
        const invalidTypes = skills.filter(s => s.skillType < 0 || s.skillType > 17);
        if (invalidTypes.length > 0) {
          throw new Error('Invalid skill type. Use 0-5 (CODING, DESIGN, MARKETING, TRADING, COMMUNITY, WRITING)');
        }

        // Validate rarity (0-4)
        const invalidRarities = skills.filter(s => s.rarity < 0 || s.rarity > 4);
        if (invalidRarities.length > 0) {
          throw new Error('Invalid rarity. Use 0-4 (COMMON to LEGENDARY)');
        }

        // Validate level (1-100)
        const invalidLevels = skills.filter(s => s.level < 1 || s.level > 100);
        if (invalidLevels.length > 0) {
          throw new Error('Invalid skill level. Must be 1-100');
        }

        console.log("✅ Skills validation passed:", skills);
      }

      // Step 1: Upload image to IPFS
      console.log("📤 Uploading image to IPFS...");
      const imageUrl = await uploadFileToIPFS(file);
      console.log("✅ Image uploaded:", imageUrl);

      // Step 2: Create and upload metadata
      const metadata = {
        name: name || "Untitled NFT",
        description: description || "A unique digital asset",
        image: imageUrl,
        attributes: [
          { trait_type: "Category", value: normalizedCategory },
          { trait_type: "Creator", value: address },
          { trait_type: "Created", value: new Date().toISOString() },
          ...(skills.length > 0 ? [{ trait_type: "Skills", value: skills.length.toString() }] : [])
        ]
      };

      console.log("📤 Uploading metadata to IPFS...");
      const metadataUrl = await uploadJsonToIPFS(metadata);
      console.log("✅ Metadata uploaded:", metadataUrl);

      // Step 3: Create Core contract instance
      const coreContract = getContract({
        address: validatedProxyAddress as `0x${string}`,
        abi: GameifiedMarketplaceCoreABI.abi as Abi,
        client: { public: publicClient, wallet: walletClient }
      });

      // Step 4: Mint Standard NFT (Core contract)
      console.log("🔨 Minting Standard NFT...");
      const royaltyBasisPoints = Math.floor(royalty || 250); // 2.5% default

      // Estimate gas for core minting
      let gasEstimate = 500000n;
      try {
        const estimated = await coreContract.estimateGas.createStandardNFT([
          metadataUrl,
          normalizedCategory,
          royaltyBasisPoints
        ]);
        gasEstimate = (estimated * 120n) / 100n; // 20% buffer
        console.log("⛽ Gas estimate:", gasEstimate.toString());
      } catch {
        console.warn("⚠️ Gas estimation failed, using default");
      }

      const tx = await coreContract.write.createStandardNFT([
        metadataUrl,
        normalizedCategory,
        royaltyBasisPoints
      ], {
        gas: gasEstimate
      });

      console.log("✅ NFT minted! TX:", tx);
      setTxHash(tx);

      // Step 5: Wait for confirmation
      console.log("⏳ Waiting for confirmation...");
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: tx });
      
      if (!receipt || receipt.status !== 'success') {
        throw new Error('Transaction failed on blockchain');
      }

      // Extract token ID from logs
      let tokenId: number | null = null;
      try {
        // TokenCreated event: TokenCreated(address indexed creator, uint256 indexed tokenId, string uri)
        const tokenCreatedLog = receipt.logs.find(log => log.topics.length >= 3);
        if (tokenCreatedLog && tokenCreatedLog.topics[2]) {
          tokenId = parseInt(tokenCreatedLog.topics[2], 16);
          console.log("🎟️ Token ID:", tokenId);
        }
      } catch {
        console.warn("⚠️ Could not extract token ID from logs");
      }

      // Step 6: Register skills if provided
      if (skills && skills.length > 0 && tokenId) {
        console.log("🎯 Registering skills for NFT...");

        const skillsContract = getContract({
          address: validatedSkillsAddress as `0x${string}`,
          abi: GameifiedMarketplaceSkillsABI.abi as Abi,
          client: { public: publicClient, wallet: walletClient }
        });

        const skillTypes = skills.map(s => s.skillType);
        const rarities = skills.map(s => s.rarity);
        const levels = skills.map(s => BigInt(s.level));
        const basePrice = 0n; // Price for the NFT (0 for now)

        try {
          const skillsTx = await skillsContract.write.registerSkillsForNFT([
            BigInt(tokenId),
            skillTypes,
            rarities,
            levels,
            basePrice
          ]);

          console.log("✅ Skills registered! TX:", skillsTx);
          await publicClient?.waitForTransactionReceipt({ hash: skillsTx });
          console.log("✅ Skills confirmation received");
        } catch (skillsError) {
          console.error("❌ Skills registration failed:", skillsError);
          // Don't throw - NFT was already minted successfully
          console.warn("⚠️ NFT created but skills registration failed");
        }
      }

      setSuccess(true);
      console.log("🎉 Minting complete!");

      // ✅ Invalidate user profile cache to force refetch of XP
      setTimeout(() => {
        console.log('🔄 Invalidating user profile cache...');
        queryClient.invalidateQueries({
          queryKey: ['readContract']
        });
        // Trigger storage event for cross-tab sync
        localStorage.setItem('profile_mint_complete', Date.now().toString());
      }, 2000); // Wait 2 seconds for blockchain to settle

      return {
        success: true,
        txHash: tx,
        tokenId: tokenId,
        imageUrl: imageUrl,
        metadataUrl: metadataUrl,
        contractAddress: validatedProxyAddress
      };

    } catch (err: unknown) {
      console.error('❌ Error in mintNFT:', err);
      
      const error = err as { message?: string; data?: string; code?: string | number };
      let errorMessage = 'An unexpected error occurred while minting.';
      
      // User rejected transaction
      if (error.message?.includes('user rejected') || 
          error.message?.includes('User rejected') ||
          error.message?.includes('user denied') ||
          error.code === 4001 ||
          error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction cancelled by user.';
      } 
      // Insufficient funds
      else if (error.message?.includes('insufficient funds') || 
               error.message?.includes('insufficient balance')) {
        errorMessage = 'Insufficient MATIC balance.';
      } 
      // IPFS errors
      else if (error.message?.includes('IPFS') || error.message?.includes('Pinata')) {
        errorMessage = 'Failed to upload to IPFS. Check your connection.';
      } 
      // Contract errors
      else if (error.message?.includes('execution reverted')) {
        errorMessage = 'Transaction rejected by contract.';
      }
      // Generic error
      else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Error for user:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [validatedProxyAddress, validatedSkillsAddress, walletClient, address, publicClient, queryClient]);

  return { mintNFT, loading, error, success, txHash };
}
