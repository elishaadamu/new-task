"use client";

import { useState } from "react";
import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";
import CardBox from "../shared/CardBox";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { API_CONFIG, apiUrl } from "../../api/api";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import statesData from "@/lib/states.json";
import lgasData from "@/lib/lgas.json";

export const Register = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    altPhone: "",
    email: "",
    username: "",
    state: "",
    lga: "",
    address: "",
    password: "",
    role: "ADMIN",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.ADMIN_REGISTER),
        formData,
        { withCredentials: true },
      );

      console.log(response.data);
      if (response.status === 200 || response.status === 201) {
        // Handle success - maybe redirect to login
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex justify-center items-center bg-lightprimary p-4">
        <div className="w-full max-w-4xl">
          <CardBox>
            <div className="flex justify-center mb-4">
              <FullLogo />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Register as an Admin
            </p>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <Label htmlFor="firstName" className="font-medium mb-2 block">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="lastName" className="font-medium mb-2 block">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="font-medium mb-2 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="font-medium mb-2 block">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Alt Phone */}
                <div>
                  <Label htmlFor="altPhone" className="font-medium mb-2 block">
                    Alt Phone
                  </Label>
                  <Input
                    id="altPhone"
                    type="tel"
                    placeholder="Enter alternative phone"
                    value={formData.altPhone}
                    onChange={handleChange}
                  />
                </div>

                {/* Username */}
                <div>
                  <Label htmlFor="username" className="font-medium mb-2 block">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* State */}
                <div>
                  <Label htmlFor="state" className="font-medium mb-2 block">
                    State
                  </Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) =>
                      setFormData({ ...formData, state: value, lga: "" })
                    }
                  >
                    <SelectTrigger
                      id="state"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesData.state.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* LGA */}
                <div>
                  <Label htmlFor="lga" className="font-medium mb-2 block">
                    LGA
                  </Label>
                  <Select
                    value={formData.lga}
                    onValueChange={(value) =>
                      setFormData({ ...formData, lga: value })
                    }
                    disabled={!formData.state}
                  >
                    <SelectTrigger
                      id="lga"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <SelectValue placeholder="Select LGA" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.state &&
                        (lgasData as any)[formData.state]?.map(
                          (lga: string) => (
                            <SelectItem key={lga} value={lga}>
                              {lga}
                            </SelectItem>
                          ),
                        )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role */}
                <div>
                  <Label htmlFor="role" className="font-medium mb-2 block">
                    Role
                  </Label>
                  <Input
                    id="role"
                    type="text"
                    placeholder="Enter role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="font-medium mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Address - Full Width */}
              <div className="mt-4">
                <Label htmlFor="address" className="font-medium mb-2 block">
                  Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button className="w-full mt-6" type="submit" disabled={loading}>
                {loading ? "Registering..." : "Sign Up"}
              </Button>
            </form>

            <div className="flex items center gap-2 justify-center mt-6 flex-wrap">
              <p className="text-base font-medium text-muted-foreground">
                Already have an account?
              </p>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-primary hover:text-primaryemphasis"
              >
                Sign In
              </Link>
            </div>
          </CardBox>
        </div>
      </div>
    </>
  );
};
