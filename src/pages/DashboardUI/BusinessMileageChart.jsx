'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BusinessMileageChart = ({ monthlyVehicleUsage = [] }) => {
    // Array of month names
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Transform the monthlyVehicleUsage data into a format suitable for the chart
    const data = monthlyVehicleUsage.map((usage, index) => ({
        name: monthNames[index % 12], // Use month names
        value: Number(usage),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Vehicle Usage</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default BusinessMileageChart; 