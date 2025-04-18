// TypeUI/Confirm.jsx
import React from "react";
import { Button } from "@/components/ui/button";

const Confirm = ({ form, onPrevious, onSubmit, isEditing, isSubmitting  }) => {
    const values = form.getValues();
  
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        onSubmit(values);
      };

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Review Information</h3>
  
          <div className="space-y-2 p-4 border rounded-md">
            <p>
              <strong>Range:</strong> {values.range === 'home_office' ? 'Home Office' : 'Vehicle'}
            </p>
            <p>
              <strong>Name:</strong> {values.name}
            </p>
            <p>
              <strong>Description:</strong> {values.description}
            </p>
          </div>
        </div>
  
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                >
                    {isSubmitting 
                        ? (isEditing ? "Updating..." : "Adding...") 
                        : (isEditing ? "Update Type" : "Add Type")
                    }
                </Button>
        </div>
      </div>
    );
  };
  
  export default Confirm;