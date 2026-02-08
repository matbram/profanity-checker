'use client';

import { useEffect, useState } from 'react';

const steps = [
  { label: 'Searching for subtitles', icon: '1' },
  { label: 'Downloading subtitle file', icon: '2' },
  { label: 'Parsing subtitle content', icon: '3' },
  { label: 'AI analyzing for profanity', icon: '4' },
  { label: 'Categorizing results', icon: '5' },
];

export default function LoadingAnalysis({ title }: { title: string }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md mx-auto py-20">
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[#0891b2]/8 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#0891b2] border-t-transparent rounded-full animate-spin" />
        </div>

        <h2 className="text-lg font-semibold text-[#0f172a] mb-1">
          Analyzing &ldquo;{title}&rdquo;
        </h2>
        <p className="text-[#64748b] mb-6 text-sm">
          This may take a moment...
        </p>

        <div className="space-y-2 text-left">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                index < currentStep ? 'bg-[#f0fdf4]' : index === currentStep ? 'bg-[#ecfeff]' : 'opacity-30'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < currentStep
                    ? 'bg-[#16a34a]/15 text-[#16a34a]'
                    : index === currentStep
                    ? 'bg-[#0891b2]/15 text-[#0891b2]'
                    : 'bg-[#f1f5f9] text-[#94a3b8]'
                }`}
              >
                {index < currentStep ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              <span className={`text-sm ${
                index < currentStep ? 'text-[#16a34a]' : index === currentStep ? 'text-[#0891b2]' : 'text-[#94a3b8]'
              }`}>
                {step.label}
              </span>
              {index === currentStep && (
                <div className="w-3 h-3 border-[1.5px] border-[#0891b2] border-t-transparent rounded-full animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
