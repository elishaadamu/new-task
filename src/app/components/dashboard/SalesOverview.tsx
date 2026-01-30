"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import CardBox from "../shared/CardBox";
import { ApexOptions } from "apexcharts";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Task {
  _id?: string;
  id?: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED";
  createdAt?: string;
}

const SalesOverview: React.FC = () => {
  const [chartData, setChartData] = useState<{
    series: ApexAxisChartSeries;
    options: ApexOptions;
  }>({
    series: [],
    options: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

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
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedMonth || allTasks.length === 0) {
      if (!isLoading && allTasks.length === 0) {
        setChartData({ series: [], options: {} });
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

    // Process data for chart
    const tasksByDateAndStatus: Record<string, Record<string, number>> = {};
    const uniqueDates = new Set<string>();

    filteredTasks.forEach((task) => {
      if (task.createdAt) {
        const date = new Date(task.createdAt).toISOString().split("T")[0];
        uniqueDates.add(date);
        if (!tasksByDateAndStatus[date]) {
          tasksByDateAndStatus[date] = {
            PENDING: 0,
            IN_PROGRESS: 0,
            SUCCESS: 0,
            FAILED: 0,
          };
        }
        if (task.status in tasksByDateAndStatus[date]) {
          tasksByDateAndStatus[date][task.status]++;
        }
      }
    });

    const sortedDates = Array.from(uniqueDates).sort();

    const seriesData = {
      PENDING: [] as number[],
      IN_PROGRESS: [] as number[],
      SUCCESS: [] as number[],
      FAILED: [] as number[],
    };

    sortedDates.forEach((date) => {
      const dayData = tasksByDateAndStatus[date] || {
        PENDING: 0,
        IN_PROGRESS: 0,
        SUCCESS: 0,
        FAILED: 0,
      };
      seriesData.PENDING.push(dayData.PENDING);
      seriesData.IN_PROGRESS.push(dayData.IN_PROGRESS);
      seriesData.SUCCESS.push(dayData.SUCCESS);
      seriesData.FAILED.push(dayData.FAILED);
    });

    const maxCount = Math.max(
      ...seriesData.PENDING,
      ...seriesData.IN_PROGRESS,
      ...seriesData.SUCCESS,
      ...seriesData.FAILED,
      0,
    );

    setChartData({
      series: [
        { name: "Pending", data: seriesData.PENDING },
        { name: "In Progress", data: seriesData.IN_PROGRESS },
        { name: "Success", data: seriesData.SUCCESS },
        { name: "Failed", data: seriesData.FAILED },
      ],
      options: {
        chart: {
          type: "bar",
          fontFamily: "inherit",
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        colors: ["#EAB308", "#3B82F6", "#22C55E", "#EF4444"],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "15%",
            borderRadius: 4,
          },
        },
        xaxis: {
          categories: sortedDates,
          labels: {
            style: {
              colors: "#7C8FAC",
            },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          max: maxCount + 2,
          labels: {
            style: {
              colors: "#7C8FAC",
            },
            formatter: (val) => val.toFixed(0),
          },
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        grid: {
          borderColor: "rgba(0,0,0,0.1)",
          strokeDashArray: 3,
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: true,
          position: "top",
          horizontalAlign: "right",
        },
        tooltip: {
          theme: "dark",
        },
      },
    });
  }, [selectedMonth, allTasks, isLoading]);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <CardBox className="pb-0 h-full w-full">
      <div className="sm:flex items-center justify-between mb-6">
        <div>
          <h5 className="card-title">Task Status Trends</h5>
          <p className="text-sm text-muted-foreground font-normal">
            Daily distribution of task statuses
          </p>
        </div>
        {availableMonths.length > 0 && (
          <div className="w-[180px]">
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

      {isLoading ? (
        <div className="h-[316px] w-full flex items-center justify-center">
          Loading...
        </div>
      ) : chartData.series.length > 0 ? (
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="bar"
          height={316}
          width="100%"
        />
      ) : (
        <div className="h-[316px] w-full flex items-center justify-center">
          No data available
        </div>
      )}
    </CardBox>
  );
};

export default SalesOverview;
