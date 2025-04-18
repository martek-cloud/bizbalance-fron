// src/components/ExpensesSummary.jsx

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Car, 
  Home, 
  Building2, 
  Shield, 
  Wrench, 
  Wallet, 
  TrendingDown,
  Calculator,
  DollarSign
} from 'lucide-react';

const ExpensesSummary = ({ summaryData }) => {
  // Create a formatter for US currency
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Define category configurations with icons and colors
  const categoryConfig = {
    "Vehicle Expenses": {
      icon: Car,
      color: "bg-blue-100 border-blue-300 text-blue-700",
      iconColor: "text-blue-500"
    },
    "Home Office Expenses": {
      icon: Home,
      color: "bg-purple-100 border-purple-300 text-purple-700",
      iconColor: "text-purple-500"
    },
    "Real Estate Taxes": {
      icon: Building2,
      color: "bg-amber-100 border-amber-300 text-amber-700",
      iconColor: "text-amber-500"
    },
    "Insurance": {
      icon: Shield,
      color: "bg-green-100 border-green-300 text-green-700",
      iconColor: "text-green-500"
    },
    "Repairs and Maintenance": {
      icon: Wrench,
      color: "bg-red-100 border-red-300 text-red-700",
      iconColor: "text-red-500"
    },
    "Rent": {
      icon: Wallet,
      color: "bg-indigo-100 border-indigo-300 text-indigo-700",
      iconColor: "text-indigo-500"
    },
    "Depreciation": {
      icon: TrendingDown,
      color: "bg-orange-100 border-orange-300 text-orange-700",
      iconColor: "text-orange-500"
    },
    "Total Home Office Expense": {
      icon: Calculator,
      color: "bg-teal-100 border-teal-300 text-teal-700",
      iconColor: "text-teal-500"
    },
    "Total": {
      icon: DollarSign,
      color: "bg-slate-100 border-slate-300 text-slate-700",
      iconColor: "text-slate-500"
    }
  };

  // State to manage the input values for editable categories
  const [editableValues, setEditableValues] = useState({
    "Real Estate Taxes": summaryData.find(item => item.category === "Real Estate Taxes")?.total || 0,
    "Insurance": summaryData.find(item => item.category === "Insurance")?.total || 0,
    "Repairs and Maintenance": summaryData.find(item => item.category === "Repairs and Maintenance")?.total || 0,
    "Rent": summaryData.find(item => item.category === "Rent")?.total || 0,
  });

  const handleInputChange = (category, value) => {
    setEditableValues(prevValues => ({
      ...prevValues,
      [category]: value,
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {summaryData.map((item, index) => {
        const config = categoryConfig[item.category] || {
          icon: DollarSign,
          color: "bg-gray-100 border-gray-300 text-gray-700",
          iconColor: "text-gray-500"
        };
        const IconComponent = config.icon;

        return (
          <Card
            key={index}
            className={`p-4 border-2 ${config.color} transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-full ${config.color}`}>
                    <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
                  </div>
                  <h3 className="font-medium">{item.category}</h3>
                </div>
                <div className="space-y-1">
                  {["Real Estate Taxes", "Insurance", "Repairs and Maintenance", "Rent"].includes(item.category) ? (
                    <input
                      type="number"
                      value={editableValues[item.category]}
                      onChange={(e) => handleInputChange(item.category, e.target.value)}
                      className="w-full border rounded p-1 bg-white/50"
                    />
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold">
                          {formatter.format(parseFloat(item.total))}
                        </p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">
                          {formatter.format(parseFloat(item.indirect))}
                        </p>
                        <p className="text-sm text-muted-foreground">Indirect</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ExpensesSummary;