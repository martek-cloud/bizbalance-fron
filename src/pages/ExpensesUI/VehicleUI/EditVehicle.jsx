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