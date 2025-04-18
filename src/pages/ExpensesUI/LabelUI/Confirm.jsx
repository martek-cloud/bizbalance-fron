// LabelUI/Confirm.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useExpenseTypeStore from "@/store/typeStore";

const Confirm = ({ form, onPrevious, onSubmit , isSubmitting }) => {
  const { types } = useExpenseTypeStore();
  const values = form.getValues();

  // Find the selected type
  const selectedType = types.find(type => type.id.toString() === values.type_id);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Review Information</h3>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Selected Type</h4>
            <p className="text-sm text-muted-foreground">
              {selectedType ? `${selectedType.name} (${selectedType.range})` : 'No type selected'}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Labels to Create</h4>
            <ScrollArea className="h-[200px] w-full rounded-md">
              <div className="space-y-2">
                {values.labels.map((label, index) => (
                  <div key={index} className="p-3 border rounded-md bg-muted/50">
                    <p className="font-bold">Label {index + 1}</p>
                    <p className="text-sm text-muted-foreground">{label.name}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onPrevious}>Previous</Button>
        <Button
                onClick={() => onSubmit(form.getValues())}
                disabled={isSubmitting}  // Disable button when submitting
            >
                {isSubmitting ? "Create Labels..." : "Create Labels"}
            </Button>
      </div>
    </div>
  );
};

export default Confirm;