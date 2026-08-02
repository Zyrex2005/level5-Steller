import React from 'react';
import { Shield, Wallet, Eye, Award, BarChart3, PlusCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface NavbarProps {
  currentTab: 'jobs' | 'stats';
  setCurrentTab: (tab: 'jobs' | 'stats') => void;
  walletAddress: string | null;
  isPreviewMode: boolean;
  onConnectWallet: (demo?: boolean) => void;
  onTogglePreviewMode: () => void;
  onOpenCreateModal: () => void;
  onboardingStep: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  walletAddress,
  isPreviewMode,
  onConnectWallet,
  onTogglePreviewMode,
  onOpenCreateModal,
  onboardingStep
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0E17]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('jobs')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-teal-400 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-[#0B0E17] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-teal-300" />
              </div>
            </div>
            <div>
              <span className="font-['Outfit'] font-bold text-xl tracking-tight text-white">
                Skill<span className="text-gradient">Escrow</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                Soroban L5
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('jobs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'jobs'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Explore Jobs
            </button>
            <button
              onClick={() => setCurrentTab('stats')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'stats'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Public Stats</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Create Job */}
            <button
              onClick={onOpenCreateModal}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-400 to-teal-500 text-slate-950 hover:opacity-95 transition-all shadow-md shadow-teal-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Escrow</span>
            </button>

            {/* Read-Only Preview Toggle */}
            <button
              onClick={onTogglePreviewMode}
              className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                isPreviewMode
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Preview mode allows inspecting escrow workflows without connecting wallet"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{isPreviewMode ? 'Previewing (Read-Only)' : 'Try Preview Mode'}</span>
            </button>

            {/* Wallet Connect */}
            {walletAddress ? (
              <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs font-medium text-purple-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => onConnectWallet(false)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/30 active:scale-95"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Freighter</span>
                </button>
                <button
                  onClick={() => onConnectWallet(true)}
                  className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                  title="Connect instant demo testnet wallet"
                >
                  Demo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Level 5 Onboarding Step Tracker Bar */}
        <div className="py-2.5 px-3 mb-2 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs overflow-x-auto">
          <span className="text-slate-400 font-medium shrink-0 flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Onboarding Progress:</span>
          </span>

          <div className="flex items-center space-x-2 sm:space-x-4 ml-4 font-medium text-slate-300">
            <div className={`flex items-center space-x-1 ${onboardingStep >= 1 ? 'text-teal-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. Connect</span>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <div className={`flex items-center space-x-1 ${onboardingStep >= 2 ? 'text-teal-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2. Select / Fund</span>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <div className={`flex items-center space-x-1 ${onboardingStep >= 3 ? 'text-teal-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. Execute / Review</span>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <div className={`flex items-center space-x-1 ${onboardingStep >= 4 ? 'text-teal-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>4. Rate Reputation</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
