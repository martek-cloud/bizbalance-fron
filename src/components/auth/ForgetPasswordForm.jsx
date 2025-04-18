// forgot-pass.jsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ForgetPasswordForm = () => {
  const handleSubmit = () => {
    pass;
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="name@example.com"
          className="h-[48px] text-sm text-default-900"
        />
       
      </div>

      <Button type="submit" className="w-full">
        Send recovery email
      </Button>

      <div className="text-center mt-6">
        <a href="/login" className="text-default-800 hover:underline text-sm">
          Back to Login
        </a>
      </div>
    </form>
  );
};

export default ForgetPasswordForm;
