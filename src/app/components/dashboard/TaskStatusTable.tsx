"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CardBox from "../shared/CardBox";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  _id?: string;
  id?: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED";
  createdAt?: string;
  weekStart?: string;
  weekEnd?: string;
}

interface DailyTaskStats {
  date: string;
  pending: number;
  inProgress: number;
  successful: number;
  failed: number;
}

const TaskStatusTable: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tableData, setTableData] = useState<DailyTaskStats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.TASK.GET),
          {
            withCredentials: true,
          },
        );

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
          const current = Array.isArray(data.currentWeek)
            ? data.currentWeek
            : [];
          const previous = Array.isArray(data.previousWeeks)
            ? data.previousWeeks
            : [];
          taskList = [...current, ...previous];
        }

        setAllTasks(taskList);

        const monthsSet = new Set<string>();
        taskList.forEach((task) => {
          if (task.createdAt) {
            const date = new Date(task.createdAt);
            const monthStr = `${date.getFullYear()}-${String(
              date.getMonth() + 1,
            ).padStart(2, "0")}`;
            monthsSet.add(monthStr);
          }
        });

        const sortedMonths = Array.from(monthsSet).sort().reverse();
        setAvailableMonths(sortedMonths);
        if (sortedMonths.length > 0) {
          setSelectedMonth(sortedMonths[0]);
        }
      } catch (error) {
        console.error("Error fetching task data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedMonth || allTasks.length === 0) {
      if (!isLoading && allTasks.length === 0) {
        setTableData([]);
      }
      return;
    }

    const filteredTasks = allTasks.filter((task) => {
      if (!task.createdAt) return false;
      const date = new Date(task.createdAt);
      const monthStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;
      return monthStr === selectedMonth;
    });

    // Group tasks by date
    const tasksByDate: Record<string, DailyTaskStats> = {};

    filteredTasks.forEach((task) => {
      if (task.createdAt) {
        const dateObj = new Date(task.createdAt);
        const dateStr = dateObj.toISOString().split("T")[0];
        
        if (!tasksByDate[dateStr]) {
          tasksByDate[dateStr] = {
            date: dateStr,
            pending: 0,
            inProgress: 0,
            successful: 0,
            failed: 0,
          };
        }

        switch (task.status) {
          case "PENDING":
            tasksByDate[dateStr].pending++;
            break;
          case "IN_PROGRESS":
            tasksByDate[dateStr].inProgress++;
            break;
          case "SUCCESS":
            tasksByDate[dateStr].successful++;
            break;
          case "FAILED":
            tasksByDate[dateStr].failed++;
            break;
        }
      }
    });

    // Convert to array and sort by date (most recent first)
    const sortedData = Object.values(tasksByDate).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    setTableData(sortedData);
  }, [selectedMonth, allTasks, isLoading]);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <CardBox>
      <div id="task-status-table" className="mb-6">
        <div className="sm:flex items-center justify-between">
          <div>
            <h5 className="card-title">Task Status Summary</h5>
            <p className="text-sm text-muted-foreground font-normal">
              Daily breakdown of task statuses
            </p>
          </div>
          {availableMonths.length > 0 && (
            <div className="w-[180px] mt-3 sm:mt-0">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {formatMonth(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="h-[200px] w-full flex items-center justify-center">
                  Loading...
                </div>
              ) : tableData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm font-semibold">
                        Date
                      </TableHead>
                      <TableHead className="text-sm font-semibold text-center">
                        Pending
                      </TableHead>
                      <TableHead className="text-sm font-semibold text-center">
                        In Progress
                      </TableHead>
                      <TableHead className="text-sm font-semibold text-center">
                        Successful
                      </TableHead>
                      <TableHead className="text-sm font-semibold text-center">
                        Failed
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {tableData.map((row, index) => (
                      <TableRow key={row.date} className="border-b border-border">
                        <TableCell>
                          <p className="font-medium text-sm">
                            {formatDate(row.date)}
                          </p>
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 font-semibold text-sm">
                            {row.pending}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold text-sm">
                            {row.inProgress}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-semibold text-sm">
                            {row.successful}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-semibold text-sm">
                            {row.failed}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="h-[200px] w-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CardBox>
  );
};

export default TaskStatusTable;
