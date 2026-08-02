import React, { useState } from 'react';
import { X, ShieldAlert, PlusCircle } from 'lucide-react';
import { analytics } from '../utils/analytics';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJob: (jobData: { title: string; category: string; description: string; amount: number; freelancer: string }) => void;
  walletAddress: string | null;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onCreateJob,
  walletAddress
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Development');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('500');
  const [freelancer, setFreelancer] = useState('GBX...FREELANCER_ADDR');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !amount) return;

    onCreateJob({
      title,
      category,
      description,
      amount: parseFloat(amount),
      freelancer
    });

    analytics.recordTransaction(walletAddress || 'G...PREVIEW', 'create_escrow_job');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card max-w-lg w-full rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-teal-400" />
            <h2 className="font-['Outfit'] font-bold text-lg text-white">Create Soroban Escrow Job</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Soroban Smart Contract Development"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Writing">Writing</option>
                <option value="Web3">Web3</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Deposit Amount (XLM)</label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-teal-300 font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Freelancer Wallet Address</label>
            <input
              type="text"
              required
              placeholder="G..."
              value={freelancer}
              onChange={e => setFreelancer(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Job Description & Milestones</label>
            <textarea
              rows={3}
              required
              placeholder="Describe scope, deliverables, and acceptance criteria..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start space-x-2 text-xs text-purple-200">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p>
              Creating an escrow job registers the agreement on Soroban Testnet. Funds will only be released to the freelancer upon milestone approval or arbitrator dispute resolution.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
            >
              Initialize On-Chain Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
