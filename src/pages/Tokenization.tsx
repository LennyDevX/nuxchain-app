import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { tokenizationToasts } from '../utils/toasts';
import useMintNFT from '../hooks/nfts/useMintNFT';
import { useUserStaking } from '../hooks/staking/useUserStaking';

// Import components
import FileUpload from '../components/tokenization/FileUpload';
import NFTDetails from '../components/tokenization/NFTDetails';
import InfoCarousel from '../components/tokenization/InfoCarousel';

// Types for Skill NFTs - Updated for new architecture
export type SkillType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17; // All 18 official skills
export type Rarity = 0 | 1 | 2 | 3 | 4; // COMMON, UNCOMMON, RARE, EPIC, LEGENDARY

export interface Skill {
  skillType: SkillType;
  rarity: Rarity;
  level: number; // 1-100
}

interface FormData {
  name: string;
  description: string;
  category: string;
  royaltyPercentage: number;
  count: number;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  nftType: 'standard' | 'skill';
  skills: Skill[];
}

function Tokenization() {
  const { isConnected } = useAccount();
  const { mintNFT, loading, error: mintError } = useMintNFT();
  const { totalStaked } = useUserStaking();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: 'art',
    royaltyPercentage: 250, // 2.5% default
    count: 1, // Default to 1 copy
    attributes: [{ trait_type: '', value: '' }],
    nftType: 'standard',
    skills: []
  });

  // File and upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);





  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Limit to 500 copies maximum
    if (formData.count > 500) {
      setError('You cannot mint more than 500 copies at once.');
      return;
    }

    if (formData.count < 1) {
      setError('Minimum 1 copy required');
      return;
    }

    // Check staking requirement for Skill NFTs (200 POL minimum)
    if (formData.nftType === 'skill') {
      const stakedAmount = parseFloat(totalStaked || '0');
      if (stakedAmount < 200) {
        setError(`🔒 Skill NFTs require a minimum of 200 POL staked. You currently have ${stakedAmount.toFixed(2)} POL staked. Please stake more POL before creating a Skill NFT.`);
        return;
      }
    }

    // Only Skill NFTs require at least 1 skill (Standard NFTs don't need skills)
    if (formData.nftType === 'skill' && formData.skills.length === 0) {
      setError('Add at least 1 skill to your Skill NFT. First skill is FREE!');
      return;
    }

    let mintToastId: string | undefined;
    try {
      setError(null);

      // Show loading toast while minting
      const batchCount = Math.ceil(formData.count / 100);
      mintToastId = tokenizationToasts.mintingInProgress(
        formData.count > 100
          ? `⏳ Minting ${formData.count} NFTs in ${batchCount} batches of 100...`
          : undefined
      );

      const result = await mintNFT({
        file: selectedFile,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        royalty: formData.royaltyPercentage,
        count: formData.count,
        skills: formData.skills
      });

      if (result.success) {
        // Show batch-aware success toast
        const isBatch = formData.count > 1;
        const tokenDisplay = isBatch && result.tokenIds && result.tokenIds.length > 1
          ? `NFTs #${result.tokenIds[0]}-${result.tokenIds[result.tokenIds.length - 1]} (${result.tokenIds.length} copies)`
          : `NFT #${result.tokenId}`;
        tokenizationToasts.mintingSuccess(formData.name, tokenDisplay, mintToastId);

        // Clear form after success
        setTimeout(() => {
          setFormData({
            name: '',
            description: '',
            category: 'art',
            royaltyPercentage: 250,
            count: 1,
            attributes: [{ trait_type: '', value: '' }],
            nftType: 'standard',
            skills: []
          });
          setSelectedFile(null);
          setImagePreview(null);
        }, 2000);
      }

    } catch (err) {
      console.error('Error creating NFT:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to create NFT';
      setError(errorMsg || mintError);
      tokenizationToasts.mintingError(errorMsg || 'Minting failed', mintToastId);
    }
  };


  // Reset errors when form changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);



  // Add attribute field
  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }]
    }));
  };

  // Remove attribute field
  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  // Update attribute
  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file removal
  const handleFileRemove = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="jersey-15-regular text-5xl md:text-6xl text-gradient font-bold text-white mb-4">
            Create Your NFT
          </h1>
          <p className="jersey-20-regular text-lg md:text-2xl text-white/60 max-w-2xl mx-auto">
            Transform your digital art into a unique NFT on the blockchain
          </p>
        </div>

        {/* File Upload Section - Top */}
        <div className="mb-12">
          {!selectedFile ? (
            /* Centered File Upload when no file selected */
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <FileUpload
                  selectedFile={selectedFile}
                  imagePreview={imagePreview}
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  error={error}
                />
              </div>
            </div>
          ) : (
            /* Side by side layout when file is selected */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-1">
                <FileUpload
                  selectedFile={selectedFile}
                  imagePreview={imagePreview}
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  error={error}
                />
              </div>

              <div className="lg:col-span-1">
                <NFTDetails
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  addAttribute={addAttribute}
                  removeAttribute={removeAttribute}
                  updateAttribute={updateAttribute}
                  isUploading={loading}
                  isPending={loading}
                  isConfirming={loading}
                  error={error || mintError || undefined}
                />
              </div>
            </div>
          )}
        </div>

        {/* Information Carousel - Bottom Section */}
        <div className="mb-8">
          <InfoCarousel />
        </div>

        {/* Status Messages and Progress */}
        <div className="space-y-6">
          {/* Show errors only if any */}
          {(error || mintError) && (
            <div className="w-full">
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                <p className="jersey-20-regular text-red-200">{error || mintError}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tokenization;

