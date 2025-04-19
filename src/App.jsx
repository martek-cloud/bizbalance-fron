import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ForgetPassword, Dashboard, AuthUI, ProfilePage } from "./pages";
import { ThemeProvider } from "@/components/theme-provider";
import { PrivateRoute } from "@/routes/PrivateRoute";
import { PublicRoute } from "@/routes/PublicRoute";
import { AdminGuard, ComptableGuard } from "@/routes/AuthGuards";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import BusinessGuard from "@/routes/BusinessGuard"; // Import the BusinessGuard

// Pages
import Users from "./pages/UsersUI/Users";
import AddUser from "./pages/UsersUI/AddUser";
import UpdateUser from "./pages/UsersUI/UpdateUser";
import Roles from "./pages/RolesUI/Roles";
import Permissions from "./pages/RolesUI/Permissions";
import Unauthorized from "./pages/Unauthorized";
import { PermissionGuard } from "./routes/PermissionGuard";
import Expenses from "./pages/ExpensesUI/Expenses";
import TypeDetails from "./pages/ExpensesUI/TypeDetails";
import Income from "./pages/IncomeUI/Income";
import Business from "./pages/BusinessUI/Business";
import Vehicle from "./pages/VehicleUI/Vehicle";
import AddVehicle from "./pages/VehicleUI/AddVehicle";
import EditVehicle from "./pages/VehicleUI/EditVehicle";
import MainExpenses from "./pages/ExpensesUI/MainExpenses";
import VehicleUsage from "@/pages/VehicleUI/VehicleUsage";
import MultiStepForm from "./pages/ExpensesUI/ExpenseCompo/MultiStepForm";
import NoBusiness from "./pages/NoBusiness";
import ExpensesSummaryPage from "./pages/ExpensesUI/ExpensesSummaryPage";
import { ProfitLoss } from "./pages/ProfitLossUI";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<AuthUI />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
          </Route>

          {/* Protected Routes - Auth Only (No Business Check) */}
          <Route element={<PrivateRoute />}>
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/no-business" element={<NoBusiness />} />
            <Route
              path="/dashboard/profile"
              element={
                <Layout>
                  <ProfilePage />
                </Layout>
              }
            />

            {/* Routes that require both Authentication AND Business */}
            <Route element={<BusinessGuard />}>
              {/* Dashboard - requires dashboard view permission */}
              <Route
                path="/dashboard"
                element={
                  <PermissionGuard module="dashboard" action="view">
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PermissionGuard>
                }
              />

              <Route
                path="/dashboard/types&labels"
                element={
                  <PermissionGuard module="expenses" action="view">
                    <Layout>
                      <Expenses />
                    </Layout>
                  </PermissionGuard>
                }
              />
              
              <Route
                path="/dashboard/types&labels/:id"
                element={
                  <PermissionGuard module="expenses" action="view">
                    <Layout>
                      <TypeDetails />
                    </Layout>
                  </PermissionGuard>
                }
              />
              
              <Route
                path="/dashboard/income"
                element={
                  <PermissionGuard module="income" action="view">
                    <Layout>
                      <Income />
                    </Layout>
                  </PermissionGuard>
                }
              />
              
              <Route
                path="/dashboard/business"
                element={
                  <PermissionGuard module="business" action="view">
                    <Layout>
                      <Business />
                    </Layout>
                  </PermissionGuard>
                }
              />
              
              <Route
                path="/dashboard/vehicle"
                element={
                  <PermissionGuard module="vehicle" action="view">
                    <Layout>
                      <Vehicle />
                    </Layout>
                  </PermissionGuard>
                }
              />
              
              <Route
                path="/dashboard/vehicle/add"
                element={
                  <PermissionGuard module="vehicle" action="create">
                    <Layout>
                      <AddVehicle />
                    </Layout>
                  </PermissionGuard>
                }
              />
              
              <Route
                path="/dashboard/vehicle/edit/:id"
                element={
                  <PermissionGuard module="vehicle" action="edit">
                    <Layout>
                      <EditVehicle />
                    </Layout>
                  </PermissionGuard>
                }
              />

              <Route 
                path="/dashboard/vehicle/:vehicleId/usage" 
                element={
                  <PermissionGuard module="vehicle" action="edit">
                    <Layout>
                      <VehicleUsage />
                    </Layout>
                  </PermissionGuard>
                } 
              />

              <Route
                path="/dashboard/expenses"
                element={
                  <PermissionGuard module="mainExpenses" action="view">
                    <Layout>
                      <MainExpenses />
                    </Layout>
                  </PermissionGuard>
                }
              />

              <Route
                path="/dashboard/expenses/summary"
                element={
                  <PermissionGuard module="mainExpenses" action="view">
                    <Layout>
                      <ExpensesSummaryPage />
                    </Layout>
                  </PermissionGuard>
                }
              />

              <Route
                path="/dashboard/profit-loss"
                element={
                  <PermissionGuard module="profitLoss" action="view">
                    <Layout>
                      <ProfitLoss />
                    </Layout>
                  </PermissionGuard>
                }
              />

              <Route
                path="/dashboard/expenses/add"
                element={
                  <PermissionGuard module="mainExpenses" action="create">
                    <Layout>
                      <MultiStepForm />
                    </Layout>
                  </PermissionGuard>
                }
              />

              {/* Users Management with Accountant Guard - these routes require both BusinessGuard and ComptableGuard */}
              <Route element={<ComptableGuard />}>
                <Route
                  path="/dashboard/users"
                  element={
                    <PermissionGuard module="users" action="view">
                      <Users />
                    </PermissionGuard>
                  }
                />
                <Route
                  path="/dashboard/users/add"
                  element={
                    <PermissionGuard module="users" action="create">
                      <AddUser />
                    </PermissionGuard>
                  }
                />
                <Route
                  path="/dashboard/users/:id"
                  element={
                    <PermissionGuard module="users" action="edit">
                      <UpdateUser />
                    </PermissionGuard>
                  }
                />
              </Route>

              {/* Roles Management with Admin Guard - these routes require both BusinessGuard and AdminGuard */}
              <Route element={<AdminGuard />}>
                <Route
                  path="/dashboard/roles"
                  element={
                    <PermissionGuard module="roles" action="view">
                      <Roles />
                    </PermissionGuard>
                  }
                />
                <Route
                  path="/dashboard/roles/permissions/:id"
                  element={
                    <PermissionGuard module="roles" action="edit">
                      <Permissions />
                    </PermissionGuard>
                  }
                />
              </Route>
            </Route>
          </Route>

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-left" />
    </ThemeProvider>
  );
}