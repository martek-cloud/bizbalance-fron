// FormLayout.jsx
import React from 'react';
import { CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const FormLayout = ({ 
  children, 
  title, 
  description, 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrevious,
  isNextDisabled = false,
  isSubmitting = false
}) => {
  const isLastStep = currentStep === totalSteps;
  
  return (
    <div className="w-full mx-auto">
      <div className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <div className="w-2/3 mx-auto">
        {children}
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onPrevious}
            disabled={currentStep === 1 || isSubmitting}
            >
            Previous
          </Button>
          <Button 
            onClick={onNext}
            disabled={isNextDisabled}
            >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : isLastStep ? (
              'Submit'
            ) : (
              'Next'
            )}
          </Button>
        </CardFooter>
            </div>
      </div>
    </div>
  );
};

export default FormLayout;