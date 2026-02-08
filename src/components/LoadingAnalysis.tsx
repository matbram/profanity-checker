'use client';

const steps = [
  { label: 'Searching for subtitles', icon: '1' },
  { label: 'Downloading subtitle file', icon: '2' },
  { label: 'Parsing subtitle content', icon: '3' },
  { label: 'AI analyzing for profanity', icon: '4' },
  { label: 'Categorizing results', icon: '5' },
];

interface LoadingAnalysisProps {
  title: string;
  currentStep?: number;
}

export default function LoadingAnalysis({ title, currentStep = 0 }: LoadingAnalysisProps) {
  return (
    <div className="max-w-md mx-auto py-20">
      <div className="rounded-xl shadow-sm p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="w-12 h-12 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-muted)' }}>
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        </div>

        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Analyzing &ldquo;{title}&rdquo;
        </h2>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          This may take a moment...
        </p>

        <div className="space-y-2 text-left">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: index < currentStep
                  ? 'var(--loading-done-bg)'
                  : index === currentStep
                  ? 'var(--loading-active-bg)'
                  : undefined,
                opacity: index > currentStep ? 0.3 : 1,
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: index < currentStep
                    ? 'var(--success-muted)'
                    : index === currentStep
                    ? 'var(--accent-muted)'
                    : 'var(--bg-surface)',
                  color: index < currentStep
                    ? 'var(--success-muted-text)'
                    : index === currentStep
                    ? 'var(--accent)'
                    : 'var(--text-faint)',
                }}
              >
                {index < currentStep ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              <span className="text-sm" style={{
                color: index < currentStep
                  ? 'var(--success-muted-text)'
                  : index === currentStep
                  ? 'var(--accent)'
                  : 'var(--text-faint)',
              }}>
                {step.label}
              </span>
              {index === currentStep && (
                <div className="w-3 h-3 border-[1.5px] border-t-transparent rounded-full animate-spin ml-auto" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
