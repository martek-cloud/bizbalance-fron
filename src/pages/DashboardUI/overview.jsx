import React, { useEffect } from 'react';
import { CalendarDateRangePicker } from '@/pages/DashboardUI/calendar-date-range-picker';
import PageContainer from '@/components/page-container';
import RecentUsersBoard from './RecentUsersBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCircle, Tags, Loader2, AlertTriangle } from 'lucide-react';
import authStore from '@/store/authStore';
import dashboardStore from '@/store/dashboardStore';
import SalesChart from './SalesChart';
import { DonutChart } from "./donut-chart"
import { BusinessMileageChart } from './BusinessMileageChart';
import { VehicleHomeOfficeExp } from './VehicleHomeOfficeExp';
import { RevenueChart } from './RevenueChart';
import { NetProfitChart } from './NetProfitChart';


const LoadingSpinner = () => (
    <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

const StatsCard = ({ title, value, icon }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const renderStatsCard = (title, value, icon, variant, alertMessage) => (
    <Card variant={variant}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {alertMessage && (
                <div className="flex items-center mt-2 bg-red-500 text-white text-sm p-2 rounded">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {alertMessage}
                </div>
            )}
        </CardContent>
    </Card>
);

export default function OverviewPage() {
    const { user } = authStore();
    const { counts, expenseData, loading, fetchCounts, fetchTypesAndLabels, fetchRecentUsers, recentUsers, fetchDashboardSummary, dashboardSummary } = dashboardStore();

    useEffect(() => {
        fetchCounts();
        fetchDashboardSummary();
        fetchTypesAndLabels();
        if (user.role_type !== 'user') {
            fetchRecentUsers();
        }
    }, []);
    console.log(recentUsers);
    console.log(dashboardSummary);
    if (loading) return <LoadingSpinner />;

    const totalmonthlyExpenses = dashboardSummary?.monthlyExpenses?.reduce((sum, expense) => sum + Number(expense), 0) || 0;
    const totalMonthlyIncomes = dashboardSummary?.monthlyIncomes?.reduce((sum, income) => sum + Number(income), 0) || 0;

    const totalNetProfitBeforeDeductions = dashboardSummary?.netProfitBeforeDeductions?.reduce((sum, profit) => sum + Number(profit), 0) || 0;
    const totalNetProfitAfterDeductions = dashboardSummary?.netProfitAfterDeductions?.reduce((sum, profit) => sum + Number(profit), 0) || 0;

    const formattedTotalMonthlyIncomes = totalMonthlyIncomes.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const formattedTotalmonthlyExpenses = totalmonthlyExpenses.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const formattedNetProfitBeforeDeductions = totalNetProfitBeforeDeductions.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const formattedNetProfitAfterDeductions = totalNetProfitAfterDeductions.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    // Determine the current and previous month
    const currentMonth = new Date().getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    // Check for missing data
    const isExpensesMissing = dashboardSummary?.monthlyExpenses[previousMonth] === 0;
    const isIncomeMissing = dashboardSummary?.monthlyIncomes[previousMonth] === 0;
    const isMileageMissing = dashboardSummary?.monthlyVehicleUsage[previousMonth] === 0;

    return (
        <PageContainer>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Welcome back {user.first_name} {user.last_name} 👋
                    </h2>
                    <div className="flex items-center space-x-2">
                        <CalendarDateRangePicker />
                        <Button>Save</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {user.role_type === 'user' && renderStatsCard(
                                "Total Revenue",
                                formattedTotalMonthlyIncomes,
                                <Tags className="h-4 w-4 text-muted-foreground" />,
                                "success",
                                isIncomeMissing ? "You are one month behind on income data." : null
                            )}
                            {user.role_type === 'user' && renderStatsCard(
                                "Operating Expenses",
                                formattedTotalmonthlyExpenses,
                                <Tags className="h-4 w-4 text-muted-foreground" />,
                                "destructive",
                                isExpensesMissing ? "You are one month behind on expenses data." : null
                            )}
                            {user.role_type === 'user' && renderStatsCard(
                                "Net Profit Before Deductions",
                                formattedNetProfitBeforeDeductions,
                                <Tags className="h-4 w-4 text-muted-foreground" />,
                                totalNetProfitBeforeDeductions > 0 ? "success" : "destructive"
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {user.role_type === 'user' && renderStatsCard(
                                "Vehicle Deduction",
                                dashboardSummary?.vehicleDeduction.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }),
                                <Tags className="h-4 w-4 text-muted-foreground" />,
                                "warning"
                            )}
                            {user.role_type === 'user' && renderStatsCard(
                                "Home Office Deduction",
                                dashboardSummary?.homeOfficeDeduction.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }),
                                <Tags className="h-4 w-4 text-muted-foreground" />,
                                "warning"
                            )}
                            {user.role_type === 'user' && renderStatsCard(
                                "Net Profit After Deductions",
                                formattedNetProfitAfterDeductions,
                                <Tags className="h-4 w-4 text-muted-foreground" />,
                                totalNetProfitAfterDeductions > 0 ? "success" : "destructive"
                            )}
                        </div>
                    </div>
{/*                     <div className="md:col-span-3 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity Feed</CardTitle>
                            </CardHeader>
                            <CardContent>

                            </CardContent>
                        </Card>
                    </div> */}
                    <div className="md:col-span-3 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.role_type === 'user' && dashboardSummary?.monthlyIncomes ? (
                                <RevenueChart monthlyIncomes={dashboardSummary.monthlyIncomes} />
                            ) : (
                                user.role_type === 'user' && <div>No income data available</div>
                            )}
                            {user.role_type === 'user' && dashboardSummary?.netProfitBeforeDeductions && dashboardSummary?.netProfitAfterDeductions ? (
                                <NetProfitChart
                                    netProfitBeforeDeductions={dashboardSummary.netProfitBeforeDeductions}
                                    netProfitAfterDeductions={dashboardSummary.netProfitAfterDeductions}
                                />
                            ) : (
                                user.role_type === 'user' && <div>No net profit data available</div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-3 space-y-4">
                        {user.role_type !== 'user' && <RecentUsersBoard data={recentUsers} />}
                        {user.role_type === 'user' && dashboardSummary?.monthlyVehicleUsage ? (
                            <BusinessMileageChart monthlyVehicleUsage={dashboardSummary.monthlyVehicleUsage} />
                        ) : (
                            user.role_type === 'user' && <div>No vehicle usage data available</div>
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}