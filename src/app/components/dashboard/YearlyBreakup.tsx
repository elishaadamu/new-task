"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import CardBox from "../shared/CardBox";
import { ApexOptions } from "apexcharts";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import axios from "axios";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Task {
  _id?: string;
  id?: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED";
  createdAt?: string;
}

const YearlyBreakup: React.FC = () => {
  const [chartData, setChartData] = useState<{
    series: number[];
    options: ApexOptions;
  }>({
    series: [],
    options: {},
  });
  const [isLoading, setIsLoading] = useState(true);

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

        // Calculate status counts for the chart
        const statusCounts = {
          PENDING: 0,
          IN_PROGRESS: 0,
          SUCCESS: 0,
          FAILED: 0,
        };

        taskList.forEach((task) => {
          if (task.status in statusCounts) {
            statusCounts[task.status as keyof typeof statusCounts]++;
          }
        });

        setChartData({
          series: [
            statusCounts.PENDING,
            statusCounts.IN_PROGRESS,
            statusCounts.SUCCESS,
            statusCounts.FAILED,
          ],
          options: {
            chart: {
              type: "donut",
              fontFamily: "inherit",
              toolbar: { show: false },
            },
            labels: ["Pending", "In Progress", "Success", "Failed"],
            colors: ["#EAB308", "#3B82F6", "#22C55E", "#EF4444"],
            plotOptions: {
              pie: {
                donut: {
                  size: "70%",
                  labels: {
                    show: true,
                    total: {
                      show: true,
                      label: "Total Tasks",
                      color: "#FFFFFF",
                      formatter: function (w) {
                        return w.globals.seriesTotals
                          .reduce((a: number, b: number) => a + b, 0)
                          .toString();
                      },
                    },
                  },
                },
              },
            },
            dataLabels: {
              enabled: false,
            },
            legend: {
              show: true,
              position: "bottom",
              horizontalAlign: "center",
              labels: {
                colors: "#FFFFFF",
              },
              itemMargin: {
                horizontal: 10,
                vertical: 5,
              },
            },
            stroke: {
              show: false,
            },
            tooltip: {
              theme: "dark",
              y: {
                formatter: function (val) {
                  return val.toString();
                },
              },
            },
          },
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <CardBox className="pb-0 h-full w-full">
      <div className="sm:flex items-center justify-between mb-6">
        <div>
          <h5 className="card-title">Task Status Overview</h5>
          <p className="text-sm text-muted-foreground font-normal">
            Distribution of Task Statuses
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[316px] w-full flex items-center justify-center">
          Loading...
        </div>
      ) : chartData.series.length > 0 ? (
        <div className="flex justify-center items-center h-[316px]">
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="donut"
            height={300}
            width="100%"
          />
        </div>
      ) : (
        <div className="h-[316px] w-full flex items-center justify-center">
          No data available
        </div>
      )}
    </CardBox>
  );
};

export default YearlyBreakup;
