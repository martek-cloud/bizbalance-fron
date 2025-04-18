// LabelUI/SelectType.jsx
import React from "react";
import { useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useExpenseTypeStore from "@/store/typeStore";

const SelectType = ({ form, onNext }) => {
  const { selectType, fetchSelectTypes } = useExpenseTypeStore();

  useEffect(() => {
    fetchSelectTypes();
  }, []);

  const handleNext = async () => {
    const result = await form.trigger("type_id");
    if (result) {
      onNext();
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="type_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Type</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {selectType.map((type) => (
                      <SelectItem
                        key={type.id}
                        value={type.id.toString()} // Convert id to string
                      >
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="button"
        onClick={handleNext}
        className="w-full"
        disabled={!form.getValues("type_id")} // Disable if no type selected
      >
        Next
      </Button>
    </div>
  );
};

export default SelectType;