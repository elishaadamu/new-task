"use client";

import React, { useState, useEffect } from "react";
import CardBox from "../shared/CardBox";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
import { CustomAlertDialog } from "@/components/CustomAlertDialog";
import { API_CONFIG, apiUrl } from "../../api/api";
import axios from "axios";
import BreadcrumbComp from "../../(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import WalletTable from "./wallet-table";

const ManageWallet = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedUserBalance, setSelectedUserBalance] = useState<number | null>(
    null,
  );
  const [selectedUserHistory, setSelectedUserHistory] = useState<any[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [type, setType] = useState("credit");

  const [formData, setFormData] = useState({
    userId: "",
    amount: "",
    description: "",
    taskId: "",
    week: "",
  });

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "info" | "success" | "danger" | "warning";
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "info",
  });

  const showAlert = (
    title: string,
    description: string,
    variant: "info" | "success" | "danger" | "warning" = "info",
  ) => {
    setAlertConfig({
      isOpen: true,
      title,
      description,
      variant,
    });
  };

  const fetchAllWallets = async () => {
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.WALLET.GET_ALL_WALLETS),
        {
          withCredentials: true,
        },
      );
      setWallets(response.data.wallets || response.data || []);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, tasksRes] = await Promise.all([
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.USER_ACTIONS.GET_USERS), {
            withCredentials: true,
          }),
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.TASK.GET), {
            withCredentials: true,
          }),
        ]);

        const rawUsers = usersRes.data.users || usersRes.data || [];
        setUsers(rawUsers.filter((u: any) => u.role === "USER"));

        const rawTasks = tasksRes.data.tasks || tasksRes.data || [];
        let flattenedTasks: any[] = [];
        if (tasksRes.data.thisWeek)
          flattenedTasks = [...tasksRes.data.thisWeek];
        if (tasksRes.data.previousWeeks)
          flattenedTasks = [...flattenedTasks, ...tasksRes.data.previousWeeks];

        if (flattenedTasks.length === 0 && Array.isArray(rawTasks)) {
          flattenedTasks = rawTasks;
        }

        setTasks(flattenedTasks);
        await fetchAllWallets();
      } catch (error) {
        console.error("Error fetching data:", error);
        showAlert("Error", "Failed to load users or tasks", "danger");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (formData.userId) {
      const fetchUserDetails = async () => {
        try {
          const [balanceRes, historyRes] = await Promise.all([
            axios.get(
              apiUrl(
                `${API_CONFIG.ENDPOINTS.WALLET.GET_BALANCE}${formData.userId}/balance`,
              ),
              {
                withCredentials: true,
              },
            ),
            axios.get(
              apiUrl(
                `${API_CONFIG.ENDPOINTS.WALLET.GET_TRANSACTIONS}${formData.userId}/transactions`,
              ),
              {
                withCredentials: true,
              },
            ),
          ]);

          setSelectedUserBalance(balanceRes.data.wallet.balance ?? 0);
          setSelectedUserHistory(
            historyRes.data.transactions || historyRes.data || [],
          );
        } catch (error) {
          console.error("Error fetching user wallet details:", error);
          setSelectedUserBalance(0);
          setSelectedUserHistory([]);
        }
      };
      fetchUserDetails();
    } else {
      setSelectedUserBalance(null);
      setSelectedUserHistory([]);
    }
  }, [formData.userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint =
        type === "credit"
          ? API_CONFIG.ENDPOINTS.WALLET.CREDIT
          : API_CONFIG.ENDPOINTS.WALLET.DEBIT;

      const payload: any = {
        userId: formData.userId,
        amount: Number(formData.amount),
        description: formData.description,
        week: formData.week,
      };

      if (type === "credit") {
        payload.taskId = formData.taskId;
      }

      const response = await axios.post(apiUrl(endpoint), payload, {
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
        showAlert("Success", `Wallet successfully ${type}ed!`, "success");
        setFormData({
          userId: "",
          amount: "",
          description: "",
          taskId: "",
          week: "",
        });
        await fetchAllWallets();
      }
    } catch (error: any) {
      console.error("Error updating wallet:", error);
      showAlert(
        "Error",
        error.response?.data?.message || `Failed to ${type} wallet`,
        "danger",
      );
    } finally {
      setLoading(false);
    }
  };

  const BCrumb = [{ to: "/", title: "Home" }, { title: "Manage Bonus/Wallet" }];

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icon
          icon="line-md:loading-twotone-loop"
          className="text-4xl text-primary"
        />
      </div>
    );
  }

  return (
    <>
      <BreadcrumbComp title="Bonus & Wallet Management" items={BCrumb} />
      <div className="mb-8">
        <WalletTable wallets={wallets} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardBox className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h5 className="text-xl font-bold flex items-center gap-2">
              <Icon
                icon="solar:wallet-money-bold-duotone"
                className="text-primary text-2xl"
              />
              Transaction Details
            </h5>
            <div className="flex bg-muted p-1 rounded-lg">
              <button
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  type === "credit"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setType("credit")}
              >
                Credit
              </button>
              <button
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  type === "debit"
                    ? "bg-destructive text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setType("debit")}
              >
                Debit
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="userId">Select User</Label>
                  {selectedUserBalance !== null && (
                    <span className="text-sm font-bold text-primary">
                      Balance: ₦{selectedUserBalance.toLocaleString()}
                    </span>
                  )}
                </div>
                <Select
                  value={formData.userId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, userId: val })
                  }
                  required
                >
                  <SelectTrigger id="userId" className="w-full">
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem
                        key={user._id || user.id}
                        value={user._id || user.id}
                      >
                        {user.firstName} {user.lastName} (@{user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.userId && (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs text-primary"
                    onClick={() => setHistoryModalOpen(true)}
                  >
                    View Transaction History
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="week">Target Week</Label>
                  <Input
                    id="week"
                    placeholder="e.g. Week 4"
                    value={formData.week}
                    onChange={(e) =>
                      setFormData({ ...formData, week: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter transaction reason..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full py-6 text-lg font-bold ${
                type === "credit"
                  ? "bg-primary"
                  : "bg-destructive text-white hover:bg-destructive/90"
              }`}
              disabled={loading}
            >
              {loading ? (
                <Icon icon="line-md:loading-twotone-loop" className="mr-2" />
              ) : (
                <Icon
                  icon={
                    type === "credit"
                      ? "solar:arrow-up-outline"
                      : "solar:arrow-down-outline"
                  }
                  className="mr-2"
                />
              )}
              {type === "credit" ? "Credit Bonus" : "Debit Account"}
            </Button>
          </form>
        </CardBox>

        <div className="hidden md:flex flex-col justify-center items-center p-6 text-center">
          <div
            className={`p-8 rounded-full mb-6 ${type === "credit" ? "bg-primary/10" : "bg-destructive/10"}`}
          >
            <Icon
              icon={
                type === "credit"
                  ? "solar:hand-stars-bold-duotone"
                  : "solar:shield-warning-bold-duotone"
              }
              className={`text-8xl ${type === "credit" ? "text-primary" : "text-destructive"}`}
            />
          </div>
          <h3 className="text-2xl font-bold mb-2">
            {type === "credit" ? "Reward Excellence" : "Adjustment Action"}
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {type === "credit"
              ? "Carefully credit bonuses to users for exceptional performance or completed tasks."
              : "Use debiting with caution to correct wallet balances or handle deductions."}
          </p>
        </div>
      </div>

      {/* History Modal */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bal. After</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedUserHistory.length > 0 ? (
                  selectedUserHistory.map((tx) => (
                    <TableRow key={tx._id || tx.id}>
                      <TableCell className="text-sm">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.type?.toLowerCase() === "credit"
                              ? "success"
                              : "error"
                          }
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`font-bold ${tx.type?.toLowerCase() === "credit" ? "text-success" : "text-destructive"}`}
                      >
                        {tx.type?.toLowerCase() === "credit" ? "+" : "-"} ₦
                        {tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₦{(tx.balanceAfter || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>{tx.week || "N/A"}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {tx.reference}
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={tx.description}
                      >
                        {tx.description}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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

export default ManageWallet;
