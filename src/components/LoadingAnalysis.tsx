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
      <div className="bg-[#131316] border border-[#27272a] rounded-xl p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[#06b6d4]/10 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
        </div>

        <h2 className="text-lg font-semibold text-[#fafafa] mb-1">
          Analyzing &ldquo;{title}&rdquo;
        </h2>
        <p className="text-[#71717a] mb-6 text-sm">
          This may take a moment...
        </p>

        <div className="space-y-2 text-left">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                index < currentStep ? 'bg-[#22c55e]/5' : index === currentStep ? 'bg-[#06b6d4]/5' : 'opacity-30'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < currentStep
                    ? 'bg-[#22c55e]/15 text-[#22c55e]'
                    : index === currentStep
                    ? 'bg-[#06b6d4]/15 text-[#06b6d4]'
                    : 'bg-[#27272a] text-[#52525b]'
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
                index < currentStep ? 'text-[#22c55e]' : index === currentStep ? 'text-[#06b6d4]' : 'text-[#52525b]'
              }`}>
                {step.label}
              </span>
              {index === currentStep && (
                <div className="w-3 h-3 border-[1.5px] border-[#06b6d4] border-t-transparent rounded-full animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
