function AirdropFeatures() {
  return (
    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-4">
      {/* No Gas Fees */}
      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-xl rounded-xl sm:rounded-xl border border-purple-500/30 p-5 sm:p-5 text-center">
        <div className="w-12 h-12 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 sm:w-5 sm:h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-semibold text-white mb-2 text-base sm:text-sm">editaste la que no eram</h3>
        <p className="text-sm sm:text-xs text-gray-400 line-clamp-2">Completely free</p>
      </div>

      {/* One Per User */}
      <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 backdrop-blur-xl rounded-xl sm:rounded-xl border border-pink-500/30 p-5 sm:p-5 text-center">
        <div className="w-12 h-12 sm:w-10 sm:h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 sm:w-5 sm:h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-semibold text-white mb-2 text-base sm:text-sm">One Per User</h3>
        <p className="text-sm sm:text-xs text-gray-400 line-clamp-2">Register once</p>
      </div>

      {/* Secure & Verified */}
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-xl rounded-xl sm:rounded-xl border border-green-500/30 p-5 sm:p-5 text-center">
        <div className="w-12 h-12 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 sm:w-5 sm:h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-semibold text-white mb-2 text-base sm:text-sm">Secure & Verified</h3>
        <p className="text-sm sm:text-xs text-gray-400 line-clamp-2">10K users max</p>
      </div>
    </div>
  );
}

export default AirdropFeatures;