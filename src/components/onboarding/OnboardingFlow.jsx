import React, { useState } from 'react';
import Step1Profile from './Step1Profile';
import Step2Subjects from './Step2Subjects';
import Step3Confirm from './Step3Confirm';
import { useApp } from '../../context/AppContext';
import { SUBJECT_COLOURS } from '../../utils/grades';

export default function OnboardingFlow() {
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ name: '', school: '', programme: 'DP', year: 'Year 1', examSession: '' });
  const [subjects, setSubjects] = useState([
    { id: crypto.randomUUID(), name: '', level: 'SL', group: '1', colour: SUBJECT_COLOURS[0] }
  ]);

  const handleFinish = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING', profile, subjects: subjects.filter(s => s.name.trim()) });
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-syne font-extrabold text-3xl text-white mb-1">IB Central</h1>
          <p className="text-[#8b9dc3] text-sm">Your all-in-one IB companion</p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1,2,3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${step >= n ? 'bg-blue-500 text-white' : 'bg-navy-700 text-[#8b9dc3]'}`}>{n}</div>
              {n < 3 && <div className={`w-12 h-0.5 transition-all ${step > n ? 'bg-blue-500' : 'bg-navy-700'}`} />}
            </div>
          ))}
        </div>
        {step === 1 && <Step1Profile profile={profile} setProfile={setProfile} onNext={() => setStep(2)} />}
        {step === 2 && <Step2Subjects subjects={subjects} setSubjects={setSubjects} programme={profile.programme} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
        {step === 3 && <Step3Confirm profile={profile} subjects={subjects} onBack={() => setStep(2)} onFinish={handleFinish} />}
      </div>
    </div>
  );
}
