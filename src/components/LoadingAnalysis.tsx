'use client';

import { useEffect, useState } from 'react';

const steps = [
  { label: 'Searching for subtitles', icon: '🔍' },
  { label: 'Downloading subtitle file', icon: '📥' },
  { label: 'Parsing subtitle content', icon: '📄' },
  { label: 'AI analyzing for profanity', icon: '🤖' },
  { label: 'Categorizing and scoring', icon: '📊' },
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
    <div className="max-w-lg mx-auto py-16">
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-3xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        </div>

        <h2 className="text-xl font-semibold text-[#e8e8f0] mb-2">
          Analyzing &ldquo;{title}&rdquo;
        </h2>
        <p className="text-[#6b7280] mb-8 text-sm">
          This may take a moment while we process the subtitles...
        </p>

        <div className="space-y-3 text-left">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                index < currentStep
                  ? 'bg-emerald-500/10'
                  : index === currentStep
                  ? 'bg-[#8b5cf6]/10'
                  : 'opacity-40'
              }`}
            >
              <span className="text-lg">{step.icon}</span>
              <span
                className={`text-sm ${
                  index < currentStep
                    ? 'text-emerald-400'
                    : index === currentStep
                    ? 'text-[#a78bfa]'
                    : 'text-[#6b7280]'
                }`}
              >
                {step.label}
              </span>
              {index < currentStep && (
                <svg
                  className="w-4 h-4 text-emerald-400 ml-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {index === currentStep && (
                <div className="w-4 h-4 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
