import React from 'react';
import { TrendingUp } from "lucide-react";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { month: "January", income: 186, expences: 80 },
  { month: "February", income: 305, expences: 200 },
  { month: "March", income: 237, expences: 120 },
  { month: "April", income: 73, expences: 190 },
  { month: "May", income: 209, expences: 130 },
  { month: "June", income: 214, expences: 140 },
  { month: "Jully", income: 214, expences: 140 },
  { month: "December", income: 214, expences: 140 }
];

const SalesChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <Tooltip />
            <Bar 
              dataKey="income" 
              fill="hsl(215, 90%, 50%)" 
              radius={4}
              name="Income"
            />
            <Bar 
              dataKey="expences" 
              fill="hsl(280, 90%, 50%)" 
              radius={4}
              name="Expences"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;