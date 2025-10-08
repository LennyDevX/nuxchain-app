import { useEffect } from 'react';

function Blog() {
  useEffect(() => {
    document.title = 'Nuxchain | Blog';
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#05071C] via-[#0A0F2D] to-[#05071C] text-white py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Nuxchain Blog</h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
          We are crafting in-depth articles about decentralized finance, staking strategies, NFT utilities,
          and the latest updates from the Nuxchain ecosystem. Stay tuned for official launches and insights.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-left">
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-blue-100">
              Subscribe to our newsletter to be the first to read upcoming posts covering product launches,
              community highlights, and advanced tutorials.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-left">
            <h2 className="text-2xl font-semibold mb-2">Looking to Contribute?</h2>
            <p className="text-blue-100">
              We will soon open contributions from Web3 experts. Prepare your best strategies and insights about
              the Nuxchain ecosystem.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Blog;
