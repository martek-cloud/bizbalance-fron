const formSchema = z.object({
  business_id: z.string().min(1, "Business is required"),
  vehicle_name: z.string().min(2, "Vehicle name is required"),
  make: z.string().min(2, "Make is required"),
  model: z.string().min(2, "Model is required"),
  year: z.string().min(4, "Year is required"),
  vin: z.string().optional(),
  jan_miles: z.string().min(1, "January miles is required"),
  personal_miles: z.string().min(1, "Personal miles is required"),
});

// In your form component:
<FormField
  control={form.control}
  name="personal_miles"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Personal Miles</FormLabel>
      <FormControl>
        <Input 
          type="number" 
          min="0" 
          step="0.01" 
          placeholder="Enter personal miles" 
          {...field} 
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/> 