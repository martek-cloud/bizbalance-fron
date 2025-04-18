'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { date: '2024-01-01', vehicle: 100, homeOffice: 50 },
  { date: '2024-02-01', vehicle: 120, homeOffice: 70 },
  { date: '2024-03-01', vehicle: 150, homeOffice: 90 },
  { date: '2024-04-01', vehicle: 180, homeOffice: 110 },
  { date: '2024-05-01', vehicle: 200, homeOffice: 130 },
];

export const VehicleHomeOfficeExp = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle vs Home Office Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="vehicle" stroke="#8884d8" fill="#8884d8" name="Vehicle" />
            <Area type="monotone" dataKey="homeOffice" stroke="#82ca9d" fill="#82ca9d" name="Home Office" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 