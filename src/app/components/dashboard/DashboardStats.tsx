"use client";

import React, { useEffect, useState } from "react";
import CardBox from "../shared/CardBox";
import { Icon } from "@iconify/react";
import { API_CONFIG, apiUrl } from "@/app/api/api";
import axios from "axios";

interface Stats {
  users: {
    total: number;
    today: number;
    week: number;
    month: number;
  };
  wallets: {
    totalBalance: number;
  };
  tasks: {
    total: number;
    byStatus: {
      pending: number;
      inProgress: number;
      completed: number;
      failed: number;
    };
  };
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.STATISTICS.GET),
        { withCredentials: true },
      );
      console.log(response.data.stats);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <CardBox
            key={i}
            className="animate-pulse h-32 flex items-center justify-center"
          >
            <span className="text-muted-foreground">Loading...</span>
          </CardBox>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.users?.total ?? 0,
      subValue: `+${stats?.users?.today ?? 0} today`,
      icon: "solar:users-group-two-rounded-bold-duotone",
      color: "text-primary",
      bgColor: "bg-lightprimary",
    },
    {
      title: "Total Balance",
      value: `₦${(stats?.wallets?.totalBalance ?? 0).toLocaleString()}`,
      subValue: "Platform total",
      icon: "solar:wallet-money-bold-duotone",
      color: "text-secondary",
      bgColor: "bg-lightsecondary",
    },
    {
      title: "Total Tasks",
      value: stats?.tasks?.total ?? 0,
      subValue: `${stats?.tasks?.byStatus?.completed ?? 0} completed`,
      icon: "solar:clipboard-list-bold-duotone",
      color: "text-success",
      bgColor: "bg-lightsuccess",
    },
    {
      title: "Monthly Users",
      value: stats?.users?.month ?? 0,
      subValue: `+${stats?.users?.week ?? 0} this week`,
      icon: "solar:user-plus-bold-duotone",
      color: "text-warning",
      bgColor: "bg-lightwarning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((card, index) => (
        <CardBox key={index} className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${card.bgColor}`}>
              <Icon icon={card.icon} className={`text-2xl ${card.color}`} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1">{card.value}</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                {card.subValue}
              </span>
            </div>
          </div>
        </CardBox>
      ))}
    </div>
  );
}
