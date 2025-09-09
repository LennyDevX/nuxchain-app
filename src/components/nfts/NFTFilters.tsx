interface NFTFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  availableCategories: string[];
  onCreateNFT: () => void;
}

export default function NFTFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  filter,
  onFilterChange,
  availableCategories,
  onCreateNFT
}: NFTFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search your collection..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 card-unified border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-3 card-unified border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent [&>option]:bg-gray-800 [&>option]:text-white"
      >
        <option value="all" className="bg-gray-800 text-white">All Categories</option>
        {availableCategories.map(category => (
          <option key={category} value={category} className="bg-gray-800 text-white">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </option>
        ))}
        {availableCategories.length === 0 && (
          <>
            <option value="art" className="bg-gray-800 text-white">Art</option>
            <option value="photography" className="bg-gray-800 text-white">Photography</option>
            <option value="music" className="bg-gray-800 text-white">Music</option>
            <option value="video" className="bg-gray-800 text-white">Video</option>
            <option value="collectibles" className="bg-gray-800 text-white">Collectibles</option>
          </>
        )}
      </select>
      <select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-4 py-3 card-unified border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent [&>option]:bg-gray-800 [&>option]:text-white"
      >
        <option value="all" className="bg-gray-800 text-white">All NFTs</option>
        <option value="listed" className="bg-gray-800 text-white">For Sale</option>
        <option value="unlisted" className="bg-gray-800 text-white">Not Listed</option>
      </select>
      <button 
        onClick={onCreateNFT}
        className="btn-primary  px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create NFT
      </button>
    </div>
  );
}