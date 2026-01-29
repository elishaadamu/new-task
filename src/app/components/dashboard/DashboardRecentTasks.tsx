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

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.TASK.GET), {
        withCredentials: true,
      });

      const data = response.data;
      let taskList: Task[] = [];

      if (Array.isArray(data)) {
        taskList = data;
      } else if (data && data.tasks) {
        const tasksPayload = data.tasks;
        if (Array.isArray(tasksPayload)) {
          taskList = tasksPayload;
        } else {
          const current = Array.isArray(tasksPayload.currentWeek)
            ? tasksPayload.currentWeek
            : [];
          const previous = Array.isArray(tasksPayload.previousWeeks)
            ? tasksPayload.previousWeeks
            : [];
          taskList = [...current, ...previous];
        }
      } else if (data) {
        const current = Array.isArray(data.currentWeek) ? data.currentWeek : [];
        const previous = Array.isArray(data.previousWeeks)
          ? data.previousWeeks
          : [];
        taskList = [...current, ...previous];
      }

      setTasks(taskList.slice(0, 5));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
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
            Latest administrative tasks
          </p>
        </div>
        <Link href="/task">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            View All
          </Button>
        </Link>
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
