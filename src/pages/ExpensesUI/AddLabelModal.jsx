import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "@/lib/axios";

const AddLabelModal = ({ isOpen, onClose, typeId, typeName, onSubmit }) => {
  const [labelName, setLabelName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!labelName.trim()) {
      setError('Label name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Call the API to create a new label with all required fields
      const response = await axios.post('/api/expense-labels', {
        label_name: labelName,
        type_id: typeId,
        labels: [{ name: labelName }], // Send labels as an array of objects with name property
        expense_method: 'amount' // Add the expense_method field as required by the API
      });
      
      // Call the onSubmit callback with the new label data
      onSubmit(response.data);
      
      // Reset the form and close the modal
      setLabelName('');
      onClose();
    } catch (error) {
      console.error('Error creating label:', error);
      setError('Failed to create label. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Label to {typeName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="labelName" className="text-right">
                Label Name
              </Label>
              <Input
                id="labelName"
                value={labelName}
                onChange={(e) => setLabelName(e.target.value)}
                className="col-span-3"
                placeholder="Enter label name"
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Label'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLabelModal; 