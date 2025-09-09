interface FormData {
  name: string;
  description: string;
  category: string;
  royaltyPercentage: number;
  attributes: Array<{ trait_type: string; value: string }>;
}

interface NFTDetailsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  addAttribute: () => void;
  removeAttribute: (index: number) => void;
  updateAttribute: (index: number, field: 'trait_type' | 'value', value: string) => void;
  isUploading: boolean;
  isPending: boolean;
  isConfirming: boolean;
  error?: string;
}

export default function NFTDetails({
  formData,
  setFormData,
  onSubmit,
  addAttribute,
  removeAttribute,
  updateAttribute,
  isUploading,
  isPending,
  isConfirming,
  error
}: NFTDetailsProps) {

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">NFT Details</h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-white font-medium mb-2">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Enter NFT name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-white font-medium mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none transition-all"
            placeholder="Describe your NFT"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-white font-medium mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent [&>option]:bg-gray-800 [&>option]:text-white transition-all"
          >
            <option value="art" className="bg-gray-800 text-white">🎨 Art</option>
            <option value="photography" className="bg-gray-800 text-white">📸 Photography</option>
            <option value="music" className="bg-gray-800 text-white">🎵 Music</option>
            <option value="video" className="bg-gray-800 text-white">🎬 Video</option>
            <option value="collectibles" className="bg-gray-800 text-white">🏆 Collectibles</option>
          </select>
        </div>

        {/* Royalty Percentage */}
        <div>
          <label className="block text-white font-medium mb-2">
            Royalty Percentage ({(formData.royaltyPercentage / 100).toFixed(1)}%)
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1000"
              step="25"
              value={formData.royaltyPercentage}
              onChange={(e) => setFormData(prev => ({ ...prev, royaltyPercentage: parseInt(e.target.value) }))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-white/60 text-sm mt-1">
              <span>0%</span>
              <span>2.5%</span>
              <span>5%</span>
              <span>7.5%</span>
              <span>10%</span>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-2">
            💡 Royalties are earned on every future sale of your NFT
          </p>
        </div>



        {/* Attributes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-white font-medium">Attributes</label>
            <button
              type="button"
              onClick={addAttribute}
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Attribute
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.attributes.map((attr, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="text"
                  value={attr.trait_type}
                  onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                  placeholder="Attribute type (e.g., Color, Rarity)"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                  placeholder="Value (e.g., Blue, Legendary)"
                />
                {formData.attributes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="px-3 py-2 text-red-400 hover:text-red-300 self-start sm:self-center transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && !error.includes('select') && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-300 mb-2">{error}</p>
            {error.includes('Pinata') && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm font-medium mb-2">🔧 Quick Fix:</p>
                <ol className="text-yellow-200 text-sm space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://app.pinata.cloud/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">app.pinata.cloud</a></li>
                  <li>Create account → API Keys → New Key</li>
                  <li>Enable: pinFileToIPFS + pinJSONToIPFS</li>
                  <li>Copy JWT and add to .env file</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || isPending || isConfirming}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading to IPFS...
            </span>
          ) : isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating NFT...
            </span>
          ) : isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Confirming Transaction...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Create NFT
            </span>
          )}
        </button>
      </form>
    </div>
  );
}