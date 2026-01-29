"use client";

import React, { useState } from "react";
import CardBox from "../shared/CardBox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WalletTableProps {
  wallets: any[];
}

const ITEMS_PER_PAGE = 10;

export default function WalletTable({ wallets }: WalletTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(wallets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedWallets = wallets.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  return (
    <div className="mt-8">
      <CardBox className="p-6">
        <h5 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Icon
            icon="solar:users-group-rounded-bold-duotone"
            className="text-primary text-2xl"
          />
          User Wallets
        </h5>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Current Balance</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWallets.length > 0 ? (
                paginatedWallets.map((wallet) => (
                  <TableRow key={wallet._id || wallet.userId?._id}>
                    <TableCell className="font-medium">
                      {wallet.userId?.firstName || "N/A"}{" "}
                      {wallet.userId?.lastName || ""}
                    </TableCell>
                    <TableCell>@{wallet.userId?.username || "N/A"}</TableCell>
                    <TableCell className="font-bold text-primary">
                      ₦{(wallet.balance || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {wallet.updatedAt
                        ? new Date(wallet.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No wallet data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {wallets.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, wallets.length)}{" "}
              of {wallets.length} wallets
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {generatePageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(page)}
                  className="min-w-[2.5rem]"
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardBox>
    </div>
  );
}
