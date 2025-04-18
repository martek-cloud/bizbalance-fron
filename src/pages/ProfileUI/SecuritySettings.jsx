// src/pages/ProfileUI/SecuritySettings.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Shield, Key, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import authStore from "@/store/authStore";

export const SecuritySettings = () => {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const updatePassword = authStore((state) => state.updatePassword);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues
  } = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updatePassword(data);
      toast.success("Password updated successfully!");
      reset();
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="space-y-6">
      <Alert variant="info" className="bg-primary/10 border-primary/20">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          Keep your account secure by using a strong password and regularly
          updating it.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showPassword.current ? "text" : "password"}
                  {...register("current_password", {
                    required: "Current password is required",
                  })}
                  className={
                    errors.current_password ? "border-destructive" : ""
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPassword.current ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-sm text-destructive">
                  {errors.current_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPassword.new ? "text" : "password"}
                  {...register("new_password", {
                    required: "New password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
                    },
                  })}
                  className={errors.new_password ? "border-destructive" : ""}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.new_password && (
                <p className="text-sm text-destructive">
                  {errors.new_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="new_password_confirmation" // Changed from confirm_password
                  type={showPassword.confirm ? "text" : "password"}
                  {...register("new_password_confirmation", {
                    // Changed from confirm_password
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === getValues("new_password") ||
                      "Passwords do not match",
                  })}
                  className={
                    errors.new_password_confirmation ? "border-destructive" : ""
                  } // Updated error reference
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPassword.confirm ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-destructive">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
          </div>

          {errors.root && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Updating Password...
                </div>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Security Recommendations</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 text-primary" />
            Use a unique password that you don't use for other accounts
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 text-primary" />
            Include a mix of letters, numbers, and symbols
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 text-primary" />
            Avoid using personal information in your password
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 text-primary" />
            Change your password regularly for enhanced security
          </li>
        </ul>
      </Card>
    </div>
  );
};
