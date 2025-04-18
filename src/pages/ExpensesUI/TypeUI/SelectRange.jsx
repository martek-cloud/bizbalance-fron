import React from "react";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Car, Home, Building, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SelectRange = ({ form, onNext }) => {
    const handleNext = async () => {
        const result = await form.trigger("range");
        if (result) {
            onNext();
        }
    };

    const ranges = [
        {
            value: "operation_expense",
            icon: Building,
            title: "Operation Expense",
            description: "Business operational costs like utilities, rent, supplies, and services",
            color: "emerald"
        },
        {
            value: "vehicle",
            icon: Car,
            title: "Vehicle",
            description: "Vehicle-related expenses like fuel, maintenance, insurance, and mileage",
            color: "blue"
        },
        {
            value: "home_office",
            icon: Home,
            title: "Home Office",
            description: "Home office expenses including utilities, internet, and workspace costs",
            color: "purple"
        }
    ];

    return (
        <div className="space-y-6">
            <FormField
                control={form.control}
                name="range"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-lg font-semibold mb-4 block">Select Range Type</FormLabel>
                        <FormControl>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {ranges.map((range) => {
                                    const Icon = range.icon;
                                    const isSelected = field.value === range.value;
                                    const colorClasses = {
                                        blue: {
                                            selected: "border-blue-500 bg-blue-50 dark:bg-blue-950",
                                            icon: "text-blue-500",
                                            title: "text-blue-700 dark:text-blue-300",
                                            dot: "bg-blue-500",
                                            hover: "hover:border-blue-300 hover:shadow-md hover:shadow-blue-100"
                                        },
                                        purple: {
                                            selected: "border-purple-500 bg-purple-50 dark:bg-purple-950",
                                            icon: "text-purple-500",
                                            title: "text-purple-700 dark:text-purple-300",
                                            dot: "bg-purple-500",
                                            hover: "hover:border-purple-300 hover:shadow-md hover:shadow-purple-100"
                                        },
                                        emerald: {
                                            selected: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950",
                                            icon: "text-emerald-500",
                                            title: "text-emerald-700 dark:text-emerald-300",
                                            dot: "bg-emerald-500",
                                            hover: "hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100"
                                        }
                                    };

                                    const colorClass = colorClasses[range.color] || colorClasses.blue;

                                    return (
                                        <div
                                            key={range.value}
                                            onClick={() => field.onChange(range.value)}
                                            className={cn(
                                                "relative flex flex-col justify-center items-center",
                                                "p-6 rounded-lg cursor-pointer",
                                                "border-2 transition-all duration-300",
                                                "overflow-hidden h-full", // Ensure consistent height
                                                isSelected
                                                    ? `${colorClass.selected} shadow-lg`
                                                    : `border-gray-200 bg-gray-50 dark:bg-gray-800 ${colorClass.hover}`
                                            )}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
                                                    <Check className={`h-4 w-4 ${colorClass.icon}`} />
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-col items-center text-center transition-transform duration-200 hover:scale-105">
                                                <div className={cn(
                                                    "rounded-full p-3 mb-4",
                                                    isSelected 
                                                        ? `bg-opacity-20 bg-${range.color}-200`
                                                        : "bg-gray-100 dark:bg-gray-700"
                                                )}>
                                                    <Icon 
                                                        className={cn(
                                                            "h-12 w-12",
                                                            isSelected
                                                                ? colorClass.icon
                                                                : "text-gray-500"
                                                        )}
                                                    />
                                                </div>
                                                <h3 className={cn(
                                                    "font-semibold text-lg mb-2",
                                                    isSelected
                                                        ? colorClass.title
                                                        : "text-gray-700 dark:text-gray-300"
                                                )}>
                                                    {range.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                                    {range.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 py-6 text-lg"
                disabled={!form.getValues("range")}
            >
                Continue with {form.getValues("range") ? ranges.find(r => r.value === form.getValues("range"))?.title : "Selection"}
            </Button>
        </div>
    );
};

export default SelectRange;