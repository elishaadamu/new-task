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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomAlertDialog } from "@/components/CustomAlertDialog";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import axios from "axios";
import {
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isSameWeek } from "date-fns";

const TASKS_PER_PAGE = 10;

export default function TaskPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  // Removed isModalOpen and formData for create task
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"current" | "previous">("current");
  const [groupedTasks, setGroupedTasks] = useState<{
    current: any[];
    previous: any[];
  }>({ current: [], previous: [] });

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedTaskForComment, setSelectedTaskForComment] =
    useState<any>(null);
  const [adminComment, setAdminComment] = useState("");

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
    setAlertConfig({
      isOpen: true,
      title,
      description,
      onConfirm,
      variant,
    });
  };

  const fetchTasks = async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.TASK.GET), {
        withCredentials: true,
      });
      console.log(response.data);
      if (response.status === 200) {
        const data = response.data;
        let current: any[] = [];
        let previous: any[] = [];

        if (data && (data.currentWeek || data.previousWeeks)) {
          // Handle pre-grouped data
          current = Array.isArray(data.currentWeek) ? data.currentWeek : [];
          previous = Array.isArray(data.previousWeeks) ? data.previousWeeks : [];
        } else if (data && data.tasks && (data.tasks.currentWeek || data.tasks.previousWeeks)) {
           // Handle nested pre-grouped data
           current = Array.isArray(data.tasks.currentWeek) ? data.tasks.currentWeek : [];
           previous = Array.isArray(data.tasks.previousWeeks) ? data.tasks.previousWeeks : [];
        } else {
          // Handle flat list or flat tasks object
          let allTasks: any[] = [];
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
               previous.push(task);
            }
          });
        }
        
        setGroupedTasks({ current, previous });
      }
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setTasks(groupedTasks[filter]);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filter, groupedTasks]);

  // Removed handleCreateTask and handleChange

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await axios.patch(
        apiUrl(`${API_CONFIG.ENDPOINTS.TASK.UPDATE}${taskId}/status`),
        { status: newStatus },
        { withCredentials: true },
      );

      if (response.status === 200) {
        showAlert(
          "Success",
          `Task status updated to ${newStatus}`,
          undefined,
          "success",
        );
        fetchTasks();
      }
    } catch (error: any) {
      console.error("Error updating task status:", error);
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to update status",
        undefined,
        "danger",
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setAlertConfig({
      isOpen: true,
      title: "Confirm Delete",
      description:
        "Are you sure you want to delete this task? This action cannot be undone.",
      variant: "danger",
      onConfirm: async () => {
        try {
          const response = await axios.delete(
            apiUrl(`${API_CONFIG.ENDPOINTS.TASK.DELETE}${taskId}`),
            { withCredentials: true },
          );
          if (response.status === 200) {
            showAlert(
              "Success",
              "Task deleted successfully",
              undefined,
              "success",
            );
            // Optimistically update local state as well
            setGroupedTasks(prev => ({
                ...prev,
                [filter]: prev[filter].filter((t: any) => (t._id || t.id) !== taskId)
            }));
          }
        } catch (error: any) {
          console.error("Error deleting task:", error);
          showAlert(
            "Error",
            error.response?.data?.message || "Failed to delete task",
            undefined,
            "danger",
          );
        }
      },
    });
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForComment) return;
    setLoading(true);
    try {
      const taskId = selectedTaskForComment._id || selectedTaskForComment.id;
      const response = await axios.post(
        apiUrl(`${API_CONFIG.ENDPOINTS.TASK.COMMENT}${taskId}/comment`),
        { comment: adminComment },
        { withCredentials: true },
      );

      if (response.status === 200 || response.status === 201) {
        showAlert(
          "Success",
          "Comment added successfully!",
          undefined,
          "success",
        );
        setAdminComment("");
        setIsCommentModalOpen(false);
        fetchTasks();
      }
    } catch (error: any) {
      console.error("Error adding comment:", error);
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to add comment",
        undefined,
        "danger",
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);
  const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
  const endIndex = startIndex + TASKS_PER_PAGE;
  const paginatedTasks = tasks.slice(startIndex, endIndex);

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
    <div className=" space-y-6">
      <div className="flex gap-6 justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Task Management
          </h1>
          <p className="text-muted-foreground">
            {filter === "current" ? "Current Week Tasks" : "Previous Weeks Tasks"}
          </p>
        </div>

        <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(val: "current" | "previous") => setFilter(val)}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="current">Current Week</SelectItem>
                <SelectItem value="previous">Previous Week</SelectItem>
            </SelectContent>
            </Select>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[150px]">Date Created</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetchLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Icon
                      icon="line-md:loading-twotone-loop"
                      className="text-3xl text-primary"
                    />
                    <span className="text-muted-foreground">
                      Loading tasks...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : Array.isArray(tasks) && tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No tasks found. Create one to get started!
                </TableCell>
              </TableRow>
            ) : (
              Array.isArray(paginatedTasks) &&
              paginatedTasks.map((t, idx) => (
                <TableRow
                  key={t._id || idx}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-semibold">{t.title}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col gap-1 cursor-help">
                            <span className="truncate block">{t.task}</span>
                            {t.comment && (
                              <div className="bg-muted px-2 py-1 rounded text-xs border-l-2 border-primary mt-1">
                                <span className="font-bold text-primary mr-1">
                                  Admin:
                                </span>
                                <span className="text-muted-foreground truncate block">
                                  {t.comment}
                                </span>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[300px]">
                          <div className="flex flex-col gap-2 py-1">
                            <div>
                              <p className="font-bold text-xs text-gray-400 uppercase  mb-1">
                                Task Description
                              </p>
                              <p className="text-sm text-gray-100">{t.task}</p>
                            </div>
                            {t.comment && (
                              <div className="pt-2 border-t">
                                <p className="font-bold text-xs uppercase text-primary mb-1">
                                  Admin Comment
                                </p>
                                <p className="text-sm">{t.comment}</p>
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === "SUCCESS"
                          ? "lightSuccess"
                          : t.status === "FAILED"
                            ? "lightError"
                            : t.status === "IN_PROGRESS"
                              ? "lightWarning"
                              : "lightPrimary"
                      }
                      className="font-bold"
                    >
                      {t.status || "PENDING"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Update Status
                        </div>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(t._id || t.id, "PENDING")
                          }
                        >
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          <span>Pending</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(t._id || t.id, "IN_PROGRESS")
                          }
                        >
                          <PlayCircle className="mr-2 h-4 w-4 text-warning" />
                          <span>In Progress</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(t._id || t.id, "SUCCESS")
                          }
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                          <span>Success</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(t._id || t.id, "FAILED")
                          }
                        >
                          <XCircle className="mr-2 h-4 w-4 text-destructive" />
                          <span>Failed</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTaskForComment(t);
                            setAdminComment(t.comment || "");
                            setIsCommentModalOpen(true);
                          }}
                        >
                          <Icon
                            icon="solar:chat-line-linear"
                            className="mr-2 h-4 w-4 text-info"
                          />
                          <span>Add Comment</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => handleDeleteTask(t._id || t.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Task</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {tasks.length > 0 && (
        <div className="border rounded-lg bg-card p-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, tasks.length)} of{" "}
            {tasks.length} tasks
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

      <CustomAlertDialog
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        description={alertConfig.description}
        variant={alertConfig.variant}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.variant === "danger" ? "Delete" : "OK"}
      />

      <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handlePostComment}>
            <DialogHeader>
              <DialogTitle>Admin Comment</DialogTitle>
              <DialogDescription>
                Add a feedback or note to this task.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid gap-2">
                <Label htmlFor="adminComment">Your Comment</Label>
                <Textarea
                  id="adminComment"
                  placeholder="Enter your comment here..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  required
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsCommentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Comment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
