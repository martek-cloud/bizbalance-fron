// MultiStepForm.jsx
import React, { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import FormLayout from './FormLayout';
import StepsIndicator from './StepsIndicator';
import Step1PersonalInfo from './Step1PersonalInfo';
import Step2ContactDetails from './Step2ContactDetails';
import Step3AccountSetup from './Step3AccountSetup';
import Step4Review from './Step4Review';
import useMainExpenseStore from '@/store/expenseStore';

const MultiStepForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { addExpense, loading } = useMainExpenseStore();
  
  // Form data state to collect data from all steps
  const [formData, setFormData] = useState({
    // Step 1 - Range & Vehicle
    range: '',
    vehicleId: '',
    vehicleDetails: null,
    
    // Step 2 - Expense Type & Label
    expenseTypeId: '',
    expenseLabelId: '',
    method: 'direct',
    
    // Step 3 - Expense Details
    expenseDate: '',
    expenseAmount: '',
    odometerReading: '',
    businessMiles: '',
    startingOdometerReading: '',
    personalMiles: '',
    note: ''
  });
  
  // Track validation status for steps
  const [stepsValid, setStepsValid] = useState({
    1: false,
    2: false,
    3: false,
    4: true  // Review step is always valid
  });
  
  const formSteps = [
    { id: 1, title: 'Select Range' },
    { id: 2, title: 'Expense Type' },
    { id: 3, title: 'Details' },
    { id: 4, title: 'Review & Submit' }
  ];
  
  // Update step validation status
  const setStepValid = (step, isValid) => {
    setStepsValid(prev => ({
      ...prev,
      [step]: isValid
    }));
  };

  const handleNext = () => {
    if (currentStep < formSteps.length) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === formSteps.length) {
      // Handle form submission on final step
      handleSubmit();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Prepare data for submission to match the store's expected format
  const prepareExpenseData = () => {
    // Determine expense method from the selected label or vehicle details
    let expenseMethod = 'amount';
    if (formData.range === 'vehicle' && formData.odometerReading && formData.businessMiles) {
      expenseMethod = 'mileage';
    }
    
    // Calculate the final odometer reading for mileage expenses
    let finalOdometerReading = null;
    if (expenseMethod === 'mileage' && formData.odometerReading && formData.businessMiles) {
      finalOdometerReading = parseFloat(formData.odometerReading) + 
                            parseFloat(formData.businessMiles) + 
                            parseFloat(formData.vehicleDetails?.personal_miles || 0);
    }
    
    const data = {
      // Core data
      range: formData.range,
      vehicle_id: formData.range === 'vehicle' ? formData.vehicleId : null,
      type_id: formData.expenseTypeId,
      label_id: formData.expenseLabelId,
      date: new Date(formData.expenseDate),
      expense_method: expenseMethod,
      method: formData.method || 'direct',
      
      // Method-specific data
      amount: expenseMethod === 'amount' ? parseFloat(formData.expenseAmount) : null,
      
      // Mileage data
      odometer_reading: expenseMethod === 'mileage' ? parseFloat(formData.odometerReading) : null,
      business_miles: expenseMethod === 'mileage' ? parseFloat(formData.businessMiles) : null,
      mileage: expenseMethod === 'mileage' ? parseFloat(formData.businessMiles) : null,
      personal_miles: expenseMethod === 'mileage' ? parseFloat(formData.personalMiles || formData.vehicleDetails?.personal_miles || 0) : null,
      personal_use_percentage: expenseMethod === 'mileage' ? calculatePersonalUsePercentage() : null,
      business_use_percentage: expenseMethod === 'mileage' ? calculateBusinessUsePercentage() : null,
      
      // Default values
      computable: true,
      
      // Calculated values
      starting_odometer_reading: formData.startingOdometerReading ? parseFloat(formData.startingOdometerReading) : null,
      final_odometer_reading: finalOdometerReading,
      
      // Note field
      note: formData.note || ''
    };
    
    console.log('Submitting expense data:', data);
    return data;
  };
  
  // Calculate personal use percentage
  const calculatePersonalUsePercentage = () => {
    if (formData.businessMiles && formData.vehicleDetails?.personal_miles) {
      const businessMiles = parseFloat(formData.businessMiles);
      const personalMiles = parseFloat(formData.vehicleDetails.personal_miles);
      const totalMiles = businessMiles + personalMiles;
      
      if (totalMiles > 0) {
        return ((personalMiles / totalMiles) * 100).toFixed(2);
      }
    }
    return null;
  };
  
  // Calculate business use percentage
  const calculateBusinessUsePercentage = () => {
    if (formData.businessMiles && formData.vehicleDetails?.personal_miles) {
      const businessMiles = parseFloat(formData.businessMiles);
      const personalMiles = parseFloat(formData.vehicleDetails.personal_miles);
      const totalMiles = businessMiles + personalMiles;
      
      if (totalMiles > 0) {
        return ((businessMiles / totalMiles) * 100).toFixed(2);
      }
    }
    return null;
  };
  
  const handleSubmit = async () => {
    // Log the form data to console first
    console.log('Raw form data before submission:', formData);
    console.log('Method field from form data:', formData.method);
    
    try {
      const expenseData = prepareExpenseData();
      // Log the transformed data
      console.log('Transformed expense data:', expenseData);
      console.log('Method field in transformed data:', expenseData.method);
      
      const success = await addExpense(expenseData);
      
      if (success) {
        console.log('Expense added successfully!');
        toast.success('Expense added successfully!');
        navigate('/dashboard/expenses'); // Redirect to expenses list
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error('Failed to add expense. Please try again.');
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PersonalInfo 
            formData={formData} 
            setFormData={setFormData} 
            setStepValid={(isValid) => setStepValid(1, isValid)}
          />
        );
      case 2:
        return (
          <Step2ContactDetails 
            formData={formData} 
            setFormData={setFormData}
            setStepValid={(isValid) => setStepValid(2, isValid)}
          />
        );
      case 3:
        return (
          <Step3AccountSetup 
            formData={formData} 
            setFormData={setFormData}
            setStepValid={(isValid) => setStepValid(3, isValid)}
          />
        );
      case 4:
        return <Step4Review formData={formData} />;
      default:
        return null;
    }
  };
  
  return (
    <FormLayout
      title="New Expense"
      description="Complete all steps to add a new expense"
      currentStep={currentStep}
      totalSteps={formSteps.length}
      onNext={handleNext}
      onPrevious={handlePrevious}
      isNextDisabled={!stepsValid[currentStep] || (currentStep === formSteps.length && loading)}
      isSubmitting={currentStep === formSteps.length && loading}
    >
      <StepsIndicator 
        steps={formSteps} 
        currentStep={currentStep} 
      />
      
      <CardContent>
        {renderStepContent()}
      </CardContent>
    </FormLayout>
  );
};

export default MultiStepForm;