"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomAlertDialog } from "@/components/CustomAlertDialog";
import { API_CONFIG, apiUrl } from "../../api/api";
import axios from "axios";
import { Eye, EyeOff, MoreHorizontal } from "lucide-react";
import statesData from "@/lib/states.json";
import lgasData from "@/lib/lgas.json";

// ────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────

interface User {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  altPhone?: string;
  address?: string;
  state?: string;
  lga?: string;
  role: "USER" | "ADMIN";
  status?: "ACTIVE" | "SUSPENDED" | string;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  phone: string;
  altPhone: string;
  email: string;
  username: string;
  state: string;
  lga: string;
  address: string;
  password: string;
  role: "USER" | "ADMIN";
}

interface GetUsersResponse {
  users?: User[];
  // or the API might return array directly
}

// For better type safety on states/lgas (optional improvement)
interface StatesData {
  state: string[];
}

interface LgasData {
  [state: string]: string[];
}

// ────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
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
    role: "USER",
  });

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm?: () => void;
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
    onConfirm?: () => void,
    variant: "info" | "danger" | "warning" | "success" = "info",
  ) => {
    setAlertConfig({ isOpen: true, title, description, onConfirm, variant });
  };

  // ─── Form update helpers ────────────────────────────────────────
  const updateForm = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateForm(e.target.id as keyof UserFormData, e.target.value);
  };

  // ─── Fetch users ────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const response = await axios.get<GetUsersResponse | User[]>(
        apiUrl(API_CONFIG.ENDPOINTS.USER_ACTIONS.GET_USERS),
        { withCredentials: true },
      );

      const rawData = response.data;
      const allUsers: User[] = Array.isArray(rawData)
        ? rawData
        : (rawData.users ?? []);

      setUsers(allUsers.filter((u) => u.role === "USER"));
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ─── Add user ───────────────────────────────────────────────────
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.USER_REGISTER),
        formData,
        { withCredentials: true },
      );

      if (response.status === 200 || response.status === 201) {
        showAlert(
          "Success",
          "User registered successfully!",
          undefined,
          "success",
        );

        // Reset form
        setFormData({
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
          role: "USER",
        });
        setIsModalOpen(false);

        await fetchUsers();
      }
    } catch (error: any) {
      console.error("Error registering user:", error);
      showAlert(
        "Error",
        error.response?.data?.message || "Registration failed",
        undefined,
        "danger",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Update user ────────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);

    try {
      const userId = selectedUser._id ?? selectedUser.id;
      if (!userId) throw new Error("User ID not found");

      await axios.patch(
        apiUrl(`${API_CONFIG.ENDPOINTS.USER_ACTIONS.UPDATE_USER}${userId}`),
        formData,
        { withCredentials: true },
      );

      showAlert("Success", "User updated successfully", undefined, "success");
      setIsEditModalOpen(false);
      await fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to update user",
        undefined,
        "danger",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Suspend / Unsuspend ────────────────────────────────────────
  const handleSuspend = (userId: string) => {
    const user = users.find((u) => (u._id ?? u.id) === userId);
    if (!user) return;

    const isSuspended = user.status === "SUSPENDED";
    const action = isSuspended ? "unsuspend" : "suspend";

    showAlert(
      "Confirm Action",
      `Are you sure you want to ${action} this user?`,
      async () => {
        try {
          await axios.patch(
            apiUrl(
              `${API_CONFIG.ENDPOINTS.USER_ACTIONS.SUSPEND_USER}${userId}/suspend`,
            ),
            {},
            { withCredentials: true },
          );
          showAlert("Success", "User status updated", undefined, "success");
          await fetchUsers();
        } catch (error: any) {
          showAlert(
            "Error",
            error.response?.data?.message || "Failed to update status",
            undefined,
            "danger",
          );
        }
      },
      "warning",
    );
  };

  // ─── Delete user ────────────────────────────────────────────────
  const handleDelete = (userId: string) => {
    showAlert(
      "Confirm Delete",
      "Are you sure you want to delete this user? This cannot be undone.",
      async () => {
        try {
          await axios.delete(
            apiUrl(`${API_CONFIG.ENDPOINTS.USER_ACTIONS.DELETE_USER}${userId}`),
            { withCredentials: true },
          );
          showAlert(
            "Success",
            "User deleted successfully",
            undefined,
            "success",
          );
          setUsers((prev) => prev.filter((u) => (u._id ?? u.id) !== userId));
        } catch (error: any) {
          showAlert(
            "Error",
            error.response?.data?.message || "Failed to delete user",
            undefined,
            "danger",
          );
        }
      },
      "danger",
    );
  };

  // ─── Open edit modal ────────────────────────────────────────────
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      altPhone: user.altPhone || "",
      email: user.email || "",
      username: user.username || "",
      state: user.state || "",
      lga: user.lga || "",
      address: user.address || "",
      password: "", // never pre-fill password
      role: user.role || "USER",
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Register and manage users (filtered to USER role).
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Icon icon="solar:user-plus-linear" className="text-lg" />
              Add New User
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleAddUser}>
              <DialogHeader>
                <DialogTitle>Register New User</DialogTitle>
                <DialogDescription>
                  Create a new user with full details.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="altPhone">Alternative Phone</Label>
                  <Input
                    id="altPhone"
                    type="tel"
                    value={formData.altPhone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(val) => {
                      updateForm("state", val);
                      updateForm("lga", "");
                    }}
                  >
                    <SelectTrigger id="state">
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

                <div className="grid gap-2">
                  <Label htmlFor="lga">LGA</Label>
                  <Select
                    value={formData.lga}
                    onValueChange={(val) => updateForm("lga", val)}
                    disabled={!formData.state}
                  >
                    <SelectTrigger id="lga">
                      <SelectValue placeholder="Select LGA" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.state &&
                        (lgasData as LgasData)[formData.state]?.map((lga) => (
                          <SelectItem key={lga} value={lga}>
                            {lga}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) =>
                      updateForm("role", val as "USER" | "ADMIN")
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">USER</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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

              <div className="grid gap-2 mb-4">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <DialogFooter>
                <UtilsButtons
                  onCancel={() => setIsModalOpen(false)}
                  loading={loading}
                  submitText="Create User"
                />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ─── Edit Modal ──────────────────────────────────────────────── */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update details for {selectedUser?.firstName}{" "}
                  {selectedUser?.lastName}
                </DialogDescription>
              </DialogHeader>

              {/* Same form fields as create – just without password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {/* ... identical fields as above except password ... */}
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {/* Repeat for lastName, email, username, phone, altPhone, state, lga, role, address */}
                {/* ... omit password field in edit mode ... */}
              </div>

              <div className="grid gap-2 mb-4">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <DialogFooter>
                <UtilsButtons
                  onCancel={() => setIsEditModalOpen(false)}
                  loading={loading}
                  submitText="Update User"
                />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ─── Table ────────────────────────────────────────────────────── */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const userId = user._id ?? user.id ?? "";
              return (
                <TableRow
                  key={userId}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    @{user.username}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "ACTIVE" ? "default" : "destructive"
                      }
                    >
                      {user.status || "UNKNOWN"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(user)}>
                          <Icon
                            icon="solar:pen-linear"
                            className="mr-2 h-4 w-4"
                          />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspend(userId)}>
                          <Icon
                            icon={
                              user.status === "SUSPENDED"
                                ? "solar:play-linear"
                                : "solar:pause-linear"
                            }
                            className="mr-2 h-4 w-4"
                          />
                          {user.status === "SUSPENDED"
                            ? "Unsuspend"
                            : "Suspend"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(userId)}
                        >
                          <Icon
                            icon="solar:trash-bin-trash-linear"
                            className="mr-2 h-4 w-4"
                          />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <CustomAlertDialog
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        description={alertConfig.description}
        onConfirm={alertConfig.onConfirm}
        variant={alertConfig.variant}
        confirmText={alertConfig.onConfirm ? "Confirm" : "OK"}
      />
    </div>
  );
}

// ─── Utility Buttons ────────────────────────────────────────────────
interface UtilsButtonsProps {
  onCancel: () => void;
  loading: boolean;
  submitText: string;
}

function UtilsButtons({ onCancel, loading, submitText }: UtilsButtonsProps) {
  return (
    <>
      <Button variant="outline" type="button" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? "Processing..." : submitText}
      </Button>
    </>
  );
}
