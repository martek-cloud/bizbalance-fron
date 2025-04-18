import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import useAuthStore from "@/store/authStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function RegisterForm() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleType: "",
    referenceKey: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return password.length >= 8 && specialCharRegex.test(password);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (isFormSubmitted) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
        submit: "",
      }));
    }
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      roleType: value,
      // Reset reference key if switching from user to comptable
      referenceKey: value !== "user" ? "" : prev.referenceKey,
    }));

    if (isFormSubmitted) {
      setErrors((prev) => ({
        ...prev,
        roleType: "",
        referenceKey: "",
        submit: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 6) {
      newErrors.firstName = "First name must be at least 6 characters";
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 6) {
      newErrors.lastName = "Last name must be at least 6 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters and contain a special character";
    }

    if (!formData.roleType) {
      newErrors.roleType = "Role type is required";
    }

    // if (formData.roleType === "user" && !formData.referenceKey) {
    //   newErrors.referenceKey = "Reference key is required for users";
    // }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFormSubmitted(true);

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Prepare registration data
        const registrationData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          role_type: formData.roleType,
          reference_key:
            formData.roleType === "user" ? formData.referenceKey : undefined,
        };

        await register(registrationData);
        navigate("/dashboard");
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          submit: error.message,
        }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.firstName ? "border-red-500" : ""}
        />
        {errors.firstName && (
          <p className="text-sm text-red-500">{errors.firstName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.lastName ? "border-red-500" : ""}
        />
        {errors.lastName && (
          <p className="text-sm text-red-500">{errors.lastName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="roleType">Role Type</Label>
        <Select
          value={formData.roleType}
          onValueChange={handleRoleChange}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.roleType ? "border-red-500" : ""}>
            <SelectValue placeholder="Role Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comptable">Accountant</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        {errors.roleType && (
          <p className="text-sm text-red-500">{errors.roleType}</p>
        )}
      </div>

      {formData.roleType === "user" && (
        <div className="space-y-2">
          <Label htmlFor="referenceKey">Reference Key</Label>
          <div className="relative">
            <Input
              id="referenceKey"
              name="referenceKey"
              placeholder="Enter reference key"
              value={formData.referenceKey}
              onChange={handleChange}
              disabled={isLoading}
              className={`${errors.referenceKey ? "border-red-500" : ""} pr-10`}
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  handleChange({
                    target: {
                      name: "referenceKey",
                      value: text,
                    },
                  });
                } catch (err) {
                  console.error("Failed to read clipboard:", err);
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M12 11v6" />
                <path d="M9 14h6" />
              </svg>
            </button>
          </div>
          {errors.referenceKey && (
            <p className="text-sm text-red-500">{errors.referenceKey}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="text"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className={errors.password ? "border-red-500 pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="acceptTerms"
          name="acceptTerms"
          checked={formData.acceptTerms}
          onCheckedChange={(checked) => {
            handleChange({
              target: { name: "acceptTerms", type: "checkbox", checked },
            });
          }}
          disabled={isLoading}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="acceptTerms"
            className={errors.acceptTerms ? "text-red-500" : ""}
          >
            Accept terms and conditions
          </Label>
          {errors.acceptTerms && (
            <p className="text-sm text-red-500">{errors.acceptTerms}</p>
          )}
        </div>
      </div>

      {errors.submit && (
        <div className="text-red-500 text-sm">{errors.submit}</div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}

export default RegisterForm;
