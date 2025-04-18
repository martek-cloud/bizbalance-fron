// Permissions.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import roleStore from "@/store/roleStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function Permissions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchRoleById, updateRolePermissions, loading: savingLoading } = roleStore();

  const [currentRole, setCurrentRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    dashboard: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
    users: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
    roles: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
    expenses: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
    business: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
    income: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
    vehicle: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
    mainExpenses: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
  });

  const modules = [
    { name: "Dashboard", key: "dashboard" },
    { name: "Users", key: "users" },
    { name: "Roles", key: "roles" },
    { name: "Expenses", key: "expenses" },
    { name: "Business", key: "business" },
    { name: "Income", key: "income" },
    { name: "Vehicle", key: "vehicle" },
    { name: "Main Expenses", key: "mainExpenses" },
  ];

  const actions = [
    { name: "View", key: "view" },
    { name: "Create", key: "create" },
    { name: "Edit", key: "edit" },
    { name: "Delete", key: "delete" },
  ];

  useEffect(() => {
    const loadRole = async () => {
      try {
        setIsLoading(true);
        const roleData = await fetchRoleById(id);
        if (roleData) {
          setCurrentRole(roleData);
          if (roleData.permissions) {
            try {
              const parsedPermissions = JSON.parse(roleData.permissions);
              setPermissions(prev => ({
                ...prev,
                ...parsedPermissions,
                mainExpenses: parsedPermissions.mainExpenses || {
                  view: false,
                  create: false,
                  edit: false,
                  delete: false,
                },
                business: parsedPermissions.business || {
                  view: false,
                  create: false,
                  edit: false,
                  delete: false,
                },
                income: parsedPermissions.income || {
                  view: false,
                  create: false,
                  edit: false,
                  delete: false,
                },
                vehicle: parsedPermissions.vehicle || {
                  view: false,
                  create: false,
                  edit: false,
                  delete: false,
                }
              }));
            } catch (e) {
              console.error("Error parsing permissions:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error loading role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, [id, fetchRoleById]);

  const handlePermissionChange = (moduleKey, action) => {
    setPermissions(prev => {
      if (action !== 'view') {
        if (!prev[moduleKey][action]) {
          return {
            ...prev,
            [moduleKey]: {
              ...prev[moduleKey],
              view: true,
              [action]: true
            }
          };
        }
      } else if (action === 'view' && prev[moduleKey][action]) {
        return {
          ...prev,
          [moduleKey]: {
            ...prev[moduleKey],
            view: false,
            create: false,
            edit: false,
            delete: false
          }
        };
      }

      return {
        ...prev,
        [moduleKey]: {
          ...prev[moduleKey],
          [action]: !prev[moduleKey][action]
        }
      };
    });
  };

  const handleSave = async () => {
    const success = await updateRolePermissions(id, permissions);
    if (success) {
      navigate("/dashboard/roles");
    }
  };

  const LoadingSkeleton = () => (
    <Card className="m-4 p-4">
      <CardHeader className="px-0">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-[250px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                {actions.map((_, index) => (
                  <TableHead key={index} className="text-center">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  {actions.map((_, actionIndex) => (
                    <TableCell key={actionIndex} className="text-center">
                      <Skeleton className="h-4 w-4 mx-auto rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card className="m-4 p-4">
      <CardHeader className="px-0">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/roles")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>
              Module Permissions{" "}
              {currentRole ? `for ${currentRole.role_name}` : ""}
            </CardTitle>
            <CardDescription>
              Configure permissions for each module
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Module Name</TableHead>
                {actions.map((action) => (
                  <TableHead key={action.key} className="text-center">
                    {action.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.key}>
                  <TableCell className="font-medium">{module.name}</TableCell>
                  {actions.map((action) => (
                    <TableCell key={action.key} className="text-center">
                      <Checkbox
                        checked={permissions[module.key][action.key]}
                        onCheckedChange={() =>
                          handlePermissionChange(module.key, action.key)
                        }
                        className="mx-auto"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave} disabled={savingLoading} className="relative">
            {savingLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                <span>Saving...</span>
              </div>
            ) : (
              "Save Permissions"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default Permissions;