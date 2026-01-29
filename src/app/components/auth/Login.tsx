"use client";

import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";
import CardBox from "../shared/CardBox";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_CONFIG, apiUrl } from "../../api/api";
import { useAppContext } from "@/app/context/Appcontext";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export const Login = () => {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setEncryptedUserData } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!shouldSubmit) return;

    const loginUser = async () => {
      setLoading(true);
      setError("");

      const payload = {
        identifier: credential,
        password: password,
      };
      console.log(payload);

      try {
        const response = await axios.post(
          apiUrl(API_CONFIG.ENDPOINTS.AUTH.ADMIN_LOGIN),
          payload,
          {
            withCredentials: true,
          },
        );
        console.log(response.data);
        // Encrypt and store the response data in context
        setEncryptedUserData(response.data.user);
        router.push("/");
      } catch (err: any) {
        const errorMessage = err.response?.data?.message;
        setError(errorMessage);
      } finally {
        setLoading(false);
        setShouldSubmit(false);
      }
    };

    loginUser();
  }, [shouldSubmit, credential, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShouldSubmit(true);
  };

  return (
    <>
      <div className="h-screen w-full flex justify-center items-center bg-lightprimary">
        <div className="md:min-w-[450px] min-w-[400px]">
          <CardBox>
            <div className="flex justify-center mb-4">
              <FullLogo />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-2">
              Login as an Admin
            </p>
            <form onSubmit={handleSubmit}>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="username1" className="font-medium">
                    Username / Email / Phone
                  </Label>
                </div>
                <Input
                  id="username1"
                  type="text"
                  placeholder="Enter your username, email or phone"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                />
              </div>
              <div className="mt-2">
                <div className="mb-2 block">
                  <Label htmlFor="password1" className="font-medium">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password1"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              {error && (
                <div className="mt-2 text-sm text-red-500">{error}</div>
              )}
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? "Logging in..." : "Sign In"}
              </Button>
            </form>
          </CardBox>
        </div>
      </div>
    </>
  );
};
