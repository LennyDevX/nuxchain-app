interface AirdropRequirementsProps {
  onOpenModal: () => void;
}

function AirdropRequirements({ onOpenModal }: AirdropRequirementsProps) {
  return (
    <>
      {/* Button to Open Modal */}
      <button
        type="button"
        onClick={onOpenModal}
        className="w-full group focus:outline-none"
      >
        <div className="flex items-center justify-between w-full px-4 py-3 sm:py-4 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 hover:from-blue-900/60 hover:to-indigo-900/60 border border-blue-500/30 hover:border-blue-500/50 rounded-lg sm:rounded-xl transition-all duration-300"
        >
          <div className="flex items-center gap-2 sm:gap-3 text-left">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v-1h8v1zm-3-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                📋 View Requirements & Methods
              </h3>
              <p className="text-xs text-gray-400 hidden sm:block mt-0.5">Click to see all details</p>
            </div>
          </div>
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 transition-transform duration-300 flex-shrink-0 group-hover:scale-110"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>
    </>
  );
}

export default AirdropRequirements;
