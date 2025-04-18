import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import Copyright from "@/components/Copyright";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LockKeyhole, UserCircle2 } from "lucide-react";
import computabilityImg from "@/assets/computability.jpg";

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="flex w-full min-h-dvh bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left side - Hero Image */}
      {/* <div className="hidden lg:flex lg:w-1/2 bg-default-50 relative">
        <div className="absolute inset-0 bg-black/20" />{" "} */}
      {/* Overlay for better text contrast */}
      {/* <img
          src={computabilityImg}
          alt="Project visualization"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-lg opacity-90">
            Access your dashboard and manage your projects efficiently.
          </p>
        </div>
      </div> */}

      <div className="hidden lg:flex lg:w-1/2 bg-default-50 relative overflow-hidden p-8">
        {/* Gradient background frame */}
        <div className="absolute inset-4 rounded-xl blur-sm transform -rotate-1" />

        {/* Dark overlay for text contrast */}
        

        {/* Image container */}
        <div className="relative w-full h-full">
          <img
            src={computabilityImg}
            alt="Project visualization"
            className="w-full h-full object-cover rounded-xl  shadow-lg transition-transform duration-700 hover:scale-105 filter brightness-95 hover:brightness-100"
          />
          <div className="absolute inset-0  rounded-xl pointer-events-none" />
        </div>

        {/* Text content */}
        <div className="absolute bottom-12 left-12 right-12 p-8 text-white z-20">
          <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-lg opacity-90">
            Access your dashboard and manage your projects efficiently.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2 dark:text-white">
                {activeTab === "signin" ? "Sign In" : "Create Account"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === "signin"
                  ? "Welcome back! Please enter your details"
                  : "Get started with your free account"}
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <UserCircle2 className="w-4 h-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="flex items-center gap-2"
                >
                  <LockKeyhole className="w-4 h-4" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Copyright />
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
