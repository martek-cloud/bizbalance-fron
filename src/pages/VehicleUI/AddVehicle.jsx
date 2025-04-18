import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Building2, DollarSign, Loader2, Info } from 'lucide-react';
import useBusinessStore from "@/store/businessStore";
import useVehicleStore from "@/store/vehicleStore";
import { toast } from "react-hot-toast";

// Update the form schema with stricter validation
const formSchema = z.object({
  business_id: z.string().min(1, "Business is required").transform(val => parseInt(val, 10)),
  date_placed_in_service: z.string().min(1, "Date in service is required"),
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  cost: z.string()
    .min(1, "Cost is required")
    .refine(val => !isNaN(val) && parseFloat(val) > 0, "Cost must be a positive number")
    .transform(val => parseFloat(val)),
  ownership_type: z.enum(['Own', 'Lease'], {
    required_error: "Ownership type is required",
  }),
  deduction_type: z.enum(['Standard', 'Actuals'], {
    required_error: "Deduction type is required",
  }),
  jan_miles: z.string()
    .min(1, "January miles is required")
    .refine(val => !isNaN(val) && parseFloat(val) >= 0, "January miles must be a positive number")
    .transform(val => parseFloat(val)),
  personal_miles: z.string()
    .min(1, "Personal miles is required")
    .refine(val => !isNaN(val) && parseFloat(val) >= 0, "Personal miles must be a positive number")
    .transform(val => parseFloat(val)),
});

// Vehicle makes array remains the same
const vehicleMakes = [ "Acura", "Alfa Romeo", "AM General", "Aston Martin", "Audi",
  "Bentley", "BMW", "Bugatti", "Buick", "Cadillac", "Chevrolet",
  "Chrysler", "Daewoo", "Dodge", "Eagle", "Ferrari", "FIAT",
  "Fisker", "Ford", "Genesis", "Geo", "GMC", "Honda", "HUMMER",
  "Hyundai", "INEOS", "INFINITI", "Isuzu", "Jaguar", "Jeep",
  "Karma", "Kia", "Lamborghini", "Land Rover", "Lexus", "Lincoln",
  "Lotus", "Lucid", "Maserati", "Maybach", "Mazda", "McLaren",
  "Mercedes-Benz", "Mercury", "MINI", "Mitsubishi", "Nissan",
  "Oldsmobile", "Panoz", "Plymouth", "Polestar", "Pontiac",
  "Porsche", "Ram", "Rivian", "Rolls-Royce", "Saab", "Saturn",
  "Scion", "smart", "Spyker", "Subaru", "Suzuki", "Tesla",
  "Toyota", "VinFast", "Volkswagen", "Volvo"];

const AddVehicle = ({ onClose }) => {
  const { businesses, fetchBusinesses } = useBusinessStore();
  const { addVehicle } = useVehicleStore();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_id: '',
      date_placed_in_service: '',
      vehicle_make: '',
      cost: '',
      ownership_type: '',
      deduction_type: '',
      jan_miles: '',
      personal_miles: '0', // Set default value for personal miles to '0'
    },
  });

  React.useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleSubmit = async (data) => {
    try {
      const success = await addVehicle(data);
      if (success) {
        form.reset();
        // toast.success('Vehicle added successfully');
        onClose && onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to add vehicle');
    }
  };

  return (
    <div className="w-full bg-background">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Business Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Business Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="business_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business<span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a business" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businesses?.length > 0 ? (
                          businesses.map((business) => (
                            <SelectItem key={business.id} value={business.id.toString()}>
                              {business.business_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-businesses" disabled>
                            No businesses available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Vehicle Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Vehicle Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vehicle_make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Make<span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {vehicleMakes.map((make) => (
                          <SelectItem key={make} value={make}>
                            {make}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_placed_in_service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date in Service<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          placeholder="0.00" 
                          {...field}
                          className="pl-8" 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jan_miles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>January Miles<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1"
                        min="0"
                        placeholder="Enter January miles" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personal_miles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Miles<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1"
                        min="0"
                        placeholder="Enter Personal Miles" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Vehicle Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Vehicle Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ownership_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ownership Type<span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ownership type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Own">Own</SelectItem>
                        <SelectItem value="Lease">Lease</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deduction_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deduction Type<span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select deduction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Actuals">Actuals</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="min-w-[120px]"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : 'Save Vehicle'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddVehicle;