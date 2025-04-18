import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Calendar, ImageIcon, X, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "react-hot-toast";
import usersStore from "@/store/usersStore";
import authStore from "@/store/authStore";

export default function UpdateUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateUser, loading, users, fetchUsers, fetchComptableUsers } =
    usersStore();
  const { user } = authStore();
  const currentUser = user;
  console.log(currentUser);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);
  const [comptables, setComptables] = useState([]);
  const [selectedComptable, setSelectedComptable] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    date_of_birth: "",
    phone_number: "",
    address: "",
    city: "",
    postal_code: "",
    bio: "",
    status: "Active",
    role_type: "",
    comptable_id: "",
  });

  useEffect(() => {
    const loadUsers = async () => {
      if (users.length === 0) {
        await fetchUsers();
      }
    };
    loadUsers();
  }, []);
  useEffect(() => {
    const loadComptables = async () => {
      if (currentUser?.role_type === "admin") {
        const data = await fetchComptableUsers();
        setComptables(data);
      }
    };
    loadComptables();
  }, [currentUser]);
  // Modify the second useEffect to handle the loading state
  useEffect(() => {
    const findUser = async () => {
      if (users.length > 0) {
        const user = users.find((user) => user.id === parseInt(id));
        if (!user) {
          toast.error("User not found");
          navigate("/dashboard/users");
          return;
        }

        setFormData({
          ...formData,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          gender: user.gender || "",
          date_of_birth: user.date_of_birth || "",
          phone_number: user.phone_number || "",
          address: user.address || "",
          city: user.city || "",
          postal_code: user.postal_code || "",
          bio: user.bio || "",
          status: user.status || "Active",
          role_type: user.role_type || "",
          comptable_key: user.comptable_key || "",
          comptable_id: user.comptable_id || "",
        });

        // Set comptable if exists
        if (user.comptable_id && comptables.length > 0) {
          const comptable = comptables.find((c) => c.id === user.comptable_id);
          setSelectedComptable(comptable);
        }

        if (user.profile_picture) {
          setPhotoPreview(
            `${import.meta.env.VITE_API_URL}/storage/${user.profile_picture}`
          );
        }
      }
    };

    findUser();
  }, [id, users, comptables]);

  const getAllowedRoles = () => {
    if (currentUser.role_type === "admin") {
      return [
        { value: "admin", label: "Admin" },
        { value: "comptable", label: "Accountant" },
        { value: "user", label: "User" },
      ];
    } else if (currentUser.role_type === "comptable") {
      return [
        { value: "comptable", label: "Accountant" },
        { value: "user", label: "User" },
      ];
    }
    return [];
  };

  const validateField = (name, value) => {
    switch (name) {
      case "first_name":
      case "last_name":
        return value.trim() === "" ? "This field is required" : "";
      case "email":
        return !value
          ? "Email is required"
          : !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ? "Invalid email format"
          : "";
      case "gender":
        return !value ? "Gender is required" : "";
      case "date_of_birth":
        return !value ? "Date of birth is required" : "";
      case "role_type":
        return !value ? "Role type is required" : "";
      case "comptable_id":
        return formData.role_type === "user" && !value
          ? "Please select a comptable"
          : "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name]),
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must not exceed 5MB", {
          position: "top-center",
        });
        return;
      }
      setPhotoFile(file);
      setRemoveExistingPhoto(false); // Reset remove flag when new photo is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemoveExistingPhoto(true); // Add this line
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields", {
        position: "top-center",
      });
      const allTouched = {};
      Object.keys(formData).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    try {
      // Create FormData object to handle file upload
      const formDataToSubmit = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        formDataToSubmit.append(key, formData[key]);
      });

      // Handle photo cases
      if (photoFile) {
        formDataToSubmit.append("photo", photoFile);
      }

      if (removeExistingPhoto) {
        formDataToSubmit.append("remove_photo", "true");
      }

      // Add _method field for PUT request simulation
      formDataToSubmit.append("_method", "PUT");
      const success = await updateUser(id, formDataToSubmit);

      if (success) {
        toast.success("User updated successfully!", {
          position: "top-center",
          duration: 3000,
        });
        navigate("/dashboard/users");
      }
    } catch (error) {
      toast.error(error.message || "Error updating user", {
        position: "top-center",
      });
    }
  };
  return (
    <div className="space-y-6 m-4">
      <Toaster />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard/users")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Update User</h1>
          </div>
          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update User"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Personal Information Card */}
          <Card className="bg-gray-50 dark:bg-stone-900">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update the user's basic personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="Enter first name"
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.first_name ? "border-red-500" : ""}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-500">{errors.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="Enter last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.last_name ? "border-red-500" : ""}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-500">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    name="gender"
                    className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
                      errors.gender ? "border-red-500" : ""
                    }`}
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.gender && (
                    <p className="text-sm text-red-500">{errors.gender}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <div className="relative">
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Select date"
                      className={`[&::-webkit-calendar-picker-indicator]:opacity-0 appearance-none ${
                        errors.date_of_birth ? "border-red-500" : ""
                      }`}
                      onClick={(e) => {
                        e.currentTarget.showPicker();
                      }}
                    />
                    {errors.date_of_birth && (
                      <p className="text-sm text-red-500">
                        {errors.date_of_birth}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="bg-gray-50 dark:bg-stone-900">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Update the user's contact details and address information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  placeholder="Enter phone number"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter street address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    placeholder="Enter postal code"
                    value={formData.postal_code}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Enter brief bio"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Role Information Card */}
          <Card className="bg-gray-50 dark:bg-stone-900">
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
              <CardDescription>
                Update the user's role and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role_type">Role Type *</Label>
                  <Select
                    value={formData.role_type}
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        role_type: value,
                        comptable_id: value === "user" ? prev.comptable_id : "",
                      }));
                    }}
                  >
                    <SelectTrigger
                      className={errors.role_type ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select role type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllowedRoles().map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role_type && (
                    <p className="text-sm text-red-500">{errors.role_type}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {formData.role_type === "user" && (
                <div className="space-y-2">
                  <Label htmlFor="comptable_id">Assign to Accountant *</Label>
                  <Select
                    value={formData.comptable_id}
                    onValueChange={(value) => {
                      const comptable = comptables.find(
                        (c) => c.id.toString() === value
                      );
                      setSelectedComptable(comptable);
                      setFormData((prev) => ({
                        ...prev,
                        comptable_id: value,
                      }));
                    }}
                  >
                    <SelectTrigger
                      className={errors.comptable_id ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a comptable" />
                    </SelectTrigger>
                    <SelectContent>
                      {comptables
                        // Only show comptables that aren't the user being updated
                        .filter((comptable) => {
                          const currentEditingUser = users.find(
                            (user) => user.id === parseInt(id)
                          );
                          return !(
                            currentEditingUser.role_type === "comptable" &&
                            currentEditingUser.comptable_key ===
                              comptable.comptable_key
                          );
                        })
                        .map((comptable) => (
                          <SelectItem
                            key={comptable.id}
                            value={comptable.id.toString()}
                          >
                            ({comptable.comptable_key}) {comptable.displayName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.comptable_id && (
                    <p className="text-sm text-red-500">
                      {errors.comptable_id}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Photo Card */}
          <Card className="bg-gray-50 dark:bg-stone-900 h-full">
            <CardHeader className="pb-4">
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>
                Upload a profile photo for the user (Max size: 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4 h-[calc(100%-5rem)]">
              <div
                className="border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer flex-grow min-h-[300px]"
                onClick={() => document.getElementById("photo").click()}
              >
                <div className="flex items-center justify-center h-full p-6">
                  <div className="flex flex-col items-center justify-center gap-4 w-full">
                    {!photoPreview ? (
                      <>
                        <div className="p-4 rounded-full bg-muted">
                          <Plus className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-muted-foreground font-medium">
                            {removeExistingPhoto
                              ? "Photo removed - click to select new photo"
                              : "Drag and drop or click to select a file"}
                          </p>
                          <p className="text-sm text-muted-foreground/70">
                            Maximum file size: 5MB
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                        <div className="relative w-40 h-40">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg border shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              setPhotoPreview(null);
                            }}
                          />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-muted-foreground font-medium">
                            {photoFile ? "New photo selected" : "Current photo"}
                          </p>
                          <p className="text-sm text-muted-foreground/70">
                            {photoFile?.name || "Profile photo"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {photoPreview && (
                <div className="border rounded-lg bg-background p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-md bg-primary/10">
                        <ImageIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {photoFile?.name || "Profile photo"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(photoFile?.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
