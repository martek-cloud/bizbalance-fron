// StepsIndicator.jsx
import React from 'react';

const StepsIndicator = ({ steps, currentStep }) => {
  const totalSteps = steps.length;
  
  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep === step.id 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : currentStep > step.id
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-muted border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              {currentStep > step.id ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span className={`text-xs mt-2 font-medium ${
              currentStep === step.id 
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-muted h-2 rounded-full mb-6">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepsIndicator;