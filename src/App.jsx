import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Dashboard from './components/dashboard/Dashboard';
import GradeTracker from './components/grades/GradeTracker';
import SubjectsHub from './components/subjects/SubjectsHub';
import Planner from './components/planner/Planner';
import CasTracker from './components/cas/CasTracker';
import Settings from './components/settings/Settings';
import BottomNav from './components/shared/BottomNav';

function AppInner() {
  const { state } = useApp();
  const [tab, setTab] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!state.onboarded) return <OnboardingFlow />;

  return (
    <div className="min-h-screen bg-navy-950 relative">
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
      
      <button
        onClick={() => setSettingsOpen(true)}
        className="fixed top-4 right-4 z-30 w-10 h-10 flex items-center justify-center bg-navy-900 border border-navy-700 rounded-xl text-lg hover:bg-navy-800 transition-all"
        aria-label="Settings"
      >
        ⚙️
      </button>

      <div className="max-w-2xl mx-auto">
        {tab === 'home' && <Dashboard onNavigate={setTab} />}
        {tab === 'grades' && <GradeTracker />}
        {tab === 'subjects' && <SubjectsHub />}
        {tab === 'planner' && <Planner />}
        {tab === 'cas' && <CasTracker />}
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
