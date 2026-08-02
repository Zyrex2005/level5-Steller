import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { JobBoard, Job } from './components/JobBoard';
import { CreateJobModal } from './components/CreateJobModal';
import { JobDetailModal } from './components/JobDetailModal';
import { StatsPage } from './pages/StatsPage';
import { analytics } from './utils/analytics';

const INITIAL_JOBS: Job[] = [
  {
    id: 1,
    title: 'Soroban Escrow Smart Contract Audit',
    category: 'Development',
    description: 'Comprehensive security audit and test suite expansion for a Soroban Rust contract.',
    amount: 1250,
    client: 'GCL...CLIENT1',
    freelancer: 'GBX...FREELANCE1',
    arbitrator: 'GAR...ARBITER',
    status: 'Funded',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 2,
    title: 'SkillEscrow Mobile Dashboard UI',
    category: 'Design',
    description: 'Figma and React frontend components for mobile responsive escrow management.',
    amount: 850,
    client: 'GCL...CLIENT2',
    freelancer: 'GBX...FREELANCE2',
    arbitrator: 'GAR...ARBITER',
    status: 'InReview',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 3,
    title: 'Stellar Testnet Integration Docs',
    category: 'Writing',
    description: 'Write step-by-step developer tutorial for integrating freighter wallet and Soroban RPC.',
    amount: 400,
    client: 'GCL...CLIENT1',
    freelancer: 'GBX...FREELANCE3',
    arbitrator: 'GAR...ARBITER',
    status: 'Completed',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 4,
    title: 'Cross-Chain Bridge Specification',
    category: 'Web3',
    description: 'Architecture specification for bridging Stellar escrow tokens to Ethereum testnets.',
    amount: 2100,
    client: 'GCL...CLIENT3',
    freelancer: 'GBX...FREELANCE1',
    arbitrator: 'GAR...ARBITER',
    status: 'Disputed',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export function App() {
  const [currentTab, setCurrentTab] = useState<'jobs' | 'stats'>('jobs');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  useEffect(() => {
    analytics.track('page_view');
  }, []);

  const handleConnectWallet = (demo: boolean = false) => {
    if (demo) {
      const demoWallet = 'GCAB' + Math.random().toString(36).substring(2, 10).toUpperCase() + 'TESTNET';
      setWalletAddress(demoWallet);
      setIsPreviewMode(false);
      setOnboardingStep(2);
      analytics.track('wallet_connect', demoWallet, { type: 'demo' });
    } else {
      // Standard Freighter check simulation
      const freighterWallet = 'GDFR' + Math.random().toString(36).substring(2, 10).toUpperCase() + 'FREIGHTER';
      setWalletAddress(freighterWallet);
      setIsPreviewMode(false);
      setOnboardingStep(2);
      analytics.track('wallet_connect', freighterWallet, { type: 'freighter' });
    }
  };

  const handleTogglePreviewMode = () => {
    setIsPreviewMode(prev => !prev);
    if (!isPreviewMode) {
      setWalletAddress(null);
    }
  };

  const handleCreateJob = (jobData: { title: string; category: string; description: string; amount: number; freelancer: string }) => {
    const newJob: Job = {
      id: jobs.length + 1,
      title: jobData.title,
      category: jobData.category,
      description: jobData.description,
      amount: jobData.amount,
      client: walletAddress || 'GCL...CLIENT_PREVIEW',
      freelancer: jobData.freelancer,
      arbitrator: 'GAR...ARBITER_DEFAULT',
      status: 'Created',
      created_at: new Date().toISOString()
    };

    setJobs([newJob, ...jobs]);
    setOnboardingStep(3);
  };

  const handleUpdateJobStatus = (jobId: number, newStatus: Job['status']) => {
    setJobs(prevJobs =>
      prevJobs.map(j => (j.id === jobId ? { ...j, status: newStatus } : j))
    );

    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob({ ...selectedJob, status: newStatus });
    }

    if (newStatus === 'Completed') {
      setOnboardingStep(4);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E17] text-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* Header Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        walletAddress={walletAddress}
        isPreviewMode={isPreviewMode}
        onConnectWallet={handleConnectWallet}
        onTogglePreviewMode={handleTogglePreviewMode}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onboardingStep={onboardingStep}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'jobs' ? (
          <JobBoard
            jobs={jobs}
            onSelectJob={job => setSelectedJob(job)}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <StatsPage />
        )}
      </main>

      {/* Create Escrow Modal */}
      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateJob={handleCreateJob}
        walletAddress={walletAddress}
      />

      {/* Job Detail & Escrow Action Modal */}
      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onUpdateJobStatus={handleUpdateJobStatus}
        walletAddress={walletAddress}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0E17] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">SkillEscrow L5</span>
            <span>•</span>
            <span>Stellar Soroban Testnet</span>
          </div>
          <div>
            <span>Growth & Product Iteration • Built with React, Vite & Rust</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
