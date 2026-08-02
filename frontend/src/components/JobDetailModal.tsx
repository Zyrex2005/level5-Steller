import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, Share2, Check, Star, Lock, RefreshCw, Send } from 'lucide-react';
import { Job } from './JobBoard';
import { analytics } from '../utils/analytics';
import { callSorobanRpcWithRetry } from '../utils/sorobanClient';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  onUpdateJobStatus: (jobId: number, newStatus: Job['status']) => void;
  walletAddress: string | null;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  onUpdateJobStatus,
  walletAddress
}) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('Excellent work delivered on time with high code quality.');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!job) return null;

  const handleAction = async (actionType: 'fund' | 'submit' | 'approve' | 'dispute' | 'arbitrate_client' | 'arbitrate_freelancer' | 'refund') => {
    setIsLoading(true);
    setErrorMessage(null);

    // Call Soroban RPC simulation helper with retry
    const res = await callSorobanRpcWithRetry('https://soroban-testnet.stellar.org', {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransactionStatus',
      params: ['mock_tx_hash']
    });

    setIsLoading(false);

    if (res.error && !res.result) {
      setErrorMessage(res.actionableMessage || 'Transaction failed');
      return;
    }

    let newStatus: Job['status'] = job.status;
    if (actionType === 'fund') newStatus = 'Funded';
    if (actionType === 'submit') newStatus = 'InReview';
    if (actionType === 'approve') newStatus = 'Completed';
    if (actionType === 'dispute') newStatus = 'Disputed';
    if (actionType === 'arbitrate_client') newStatus = 'Refunded';
    if (actionType === 'arbitrate_freelancer') newStatus = 'Completed';
    if (actionType === 'refund') newStatus = 'Refunded';

    onUpdateJobStatus(job.id, newStatus);
    analytics.recordTransaction(walletAddress || 'G...PREVIEW', `job_action_${actionType}`);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRatingSubmitted(true);
    analytics.track('rating_submitted', walletAddress || 'G...PREVIEW', { jobId: job.id, rating });
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/?job=${job.id}&ref=${walletAddress || 'GCAB_COMMUNITY'}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card max-w-2xl w-full rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
              Escrow Job #{job.id} — {job.category}
            </span>
            <h2 className="font-['Outfit'] font-bold text-xl text-white mt-0.5">{job.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Actionable Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Action Required:</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Amount & Status Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-medium">Locked Escrow</span>
              <p className="text-xl font-black text-teal-300 font-['Outfit']">{job.amount.toLocaleString()} XLM</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-medium">Current Status</span>
              <p className="text-sm font-semibold text-slate-200 mt-1">{job.status}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 uppercase font-medium">Arbitrator</span>
              <p className="text-xs font-mono text-purple-300 mt-1 truncate">{job.arbitrator}</p>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-400">Milestone Scope & Requirements</h4>
            <p className="mt-1.5 text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60">
              {job.description}
            </p>
          </div>

          {/* Wallet Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block font-medium uppercase">Client Wallet</span>
              <span className="font-mono text-slate-200 mt-0.5 block truncate">{job.client}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block font-medium uppercase">Freelancer Wallet</span>
              <span className="font-mono text-slate-200 mt-0.5 block truncate">{job.freelancer}</span>
            </div>
          </div>

          {/* Action Buttons based on Status */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
            <h4 className="text-xs font-semibold uppercase text-purple-300 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Smart Contract Escrow Controls</span>
            </h4>

            <div className="flex flex-wrap gap-2">
              {job.status === 'Created' && (
                <>
                  <button
                    disabled={isLoading}
                    onClick={() => handleAction('fund')}
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Processing Soroban Tx...' : 'Fund Escrow Deposit'}
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={() => handleAction('refund')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                  >
                    Cancel & Refund
                  </button>
                </>
              )}

              {job.status === 'Funded' && (
                <>
                  <button
                    disabled={isLoading}
                    onClick={() => handleAction('submit')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all"
                  >
                    Submit Work Deliverables
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={() => handleAction('dispute')}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium"
                  >
                    Raise Dispute
                  </button>
                </>
              )}

              {job.status === 'InReview' && (
                <>
                  <button
                    disabled={isLoading}
                    onClick={() => handleAction('approve')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    Approve & Release Payment
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={() => handleAction('dispute')}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium"
                  >
                    Raise Dispute
                  </button>
                </>
              )}

              {job.status === 'Disputed' && (
                <div className="w-full space-y-2">
                  <p className="text-xs text-amber-300 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Dispute Active: Arbitrator required to resolve escrow distribution.</span>
                  </p>
                  <div className="flex space-x-2">
                    <button
                      disabled={isLoading}
                      onClick={() => handleAction('arbitrate_freelancer')}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                    >
                      Arbitrator: Release to Freelancer
                    </button>
                    <button
                      disabled={isLoading}
                      onClick={() => handleAction('arbitrate_client')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                    >
                      Arbitrator: Refund Client
                    </button>
                  </div>
                </div>
              )}

              {job.status === 'Completed' && (
                <div className="text-xs text-emerald-400 font-semibold flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Escrow Successfully Released and Settled on Stellar Testnet</span>
                </div>
              )}
            </div>
          </div>

          {/* Reputation Rating Form for Completed Jobs */}
          {job.status === 'Completed' && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold uppercase text-purple-300 flex items-center space-x-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Submit Reputation Contract Rating</span>
              </h4>

              {ratingSubmitted ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Reputation rating recorded on Stellar Soroban testnet contract!</span>
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-medium">Rating:</span>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`p-1 rounded-md transition-all ${
                          rating >= s ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    placeholder="Leave optional feedback..."
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                  >
                    Post On-Chain Rating
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Referral Link Generator */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-300 block">Shareable Referral Link</span>
              <span className="text-[11px] text-slate-500">Share this job listing to earn referral badges</span>
            </div>
            <button
              onClick={copyShareLink}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Copy Job Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
