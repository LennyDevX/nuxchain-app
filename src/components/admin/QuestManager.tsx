import { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import useCollaboratorQuestAdmin from '../../hooks/colab/useCollaboratorQuestAdmin';
import useMarketplaceQuestAdmin, { QUEST_TYPE_NAMES, QuestType } from '../../hooks/marketplace/useMarketplaceQuestAdmin';
import { gamificationToasts } from '../../utils/toasts';

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);


const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ErrorBanner({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm">
      <span className="text-red-400 font-medium flex-1 truncate">{message}</span>
      <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function InputField({
  label, value, onChange, type = 'text', placeholder, min, step, note,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; min?: string; step?: string; note?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors"
      />
      {note && <p className="text-[10px] text-gray-600">{note}</p>}
    </div>
  );
}

function TextArea({
  label, value, onChange, placeholder, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors resize-none"
      />
    </div>
  );
}

// ─── Batch Modal ──────────────────────────────────────────────────────────────

function BatchCompleteModal({
  questId, isOpen, onClose, onSubmit, loading,
}: {
  questId: bigint | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (users: string[], questId: bigint) => void;
  loading: boolean;
}) {
  const [rawAddresses, setRawAddresses] = useState('');
  if (!isOpen || questId === null) return null;

  const handleSubmit = () => {
    const users = rawAddresses
      .split(/[\n,]+/)
      .map(a => a.trim())
      .filter(a => /^0x[0-9a-fA-F]{40}$/.test(a));
    if (users.length === 0) return;
    onSubmit(users as `0x${string}`[], questId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-black uppercase tracking-wide">Batch Complete Quest #{questId.toString()}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <TextArea
          label="User addresses (one per line or comma-separated)"
          value={rawAddresses}
          onChange={setRawAddresses}
          placeholder="0xabc...\n0xdef..."
          rows={6}
        />
        <p className="text-xs text-gray-500">
          Valid addresses detected: {rawAddresses.split(/[\n,]+/).filter(a => /^0x[0-9a-fA-F]{40}$/.test(a.trim())).length}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:border-white/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-black uppercase tracking-wide transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Spinner /> Processing…</> : <><CheckIcon /> Complete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Collaborator Tab ─────────────────────────────────────────────────────────

function CollaboratorQuestsTab() {
  const {
    activeQuests, totalQuestCount, questsLoading,
    createQuest, deactivateQuest, batchCompleteQuest,
    createHash, createLoading, createSuccess,
    deactivateHash, deactivateLoading, deactivateSuccess,
    batchHash, batchLoading, batchSuccess,
    refresh, error,
  } = useCollaboratorQuestAdmin();

  // Form state
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxCompletions, setMaxCompletions] = useState('');

  // Batch modal
  const [batchQuestId, setBatchQuestId] = useState<bigint | null>(null);

  // Track tx success for toasts
  useEffect(() => {
    if (createSuccess && createHash) {
      setTimeout(() => {
        gamificationToasts.txConfirmed();
        setDescription(''); setRewardAmount(''); setStartDate(''); setEndDate(''); setMaxCompletions('');
        refresh();
      }, 0);
    }
  }, [createSuccess, createHash, refresh]);

  useEffect(() => { if (deactivateSuccess && deactivateHash) { setTimeout(() => { gamificationToasts.txConfirmed(); refresh(); }, 0); } }, [deactivateSuccess, deactivateHash, refresh]);
  useEffect(() => { if (batchSuccess && batchHash) { setTimeout(() => { gamificationToasts.txConfirmed(); setBatchQuestId(null); refresh(); }, 0); } }, [batchSuccess, batchHash, refresh]);

  const handleCreate = () => {
    if (!description || !rewardAmount || !startDate || !endDate || !maxCompletions) return;
    createQuest({
      description,
      rewardAmountEther: rewardAmount,
      startTime: Math.floor(new Date(startDate).getTime() / 1000),
      endTime: Math.floor(new Date(endDate).getTime() / 1000),
      maxCompletions: parseInt(maxCompletions, 10),
    });
  };

  const formValid = description && rewardAmount && startDate && endDate && maxCompletions && parseFloat(rewardAmount) > 0;

  return (
    <div className="space-y-6">
      {/* Errors */}
      {error && <ErrorBanner message={error} onClose={() => {}} />}

      {/* Create Form - Mobile Optimized */}
      <div className="p-4 sm:p-5 bg-[#0d0d0d] border border-purple-500/20 rounded-xl space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">Create Quest</h3>
        </div>
        <p className="text-[10px] sm:text-xs text-gray-500">Quests fund rewards from Treasury Manager (20% protocol revenue).</p>

        <TextArea label="Description" value={description} onChange={setDescription} placeholder="Complete 5 community tasks this week…" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <InputField label="Reward (POL)" value={rewardAmount} onChange={setRewardAmount} type="number" placeholder="10" min="0" step="0.01" note="Human-readable POL" />
          <InputField label="Max Users" value={maxCompletions} onChange={setMaxCompletions} type="number" placeholder="50" min="1" note="Max completions allowed" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <InputField label="Start" value={startDate} onChange={setStartDate} type="datetime-local" />
          <InputField label="End" value={endDate} onChange={setEndDate} type="datetime-local" />
        </div>

        <button
          onClick={handleCreate}
          disabled={!formValid || createLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
        >
          {createLoading ? <><Spinner /> Submitting…</> : <><PlusIcon /> Create Quest</>}
        </button>
      </div>

      {/* Active Quests List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-black text-sm uppercase tracking-wider">
            Active Quests
            <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">{activeQuests.length}</span>
            <span className="ml-1 text-gray-600 font-normal text-xs">/ {totalQuestCount} total</span>
          </h3>
          <button onClick={() => refresh()} className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors">
            <RefreshIcon />
          </button>
        </div>

        {questsLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4 justify-center">
            <Spinner /> Loading quests…
          </div>
        )}

        {!questsLoading && activeQuests.length === 0 && (
          <div className="py-8 text-center text-gray-600 text-sm border border-dashed border-white/5 rounded-xl">
            No active quests. Create one above.
          </div>
        )}

        {activeQuests.map((quest) => {
          const start = new Date(Number(quest.startTime) * 1000);
          const end = new Date(Number(quest.endTime) * 1000);
          const rewardEther = formatEther(quest.rewardAmount);
          const progress = quest.maxCompletions > 0n
            ? Math.round((Number(quest.completionCount) / Number(quest.maxCompletions)) * 100)
            : 0;

          return (
            <div key={quest.id.toString()} className="p-3 sm:p-4 bg-[#0d0d0d] border border-white/5 rounded-xl space-y-2 sm:space-y-3 hover:border-purple-500/20 transition-colors">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded px-1.5 py-0.5">
                      #{quest.id.toString()}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
                      {rewardEther} POL
                    </span>
                  </div>
                  <p className="text-white text-sm leading-relaxed truncate-2-lines">{quest.description}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-1.5 text-[10px] sm:text-xs text-gray-500">
                    <span>{start.toLocaleDateString()} - {end.toLocaleDateString()}</span>
                    <span>{quest.completionCount.toString()}/{quest.maxCompletions.toString()} done</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 sm:h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setBatchQuestId(quest.id)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-bold hover:bg-blue-500/20 transition-colors min-h-[36px]"
                >
                  <UsersIcon /> <span className="hidden sm:inline">Batch</span> Complete
                </button>
                <button
                  onClick={() => deactivateQuest(quest.id)}
                  disabled={deactivateLoading}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] sm:text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50 ml-auto min-h-[36px]"
                >
                  {deactivateLoading ? <Spinner /> : <><TrashIcon /> <span className="hidden sm:inline">Deactivate</span></>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <BatchCompleteModal
        questId={batchQuestId}
        isOpen={batchQuestId !== null}
        onClose={() => setBatchQuestId(null)}
        onSubmit={(users, qId) => batchCompleteQuest(users as `0x${string}`[], qId)}
        loading={batchLoading}
      />
    </div>
  );
}

// ─── Marketplace Tab ──────────────────────────────────────────────────────────

const QUEST_TYPE_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  1: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  2: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  3: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  4: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
};

function MarketplaceQuestsTab() {
  const {
    activeQuests, systemStats, questsLoading,
    createQuest, deactivateQuest,
    createHash, createLoading, createSuccess,
    deactivateHash, deactivateLoading, deactivateSuccess,
    refresh, error,
  } = useMarketplaceQuestAdmin();

  // Form state
  const [questType, setQuestType] = useState<number>(QuestType.PURCHASE);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirement, setRequirement] = useState('');
  const [xpReward, setXpReward] = useState('');

  useEffect(() => {
    if (createSuccess && createHash) {
      setTimeout(() => {
        gamificationToasts.txConfirmed();
        setTitle(''); setDescription(''); setRequirement(''); setXpReward('');
        refresh();
      }, 0);
    }
  }, [createSuccess, createHash, refresh]);

  useEffect(() => {
    if (deactivateSuccess && deactivateHash) { setTimeout(() => { gamificationToasts.txConfirmed(); refresh(); }, 0); }
  }, [deactivateSuccess, deactivateHash, refresh]);

  const handleCreate = () => {
    if (!title || !description || !requirement || !xpReward) return;
    createQuest({
      questType,
      title,
      description,
      requirement: parseInt(requirement, 10),
      xpReward: parseInt(xpReward, 10),
    });
  };

  const formValid = title && description && requirement && xpReward && parseInt(requirement, 10) > 0 && parseInt(xpReward, 10) > 0;

  return (
    <div className="space-y-6">
      {/* Errors */}
      {error && <ErrorBanner message={error} onClose={() => {}} />}

      {/* Stats strip */}
      {systemStats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Quests', value: systemStats.totalQuests?.toString() ?? '–' },
            { label: 'Active', value: systemStats.activeQuests?.toString() ?? '–' },
            { label: 'Completions', value: systemStats.totalCompletions?.toString() ?? '–' },
          ].map(s => (
            <div key={s.label} className="p-3 bg-[#0d0d0d] border border-white/5 rounded-xl text-center">
              <p className="text-white font-black text-lg">{s.value}</p>
              <p className="text-gray-600 text-xs uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Form */}
      <div className="p-5 bg-[#0d0d0d] border border-pink-500/20 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-pink-500" />
          <h3 className="text-white font-black text-sm uppercase tracking-wider">Create Marketplace Quest</h3>
        </div>
        <p className="text-xs text-gray-500">XP quests incentivize trading, creation, and social activity. Appear on the Marketplace page for all users.</p>

        {/* Quest Type Selector */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Quest Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {Object.entries(QUEST_TYPE_NAMES).map(([key, name]) => {
              const k = parseInt(key, 10);
              const col = QUEST_TYPE_COLORS[k];
              const selected = questType === k;
              return (
                <button
                  key={key}
                  onClick={() => setQuestType(k)}
                  className={`px-2 py-2 rounded-lg border text-xs font-bold transition-all ${
                    selected
                      ? `${col.bg} ${col.text} ${col.border} scale-105`
                      : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <InputField label="Title" value={title} onChange={setTitle} placeholder="Buy 5 NFTs Challenge" />
        <TextArea label="Description" value={description} onChange={setDescription} placeholder="Purchase at least 5 NFTs from the marketplace to complete this quest." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Requirement (target value)"
            value={requirement}
            onChange={setRequirement}
            type="number"
            placeholder="5"
            min="1"
            note={`e.g. for Purchase: number of NFTs to buy`}
          />
          <InputField
            label="XP Reward"
            value={xpReward}
            onChange={setXpReward}
            type="number"
            placeholder="100"
            min="1"
            note="XP points awarded on completion"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!formValid || createLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-red-600 hover:opacity-90 text-white font-black text-sm uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {createLoading ? <><Spinner /> Submitting…</> : <><PlusIcon /> Create Quest</>}
        </button>
      </div>

      {/* Active Quests List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-black text-sm uppercase tracking-wider">
            Active Quests
            <span className="ml-2 px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold">{activeQuests.length}</span>
          </h3>
          <button onClick={() => refresh()} className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors">
            <RefreshIcon />
          </button>
        </div>

        {questsLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4 justify-center">
            <Spinner /> Loading quests…
          </div>
        )}

        {!questsLoading && activeQuests.length === 0 && (
          <div className="py-8 text-center text-gray-600 text-sm border border-dashed border-white/5 rounded-xl">
            No active marketplace quests. Create one above.
          </div>
        )}

        {activeQuests.map((quest) => {
          const col = QUEST_TYPE_COLORS[quest.questType] ?? QUEST_TYPE_COLORS[0];
          return (
            <div key={quest.questId.toString()} className="p-4 bg-[#0d0d0d] border border-white/5 rounded-xl space-y-2 hover:border-pink-500/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold rounded px-1.5 py-0.5 border ${col.bg} ${col.text} ${col.border}`}>
                      {QUEST_TYPE_NAMES[quest.questType as keyof typeof QUEST_TYPE_NAMES]}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">
                      {quest.xpReward.toString()} XP
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 bg-white/5 rounded px-1.5 py-0.5">
                      ID #{quest.questId.toString()}
                    </span>
                  </div>
                  <p className="text-white text-sm font-bold">{quest.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{quest.description}</p>
                  <p className="text-gray-600 text-xs mt-1">Requirement: {quest.requirement.toString()} units</p>
                </div>
                <button
                  onClick={() => deactivateQuest(quest.questId)}
                  disabled={deactivateLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {deactivateLoading ? <Spinner /> : <TrashIcon />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type TabId = 'collaborator' | 'marketplace';

const TABS: { id: TabId; label: string; shortLabel: string; color: string; dot: string; icon: string }[] = [
  { id: 'collaborator', label: 'Collaborator Quests', shortLabel: 'Collab', color: 'from-purple-600 to-indigo-600', dot: 'bg-purple-500', icon: '👥' },
  { id: 'marketplace',  label: 'Marketplace Quests', shortLabel: 'Market',  color: 'from-pink-600 to-red-600',     dot: 'bg-pink-500',   icon: '🏪'   },
];

export default function QuestManager() {
  const [activeTab, setActiveTab] = useState<TabId>('collaborator');

  return (
    <div className="card-unified rounded-xl border border-[rgba(139,92,246,0.2)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.25)] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Quest Manager</h3>
            <p className="text-[10px] text-slate-500">Create & manage quests for Collaborator Portal and Marketplace</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">

      {/* Tab Bar - Mobile Optimized */}
      <div className="flex gap-2 p-1 bg-[#0a0a0a] border border-white/5 rounded-xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wide transition-all min-h-[44px] ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="sm:hidden">{tab.icon}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${activeTab === tab.id ? 'bg-white' : tab.dot} transition-colors hidden sm:inline`} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'collaborator' && <CollaboratorQuestsTab />}
      {activeTab === 'marketplace'  && <MarketplaceQuestsTab />}
      </div>
    </div>
  );
}
