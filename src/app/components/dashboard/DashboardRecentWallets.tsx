"use client";

import React, { useEffect, useState } from "react";
import CardBox from "../shared/CardBox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import axios from "axios";

interface Wallet {
  _id?: string;
  userId?: {
    _id?: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  balance: number;
  updatedAt?: string;
}

export default function DashboardRecentWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.WALLET.GET_ALL_WALLETS),
        { withCredentials: true },
      );

      const data = response.data;
      let walletList: Wallet[] = Array.isArray(data)
        ? data
        : (data.wallets ?? []);

      setWallets(walletList.slice(0, 5));
    } catch (error) {
      console.error("Error fetching wallets:", error);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardBox className="h-full">
      <div className="flex justify-between items-start mb-6 gap-4">
        <div>
          <h5 className="card-title flex items-center gap-2">
            <Icon
              icon="solar:wallet-bold-duotone"
              className="text-primary text-2xl"
            />
            Recent Wallets
          </h5>
          <p className="text-sm text-muted-foreground font-normal">
            Latest wallet transactions
          </p>
        </div>
        <Link href="/manage-wallet">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            View All
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <span className="text-muted-foreground">Loading...</span>
                </TableCell>
              </TableRow>
            ) : wallets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No wallets found
                </TableCell>
              </TableRow>
            ) : (
              wallets.map((wallet) => (
                <TableRow key={wallet._id}>
                  <TableCell className="font-medium">
                    {wallet.userId?.firstName || "N/A"}{" "}
                    {wallet.userId?.lastName || ""}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    @{wallet.userId?.username || "N/A"}
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    ₦{(wallet.balance || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {wallet.updatedAt
                      ? new Date(wallet.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CardBox>
  );
}
