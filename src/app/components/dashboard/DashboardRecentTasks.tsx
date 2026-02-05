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
import { CheckCircle2, Clock, PlayCircle, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isSameWeek } from "date-fns";

interface Task {
  _id?: string;
  id?: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED";
  createdAt?: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
  IN_PROGRESS: <PlayCircle className="h-4 w-4 text-blue-500" />,
  SUCCESS: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  FAILED: <XCircle className="h-4 w-4 text-red-500" />,
};

export default function DashboardRecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"current" | "previous">("current");
  const [groupedTasks, setGroupedTasks] = useState<{
    current: Task[];
    previous: Task[];
  }>({ current: [], previous: [] });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Update displayed tasks when filter or groupedTasks changes
    setTasks(groupedTasks[filter].slice(0, 5));
  }, [filter, groupedTasks]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.TASK.GET), {
        withCredentials: true,
      });
      console.log(response.data);

      const data = response.data;
      let current: Task[] = [];
      let previous: Task[] = [];

      if (data && (data.currentWeek || data.previousWeeks)) {
        // Handle pre-grouped data
        current = Array.isArray(data.currentWeek) ? data.currentWeek : [];
        previous = Array.isArray(data.previousWeeks) ? data.previousWeeks : [];
      } else if (data && data.tasks && (data.tasks.currentWeek || data.tasks.previousWeeks)) {
         // Handle nested pre-grouped data
         current = Array.isArray(data.tasks.currentWeek) ? data.tasks.currentWeek : [];
         previous = Array.isArray(data.tasks.previousWeeks) ? data.tasks.previousWeeks : [];
      } else {
        // Handle flat list - client side filtering
        let allTasks: Task[] = [];
        if (Array.isArray(data)) {
          allTasks = data;
        } else if (data && Array.isArray(data.tasks)) {
          allTasks = data.tasks;
        }

        const now = new Date();
        allTasks.forEach((task) => {
          if (!task.createdAt) return;
          const taskDate = new Date(task.createdAt);
          if (isSameWeek(taskDate, now, { weekStartsOn: 1 })) {
             current.push(task);
          } else {
             // You might want to be more specific here, e.g., isSameWeek(taskDate, subWeeks(now, 1))
             // But "previousWeeks" implies everything before.
             previous.push(task);
          }
        });
      }

      setGroupedTasks({ current, previous });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setGroupedTasks({ current: [], previous: [] });
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
              icon="solar:clipboard-list-bold-duotone"
              className="text-primary text-2xl"
            />
            Recent Tasks
          </h5>
          <p className="text-sm text-muted-foreground font-normal">
             {filter === "current" ? "Current Week" : "Previous Weeks"}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(val: "current" | "previous") => setFilter(val)}>
            <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="current">Current Week</SelectItem>
                <SelectItem value="previous">Previous Week</SelectItem>
            </SelectContent>
            </Select>
            <Link href="/task">
            <Button variant="outline" size="sm" className="whitespace-nowrap h-8">
                View All
            </Button>
            </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[150px]">Date Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <span className="text-muted-foreground">Loading...</span>
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-muted-foreground"
                >
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task._id || task.id}>
                  <TableCell className="font-medium truncate max-w-[200px]">
                    {task.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.status === "SUCCESS"
                          ? "default"
                          : task.status === "FAILED"
                            ? "destructive"
                            : "secondary"
                      }
                      className="flex items-center gap-1 w-fit"
                    >
                      {statusIcons[task.status]}
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleDateString()
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
