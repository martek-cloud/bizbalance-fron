// src/pages/Unauthorized.jsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export default function Unauthorized() {

  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    logout();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Please Contact the Admin</h1>
        <p className="mt-4">
          You don't have permission to access this resource.
        </p>
        <p>Contact the admin to get your permissions</p>
        <div className="flex justify-center items-center gap-2 mt-6">
          <div>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
          <div>Or</div>
          <div>
            <Dialog>
              <DialogTrigger>
                <Button variant="destructive">Log out</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to log out? You'll need to log in
                    again to access your account.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    Log out
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
