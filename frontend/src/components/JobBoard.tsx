import React, { useState } from 'react';
import { Search, Filter, Share2, Check, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface Job {
  id: number;
  title: string;
  category: string;
  description: string;
  amount: number;
  client: string;
  freelancer: string;
  arbitrator: string;
  status: 'Created' | 'Funded' | 'InReview' | 'Disputed' | 'Completed' | 'Refunded';
  created_at: string;
}

interface JobBoardProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onOpenCreateModal: () => void;
  onViewStats?: () => void;
}

const CATEGORIES = ['All', 'Development', 'Design', 'Writing', 'Web3', 'Marketing'];
const STATUSES = ['All', 'Created', 'Funded', 'InReview', 'Disputed', 'Completed'];

export const JobBoard: React.FC<JobBoardProps> = ({ jobs, onSelectJob, onOpenCreateModal, onViewStats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || job.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus =
      selectedStatus === 'All' || job.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleShareReferral = (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    const referralUrl = `${window.location.origin}/?job=${jobId}&ref=GCAB_GROWTH_LEADER`;
    navigator.clipboard.writeText(referralUrl);
    setCopiedId(jobId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'Created':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">Open for Deposit</span>;
      case 'Funded':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Funded & Active</span>;
      case 'InReview':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Work Submitted</span>;
      case 'Disputed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1"><AlertTriangle className="w-3 h-3" /><span>Disputed</span></span>;
      case 'Completed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center space-x-1"><ShieldCheck className="w-3 h-3 text-purple-400" /><span>Completed</span></span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400">Refunded</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/20 to-slate-900 border border-purple-500/20 p-6 sm:p-8">
        <div className="max-w-2xl">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Trustless Soroban Smart Contracts
          </span>
          <h1 className="mt-3 font-['Outfit'] font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
            Decentralized Escrow & Reputation on <span className="text-gradient">Stellar</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Eliminate payment risk for freelancers and clients with automated milestone deposits, on-chain arbitration, and verifiable reputation badges.
          </p>
          <div className="mt-5 flex items-center space-x-3">
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
            >
              Post Escrow Job
            </button>
            <button
              onClick={onViewStats}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer"
            >
              View Growth Stats
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs by keyword, skills, or contract ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-purple-500 placeholder-slate-500 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-2 border-t border-slate-800 pt-3 text-xs overflow-x-auto">
          <span className="text-slate-500 font-medium shrink-0 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {STATUSES.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedStatus === st
                  ? 'bg-slate-800 text-teal-300 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map(job => (
          <div
            key={job.id}
            onClick={() => onSelectJob(job)}
            className="glass-card glass-card-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
                    {job.category}
                  </span>
                  <h3 className="font-['Outfit'] font-bold text-lg text-white mt-0.5 line-clamp-1">
                    {job.title}
                  </h3>
                </div>
                {getStatusBadge(job.status)}
              </div>
              <p className="mt-2.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {job.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Escrow Value</span>
                <span className="text-base font-extrabold text-teal-300 font-['Outfit']">
                  {job.amount.toLocaleString()} <span className="text-xs font-semibold text-slate-400">XLM</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={e => handleShareReferral(e, job.id)}
                  className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all flex items-center space-x-1"
                  title="Share job link with referral tracking"
                >
                  {copiedId === job.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Share</span>
                    </>
                  )}
                </button>

                <button className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-medium flex items-center space-x-1 transition-all">
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
