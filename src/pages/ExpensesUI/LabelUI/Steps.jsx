// LabelUI/Steps.jsx
import React from "react";

const Steps = ({ currentStep, steps }) => {
  return (
    <div className="flex justify-center items-center mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
               ${
                 index <= currentStep
                   ? "border-black dark:bg-black dark:border-white"
                   : "dark:bg-gray-300 text-gray-500 border-gray-300"
               }`}
            >
              {index + 1}
            </div>
            <span className="text-sm mt-1">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-24 h-0.5 mx-0 
               ${index < currentStep ? "bg-gray-900" : "bg-gray-300"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Steps;