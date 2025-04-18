"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: true
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (isFormSubmitted) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 2xl:mt-7 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-medium text-default-600">
          Email
        </Label>
        <Input
          size="lg"
          disabled={isLoading}
          type="text"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={errors.email ? "border-destructive" : ""}
          autoComplete="email"
          placeholder="name@example.com"
        />
        {errors.email && (
          <div className="text-destructive mt-2 text-sm">
            {errors.email}
          </div>
        )}
      </div>

      <div className="mt-3.5 space-y-2">
        <Label htmlFor="password" className="mb-2 font-medium text-default-600">
          Password
        </Label>
        <div className="relative">
          <Input
            size="lg"
            disabled={isLoading}
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={errors.password ? "border-destructive" : ""}
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <div className="text-destructive mt-2 text-sm">
            {errors.password}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Checkbox
            id="remember"
            checked={formData.remember}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, remember: checked }))
            }
          />
          <Label htmlFor="remember">Keep Me Signed In</Label>
        </div>
        <Link
          to="/forgot-password"
          className="text-sm text-default-800 dark:text-default-400 leading-6 font-medium"
        >
          Forgot Password?
        </Link>
      </div>

      {errors.submit && (
        <div className="text-destructive text-sm">
          {errors.submit}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;