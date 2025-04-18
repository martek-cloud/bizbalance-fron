'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const NetProfitChart = ({ netProfitBeforeDeductions = [], netProfitAfterDeductions = [] }) => {
    // Array of month names
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Transform the data into a format suitable for the chart
    const data = netProfitBeforeDeductions.map((profit, index) => ({
        name: monthNames[index % 12], // Use month names
        before: Number(profit),
        after: Number(netProfitAfterDeductions[index]),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Net Profit Comparison</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="before" fill="#ff7300" name="Before Deductions" />
                        <Bar dataKey="after" fill="#82ca9d" name="After Deductions" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default NetProfitChart; 