import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

// Mock data for rewards - In a real app, this would come from a backend or contract
const MOCK_REWARDS = {
    pending: "1,250.00",
    totalClaimed: "5,000.00",
    nextDistribution: "Feb 28, 2026",
    history: [
        { id: 1, date: 'Jan 31, 2026', amount: '2,500 NUX', status: 'Claimed' },
        { id: 2, date: 'Dec 31, 2025', amount: '2,500 NUX', status: 'Claimed' },
    ]
};

export default function RewardDashboard() {
    const { isConnected } = useAccount();
    const [hasBadge, setHasBadge] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Simulation: Check if user has the badge (In real app, query the indexing or contract)
    useEffect(() => {
        if (isConnected) {
            const checkBadge = async () => {
                // Mocking the check for the badge
                // Here we would use a hook like useNFTs() or a specific check
                setTimeout(() => setHasBadge(true), 1000);
            };
            checkBadge();
        }
    }, [isConnected]);

    const handleClaim = () => {
        setClaiming(true);
        setTimeout(() => {
            setClaiming(false);
            setShowSuccess(true);
        }, 2000);
    };

    if (!isConnected) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">Please connect your wallet to view your rewards.</p>
            </div>
        );
    }

    if (!hasBadge) {
        return (
            <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-amber-500 text-2xl">⚠️</span>
                </div>
                <h3 className="jersey-15-regular text-xl font-bold text-white">Badge Required</h3>
                <p className="jersey-20-regular text-slate-400 max-w-sm mx-auto">
                    You need a Moderator Badge NFT to access rewards. Go to the "Identification" tab to mint yours.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                    <p className="jersey-15-regular text-slate-400 text-sm mb-1">Pending Rewards</p>
                    <div className="flex items-end gap-2">
                        <span className="jersey-20-regular text-3xl text-cyan-400">{MOCK_REWARDS.pending}</span>
                        <span className="jersey-20-regular text-slate-500 mb-1">NUX</span>
                    </div>
                </div>

                <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                    <p className="jersey-15-regular text-slate-400 text-sm mb-1">Total Claimed</p>
                    <div className="flex items-end gap-2">
                        <span className="jersey-20-regular text-3xl text-white">{MOCK_REWARDS.totalClaimed}</span>
                        <span className="jersey-20-regular text-slate-500 mb-1">NUX</span>
                    </div>
                </div>

                <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                    <p className="jersey-15-regular text-slate-400 text-sm mb-1">Next Distribution</p>
                    <span className="jersey-20-regular text-xl text-slate-200">{MOCK_REWARDS.nextDistribution}</span>
                </div>
            </div>

            {/* Claim Section */}
            <div className="relative group p-8 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="jersey-15-regular text-2xl text-white mb-2">Available for Withdrawal</h3>
                        <p className="jersey-20-regular text-slate-400">Claim your worked hours rewards directly to your wallet.</p>
                    </div>

                    <div className="w-full md:w-auto">
                        {showSuccess ? (
                            <div className="jersey-20-regular px-8 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center">
                                Payment Sent!
                            </div>
                        ) : (
                            <button
                                onClick={handleClaim}
                                disabled={claiming || MOCK_REWARDS.pending === "0.00"}
                                className="jersey-20-regular w-full md:w-auto px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                            >
                                {claiming ? "Processing..." : "Claim Rewards"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div>
                <h3 className="jersey-15-regular text-xl text-white mb-6">Reward History</h3>
                <div className="overflow-hidden border border-slate-800 rounded-2xl">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/50">
                            <tr>
                                <th className="jersey-20-regular px-6 py-4 text-slate-400 text-sm">Date</th>
                                <th className="jersey-20-regular px-6 py-4 text-slate-400 text-sm">Amount</th>
                                <th className="jersey-20-regular px-6 py-4 text-slate-400 text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {MOCK_REWARDS.history.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="jersey-20-regular px-6 py-4 text-slate-300">{item.date}</td>
                                    <td className="jersey-20-regular px-6 py-4 text-white">{item.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className="jersey-20-regular px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
