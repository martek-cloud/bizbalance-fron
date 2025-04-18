import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Update the schema with new fields
const formSchema = z.object({
  business_name: z.string().min(1, "Business name is required").max(255),
  business_address: z.string().max(255).optional().nullable(),
  city_state_zip: z.string().max(255).optional().nullable(),
  ein: z.string().max(50).optional().nullable(),
  accounting_method: z.enum(["Cash", "Credit Card", "Digital"], {
    required_error: "Please select an accounting method",
  }),
  material_participation: z.string().max(255).optional().nullable(),
  business_start_date: z.string().optional().nullable(),
  required_1099: z.enum(["yes", "no"]).optional().nullable(),
  income_tax_rate: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0).max(100).optional().nullable()
  ),
  // Home Office Use Ratio fields
  office_square_footage: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0).optional().nullable()
  ),
  home_square_footage: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0).optional().nullable()
  ),
  // Ownership fields
  ownership_type: z.enum(["rent", "own"]).optional().nullable(),
  // Basis fields (only required if ownership_type is "own")
  purchase_price: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0).optional().nullable()
  ),
  cost_of_purchase: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0).optional().nullable()
  ),
  land_value: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0).optional().nullable()
  ),
  improvements: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0).optional().nullable()
  ),
  // Mortgage fields
  mortgage_interest: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0).optional().nullable()
  ),
  total_mortgage_interest: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0).optional().nullable()
  ),
});

const BusinessForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [businessUseRatio, setBusinessUseRatio] = useState(0);
  const [totalBasis, setTotalBasis] = useState(0);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_name: initialData?.business_name || "",
      business_address: initialData?.business_address || "",
      city_state_zip: initialData?.city_state_zip || "",
      ein: initialData?.ein || "",
      accounting_method: initialData?.accounting_method || undefined,
      material_participation: initialData?.material_participation || "",
      business_start_date: initialData?.business_start_date || "",
      required_1099: initialData?.required_1099 || undefined,
      income_tax_rate: initialData?.income_tax_rate || "",
      // Home Office Use Ratio default values
      office_square_footage: initialData?.office_square_footage || "",
      home_square_footage: initialData?.home_square_footage || "",
      // Ownership default values
      ownership_type: initialData?.ownership_type || undefined,
      // Basis default values
      purchase_price: initialData?.purchase_price || "",
      cost_of_purchase: initialData?.cost_of_purchase || "",
      land_value: initialData?.land_value || "",
      improvements: initialData?.improvements || "",
      // Mortgage default values
      mortgage_interest: initialData?.mortgage_interest || "",
      total_mortgage_interest: initialData?.total_mortgage_interest || "",
    },
  });

  // Watch fields to calculate Business Use Ratio
  const officeSquareFootage = form.watch("office_square_footage");
  const homeSquareFootage = form.watch("home_square_footage");
  const ownershipType = form.watch("ownership_type");
  
  // Watch basis fields to calculate Total Basis
  const purchasePrice = form.watch("purchase_price");
  const costOfPurchase = form.watch("cost_of_purchase");
  const landValue = form.watch("land_value");
  const improvements = form.watch("improvements");

  // Calculate Business Use Ratio when office or home square footage changes
  useEffect(() => {
    if (officeSquareFootage && homeSquareFootage && Number(homeSquareFootage) > 0) {
      const ratio = (Number(officeSquareFootage) / Number(homeSquareFootage)) * 100;
      setBusinessUseRatio(ratio.toFixed(2));
    } else {
      setBusinessUseRatio(0);
    }
  }, [officeSquareFootage, homeSquareFootage]);

  // Calculate Total Basis when any of the basis fields change
  useEffect(() => {
    const price = Number(purchasePrice) || 0;
    const cost = Number(costOfPurchase) || 0;
    const land = Number(landValue) || 0;
    const improve = Number(improvements) || 0;
    
    // Total Basis = Purchase Price + Cost of Purchase + Improvements - Land Value
    const total = price + cost - improve - land;
    setTotalBasis(total >= 0 ? total : 0);
  }, [purchasePrice, costOfPurchase, landValue, improvements]);

  return (
    <ScrollArea className="h-[500px]">

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter business name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter business address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city_state_zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City, State, ZIP</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State, ZIP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EIN</FormLabel>
                    <FormControl>
                      <Input placeholder="XX-XXXXXXX" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter your Employer Identification Number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accounting_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">Accounting Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select accounting method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Digital">Digital</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="material_participation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Participation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter material participation"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="income_tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Enter tax rate"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a value between 0 and 100
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="required_1099"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required 1099</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes-1099" />
                          <label htmlFor="yes-1099" className="cursor-pointer">
                            Yes
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no-1099" />
                          <label htmlFor="no-1099" className="cursor-pointer">
                            No
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Home Office Use Ratio Section */}
        <Card>
          <CardHeader>
            <CardTitle>Home Office Use Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="office_square_footage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office Square Footage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter office square footage"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="home_square_footage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Square Footage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter home square footage"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Business Use Ratio (%)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={businessUseRatio}
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
                <FormDescription>
                  Calculated as: (Office Sq.Ft / Home Sq.Ft) × 100
                </FormDescription>
              </FormItem>
            </div>
          </CardContent>
        </Card>

        {/* Property Ownership Section */}
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="ownership_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ownership Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rent" id="rent" />
                        <label htmlFor="rent" className="cursor-pointer">
                          Rent
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="own" id="own" />
                        <label htmlFor="own" className="cursor-pointer">
                          Own
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Basis Fields - Only show if ownership type is "own" */}
            {ownershipType === "own" && (
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-4">Property Basis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="purchase_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter purchase price"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cost_of_purchase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost of Purchase ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter cost of purchase"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="land_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Land Value ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter land value"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="improvements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Improvements ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter improvements value"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem className="md:col-span-2">
                    <FormLabel>Total Basis ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        value={totalBasis.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>
                      Calculated as: Purchase Price + Cost of Purchase - Improvements - Land Value
                    </FormDescription>
                  </FormItem>
                </div>
              </div>
            )}
          </CardContent>
          
        </Card>

        {/* Mortgage Interest Section */}
        <Card>
          <CardHeader>
            <CardTitle>Mortgage Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="mortgage_interest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mortgage Interest ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter mortgage interest"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_mortgage_interest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Mortgage Interest ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter total mortgage interest"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
    </ScrollArea>
  );
};

export default BusinessForm;
