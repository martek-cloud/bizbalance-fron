// LabelUI/LabelInfo.jsx
import React from "react";
import { useFieldArray } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import useAuthStore from "@/store/authStore";
import useExpenseTypeStore from "@/store/typeStore";

export default function LabelInfo({ form, onNext, onPrevious }) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role_type === 'admin';
  const { getTypeById } = useExpenseTypeStore();
  
  // Get the selected type and its range
  const selectedTypeId = form.getValues("type_id");
  const selectedType = getTypeById(parseInt(selectedTypeId));
  const isVehicleRange = selectedType?.range === "vehicle";
  const isHomeOfficeRange = selectedType?.range === "home_office";

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "labels"
  });

  const handleNext = async () => {
    const fieldsToValidate = ["labels"];
    
    // Only validate these fields if not home office range
    if (!isHomeOfficeRange) {
      if (isVehicleRange && isAdmin) {
        fieldsToValidate.push("computable");
      }
      fieldsToValidate.push("expense_method");
    }
    
    const result = await form.trigger(fieldsToValidate);
    if (result) {
      onNext();
    }
  };

  const addNewLabel = () => {
    append({ name: "" });
  };

  return (
    <div className="space-y-6">
      {/* Common Settings Section */}
       {isVehicleRange &&
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Common Settings</h3>
        <div className="space-y-6">
          {/* Only show computable for admin and vehicle range */}
          {isAdmin  && (
            <FormField
              control={form.control}
              name="computable"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Computable</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Only show expense method if not home office range */}
          {!isHomeOfficeRange && (
            <FormField
              control={form.control}
              name="expense_method"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Expense Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="mileage" />
                        </FormControl>
                        <FormLabel className="font-normal">Mileage</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="amount" />
                        </FormControl>
                        <FormLabel className="font-normal">Amount</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </Card>}

      {/* Labels Section */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Labels</h3>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
                <FormField
                  control={form.control}
                  name={`labels.${index}.name`}
                  render={({ field: inputField }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{`Label ${index + 1}`}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input {...inputField} placeholder="Enter label name" />
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        <Button
          type="button"
          variant="outline"
          onClick={addNewLabel}
          className="w-full mt-4"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Label
        </Button>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
}