import { useState, useCallback, useMemo } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { getContract, isAddress, keccak256, toHex } from 'viem';
import type { Abi } from 'viem';
import GameifiedMarketplaceABI from '../../abi/GameifiedMarketplace.json';
import { uploadFileToIPFS, uploadJsonToIPFS } from '../../utils/ipfs/ipfsUtils';

interface MintNFTParams {
  file: File;
  name: string;
  description: string;
  category: string;
  royalty: number;
  skills?: Array<{
    skillType: number;
    effectValue: number;
    rarity: number;
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

const CONTRACT_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_ADDRESS;

// Move category map outside component to prevent recreation on each render
const categoryMap: Record<string, string> = {
  'collectible': 'coleccionables',
  'artwork': 'arte',
  'photography': 'fotografia',
  'music': 'musica',
  'video': 'video',
  'item': 'collectible',
  'document': 'collectible'
};

// Local fallback for when IPFS upload fails - moved outside to avoid recreation
const createLocalDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        resolve('data:application/octet-stream;base64,' + btoa(String.fromCharCode(...new Uint8Array(reader.result as ArrayBuffer || new ArrayBuffer(0)))));
      }
    };
    reader.readAsDataURL(file);
  });
};

export default function useMintNFT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Memoize contract address validation to prevent rechecking on every render
  const validatedContractAddress = useMemo(() => {
    if (!CONTRACT_ADDRESS) return null;
    return isAddress(CONTRACT_ADDRESS) ? CONTRACT_ADDRESS : null;
  }, []);

  // Mint NFT using enhanced IPFS functions from blockchainUtils
  const mintNFT = useCallback(async ({ file, name, description, category, royalty, skills = [] }: MintNFTParams): Promise<MintNFTResult> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      console.log("Starting NFT minting process");
      
      // Use memoized contract address
      if (!validatedContractAddress) {
        throw new Error('Invalid contract address. Please check your environment configuration.');
      }
      
      console.log("Using contract address:", validatedContractAddress);
      
      // Normaliza la categoría a inglés y español
      const normalizedCategory = categoryMap[category] || 'coleccionables';
      const categoryToSend = normalizedCategory;
      console.log("Category normalized:", category, "->", normalizedCategory);

      // Check if wallet is connected
      if (!walletClient || !address) {
        throw new Error('Please connect your wallet to mint NFTs');
      }
      
      console.log("Connected wallet:", address);

      // Validate Skills if present
      if (skills && skills.length > 0) {
        // Validation: Max 5 skills per NFT
        if (skills.length > 5) {
          throw new Error('Maximum 5 skills allowed per NFT');
        }

        // Validation: Check skill types are valid (0-6)
        const invalidSkills = skills.filter(s => typeof s.skillType !== 'number' || s.skillType < 0 || s.skillType > 6);
        if (invalidSkills.length > 0) {
          throw new Error('Invalid skill type. Allowed types: 0-6 (Stake Boost I/II/III, Auto Compound, Lock Reducer, Fee Reducer I/II)');
        }

        // Validation: Check effect values are in range (1-100)
        const invalidEffects = skills.filter(s => typeof s.effectValue !== 'number' || s.effectValue < 1 || s.effectValue > 100);
        if (invalidEffects.length > 0) {
          throw new Error('Invalid effect value. Must be between 1 and 100');
        }

        // Validation: Check rarity values are valid (0-4)
        const invalidRarities = skills.filter(s => typeof s.rarity !== 'number' || s.rarity < 0 || s.rarity > 4);
        if (invalidRarities.length > 0) {
          throw new Error('Invalid rarity level. Allowed: 0-4 (Common to Legendary)');
        }

        console.log("Skills validation passed:", {
          count: skills.length,
          types: skills.map(s => s.skillType),
          rarities: skills.map(s => s.rarity),
        });
      }

      // Create contract instance
      const contract = getContract({
        address: validatedContractAddress as `0x${string}`,
        abi: GameifiedMarketplaceABI.abi as Abi,
        client: { public: publicClient, wallet: walletClient }
      });

      // Step 1: Upload image to IPFS
      console.log("Uploading image to IPFS...");
      let imageUrl;
      try {
        imageUrl = await uploadFileToIPFS(file);
        console.log("Image uploaded to IPFS:", imageUrl);
      } catch (ipfsError: unknown) {
        console.warn("IPFS upload failed, using local data URL:", ipfsError);
        imageUrl = await createLocalDataUrl(file);
      }

      // Step 2: Create metadata object
      const metadata = {
        name: name || "Untitled NFT",
        description: description || "A unique digital asset",
        image: imageUrl,
        attributes: [
          {
            trait_type: "Category",
            value: category
          },
          {
            trait_type: "Creator",
            value: address
          },
          {
            trait_type: "Created",
            value: new Date().toISOString()
          }
        ]
      };

      // Step 3: Upload metadata to IPFS
      console.log("Uploading metadata to IPFS...");
      let metadataUrl;
      try {
        metadataUrl = await uploadJsonToIPFS(metadata);
        console.log("Metadata uploaded to IPFS:", metadataUrl);
      } catch (metadataError: unknown) {
        console.warn("Metadata IPFS upload failed:", metadataError);
        // Create a simple data URL for metadata as fallback
        const metadataJson = JSON.stringify(metadata);
        const blob = new Blob([metadataJson], { type: 'application/json' });
        metadataUrl = URL.createObjectURL(blob);
      }

      // Step 4: Prepare skill arrays
      const skillTypes = skills.map(s => s.skillType);
      const effectValues = skills.map(s => s.effectValue);
      const rarities = skills.map(s => s.rarity);

      console.log("Skills configuration:", { skillTypes, effectValues, rarities });

      // Step 5: Estimate gas for the transaction
      console.log("Estimating gas for minting...");
      const royaltyBasisPoints = Math.floor((royalty || 250));
      
      try {
        // createSkillNFT with skill arrays (empty for standard NFT)
        const gasEstimate = await contract.estimateGas.createSkillNFT([
          metadataUrl,
          normalizedCategory,
          royaltyBasisPoints,
          skillTypes,
          effectValues,
          rarities
        ]);
        console.log("Gas estimate:", gasEstimate.toString());
      } catch (estimateError: unknown) {
        console.warn("Gas estimation failed:", estimateError);
      }

      // Step 6: Execute the minting transaction using createSkillNFT
      console.log("Executing minting transaction...");
      const txHash = await contract.write.createSkillNFT([
        metadataUrl,
        categoryToSend,
        royaltyBasisPoints,
        skillTypes,
        effectValues,
        rarities
      ], {
        gas: 500000n // Set a reasonable gas limit
      });

      console.log("Transaction submitted:", txHash);
      setTxHash(txHash);

      // Step 6: Wait for transaction confirmation
      console.log("Waiting for transaction confirmation...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      if (receipt.status === 'success') {
        console.log("Transaction confirmed:", receipt);
        
        // Extract token ID from transaction receipt
        let tokenId = null;
        if (receipt.logs && receipt.logs.length > 0) {
          try {
            const tokenMintedEventSignature = keccak256(toHex("TokenMinted(uint256,address,string,string)"));
            const tokenMintedEvent = receipt.logs.find(log => 
              log.topics[0] === tokenMintedEventSignature
            );
            if (tokenMintedEvent) {
              tokenId = parseInt(tokenMintedEvent.topics[1] || '0', 16);
            }
          } catch (eventError: unknown) {
            console.warn("Could not extract token ID from event:", eventError);
          }
        }

        setSuccess(true);
        
        return {
          success: true,
          txHash: txHash,
          tokenId: tokenId,
          imageUrl: imageUrl,
          metadataUrl: metadataUrl,
          contractAddress: validatedContractAddress
        };
      } else {
        throw new Error('Transaction failed on blockchain');
      }

    } catch (err: unknown) {
      console.error('Error in mintNFT:', err);
      
      let errorMessage = 'An unexpected error occurred while minting your NFT.';
      const error = err as { message?: string };
      
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected. Please try again and confirm the transaction in your wallet.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to complete the transaction. Please add more MATIC to your wallet.';
      } else if (error.message?.includes('Invalid contract address')) {
        errorMessage = 'Contract configuration error. Please contact support.';
      } else if (error.message?.includes('IPFS')) {
        errorMessage = 'Failed to upload content. Please check your internet connection and try again.';
      } else if (error.message?.includes('MetaMask')) {
        errorMessage = 'Please install and connect MetaMask to mint NFTs.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [validatedContractAddress, walletClient, address, publicClient]);

  return { mintNFT, loading, error, success, txHash };
}
