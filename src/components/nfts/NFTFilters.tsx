interface NFTFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  availableCategories: string[];
  onCreateNFT: () => void;
  isMobile?: boolean;
}

export default function NFTFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  filter,
  onFilterChange,
  availableCategories,
  onCreateNFT,
  isMobile = false
}: NFTFiltersProps) {
  return (
    <div className={`flex flex-col gap-3 ${
      isMobile ? 'space-y-3' : 'sm:flex-row gap-4'
    } mb-6 md:mb-8`}>
      <div className="flex-1">
        <input
          type="text"
          placeholder={isMobile ? "Search..." : "Search your collection..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent card-unified ${
            isMobile ? 'px-3 py-2.5 text-sm' : 'px-4 py-3'
          }`}
        />
      </div>
      
      {/* Filters row for mobile */}
      <div className={`flex gap-2 ${
        isMobile ? 'flex-col space-y-2' : 'flex-row'
      }`}>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={`card-unified border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent [&>option]:bg-gray-800 [&>option]:text-white ${
            isMobile ? 'px-3 py-2.5 text-sm flex-1' : 'px-4 py-3'
          }`}
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
          className={`card-unified border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent [&>option]:bg-gray-800 [&>option]:text-white ${
            isMobile ? 'px-3 py-2.5 text-sm flex-1' : 'px-4 py-3'
          }`}
        >
          <option value="all" className="bg-gray-800 text-white">All NFTs</option>
          <option value="listed" className="bg-gray-800 text-white">For Sale</option>
          <option value="unlisted" className="bg-gray-800 text-white">Not Listed</option>
        </select>
      </div>
      
      <button 
        onClick={onCreateNFT}
        className={`btn-primary rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          isMobile ? 'px-4 py-2.5 text-sm w-full' : 'px-6 py-3'
        }`}
      >
        <svg className={`fill="none" stroke="currentColor" viewBox="0 0 24 24" ${
          isMobile ? 'w-4 h-4' : 'w-5 h-5'
        }`}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {isMobile ? 'Create' : 'Create NFT'}
      </button>
    </div>
  );
}