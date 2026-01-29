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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import axios from "axios";

interface User {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  status?: "ACTIVE" | "SUSPENDED" | string;
}

export default function DashboardRecentUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.USER_ACTIONS.GET_USERS),
        { withCredentials: true },
      );

      const rawData = response.data;
      const allUsers: User[] = Array.isArray(rawData)
        ? rawData
        : (rawData.users ?? []);

      const filteredUsers = allUsers
        .filter((u) => u.role === "USER")
        .slice(0, 5);
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
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
              icon="solar:user-bold-duotone"
              className="text-primary text-2xl"
            />
            Recent Users
          </h5>
          <p className="text-sm text-muted-foreground font-normal">
            Latest registered users
          </p>
        </div>
        <Link href="/users">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            View All
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <span className="text-muted-foreground">Loading...</span>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id || user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {user.status || "ACTIVE"}
                    </Badge>
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
