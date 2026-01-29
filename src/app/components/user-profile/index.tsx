"use client";
import Image from "next/image";
import CardBox from "../shared/CardBox";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/app/context/Appcontext";
import axios from "axios";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import { CustomAlertDialog } from "@/components/CustomAlertDialog";
import statesData from "@/lib/states.json";
import lgasData from "@/lib/lgas.json";

interface StatesData {
  state: string[];
}

interface LgasData {
  [state: string]: string[];
}

interface ProfileData {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  altPhone?: string;
  address?: string;
  state?: string;
  lga?: string;
  role: string;
  status?: string;
  createdAt?: string;
}

const UserProfile = () => {
  const { userData } = useAppContext();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<ProfileData | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "info" | "danger" | "warning" | "success";
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "info",
  });

  const showAlert = (
    title: string,
    description: string,
    variant: "info" | "danger" | "warning" | "success" = "info",
  ) => {
    setAlertConfig({
      isOpen: true,
      title,
      description,
      variant,
    });
  };

  const BCrumb = [
    {
      to: "/",
      title: "Home",
    },
    {
      title: "User Profile",
    },
  ];

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.PROFILE.GET),
        {
          withCredentials: true,
        },
      );
      console.log(response.data);
      if (response.data) {
        const data = response.data.user || response.data;
        setProfile(data);
        setFormData(data);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      showAlert("Error", "Failed to fetch profile details", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !profile) return;

    setSaving(true);
    try {
      const userId = profile._id || profile.id;
      const response = await axios.patch(
        apiUrl(`${API_CONFIG.ENDPOINTS.PROFILE.UPDATE}${userId}`),
        formData,
        { withCredentials: true },
      );

      if (response.status === 200) {
        showAlert("Success", "Profile updated successfully!", "success");
        setProfile(response.data.user || response.data);
        setOpenModal(false);
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to update profile",
        "danger",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icon
          icon="line-md:loading-twotone-loop"
          className="text-4xl text-primary"
        />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      <BreadcrumbComp title="User Profile" items={BCrumb} />
      <div className="flex flex-col gap-6">
        <CardBox className="p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 rounded-xl relative w-full break-words">
            <div className="bg-primary/10 p-4 rounded-full">
              <Icon
                icon="solar:user-bold-duotone"
                className="text-5xl text-primary"
              />
            </div>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-between items-center w-full">
              <div className="flex flex-col sm:text-left text-center gap-1.5">
                <h5 className="card-title text-xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h5>
                <div className="flex flex-wrap items-center gap-1 md:gap-3">
                  <p className="text-sm text-gray-500 font-medium bg-muted px-3 py-1 rounded-full">
                    {profile.role}
                  </p>
                  <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Icon icon="solar:map-point-linear" />
                    {profile.state || "N/A"}, {profile.lga || "N/A"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setFormData(profile);
                  setOpenModal(true);
                }}
                className="flex items-center gap-1.5 rounded-md"
              >
                <Icon
                  icon="solar:pen-new-square-linear"
                  width="18"
                  height="18"
                />{" "}
                Edit Profile
              </Button>
            </div>
          </div>
        </CardBox>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 ">
          <div className="space-y-6 rounded-xl border border-border bg-card md:p-6 p-4 relative w-full break-words">
            <h5 className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="solar:user-id-linear" className="text-primary" />
              Personal Information
            </h5>
            <div className="grid grid-cols-2 gap-4 lg:gap-7 2xl:gap-8">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  First Name
                </p>
                <p className="font-medium">{profile.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Last Name
                </p>
                <p className="font-medium">{profile.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Username
                </p>
                <p className="font-medium text-primary">@{profile.username}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Email Address
                </p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Phone Number
                </p>
                <p className="font-medium">{profile.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Alt Phone
                </p>
                <p className="font-medium">{profile.altPhone || "None"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Status
                </p>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-2 w-2 rounded-full ${profile.status === "ACTIVE" ? "bg-success" : "bg-destructive"}`}
                  ></div>
                  <p className="font-medium">{profile.status}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Joined
                </p>
                <p className="font-medium text-muted-foreground">
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-xl border border-border bg-card md:p-6 p-4 relative w-full break-words">
            <h5 className="text-lg font-semibold flex items-center gap-2">
              <Icon
                icon="solar:map-point-wave-linear"
                className="text-primary"
              />
              Address Details
            </h5>
            <div className="grid grid-cols-2 gap-4 lg:gap-7 2xl:gap-8">
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Full Address
                </p>
                <p className="font-medium">
                  {profile.address || "Address not set"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  State
                </p>
                <p className="font-medium">{profile.state || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                  LGA
                </p>
                <p className="font-medium">{profile.lga || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-[500px] md:max-w-2xl  m-auto">
          <form onSubmit={handleUpdateProfile}>
            <DialogHeader>
              <DialogTitle className="mb-4">
                Edit Profile Information
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData?.firstName || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData?.lastName || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData?.email || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData?.phone || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="altPhone">Alt Phone</Label>
                <Input
                  id="altPhone"
                  value={formData?.altPhone || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData?.username || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData?.state || ""}
                  onValueChange={(val) => {
                    if (formData) {
                      setFormData({ ...formData, state: val, lga: "" });
                    }
                  }}
                >
                  <SelectTrigger id="state" className="w-full">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {(statesData as StatesData).state.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lga">LGA</Label>
                <Select
                  value={formData?.lga || ""}
                  onValueChange={(val) => {
                    if (formData) {
                      setFormData({ ...formData, lga: val });
                    }
                  }}
                  disabled={!formData?.state}
                >
                  <SelectTrigger id="lga" className="w-full">
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData?.state &&
                      (lgasData as LgasData)[formData.state]?.map((lga) => (
                        <SelectItem key={lga} value={lga}>
                          {lga}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData?.address || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-md"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-md" disabled={saving}>
                {saving ? "Updating..." : "Update Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CustomAlertDialog
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        description={alertConfig.description}
        variant={alertConfig.variant}
      />
    </>
  );
};

export default UserProfile;
