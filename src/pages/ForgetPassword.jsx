import ForgetPasswordForm from "@/components/auth/ForgetPasswordForm";
import React from "react";

function ForgetPassword() {
  return (
    <div className="flex w-full items-center overflow-hidden min-h-dvh h-dvh basis-full">
      <div className="flex-1 relative">
        <div className="h-full flex flex-col">
          <div className="max-w-[524px] md:px-[42px] md:py-[44px] p-7 mx-auto w-full text-2xl text-default-900 mb-3 h-full flex flex-col justify-center">
            <div className="text-center 2xl:mb-10 mb-4">
              <h4 className="font-medium">Forgot Password</h4>
              <div className="text-default-500 text-base">
                Enter your email to receive password reset instructions
              </div>
            </div>
            <ForgetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
