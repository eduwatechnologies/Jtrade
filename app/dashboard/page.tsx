"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import EquityChart from "@/components/charts/EquityChart";
import MonthlyPLChart from "@/components/charts/MonthlyPLChart";
import TradeTable, { Trade } from "@/components/TradeTable";
import {
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TradeModal from "@/components/TradeModal";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, tradesRes] = await Promise.all([
        api.get("/trades/stats"),
        api.get("/trades"),
      ]);
      setStats(statsRes.data);
      setTrades(tradesRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Trade
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total P/L"
            value={`$${stats.totalProfitLoss.toFixed(2)}`}
            icon={<DollarSign className="h-4 w-4" />}
            className={
              stats.totalProfitLoss >= 0
                ? "border-l-4 border-l-green-500"
                : "border-l-4 border-l-red-500"
            }
          />
          <StatCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            description={`${stats.totalWins}W - ${stats.totalLosses}L`}
          />
          <StatCard
            title="Total Trades"
            value={stats.totalTrades}
            icon={<Activity className="h-4 w-4" />}
          />
          <StatCard
            title="Avg Win / Loss"
            value={`$${stats.avgWin.toFixed(0)} / $${Math.abs(
              stats.avgLoss
            ).toFixed(0)}`}
            icon={<ArrowUpCircle className="h-4 w-4" />}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
            <EquityChart data={stats?.equityCurve || []} />
        </div>
        <div className="col-span-3">
            <MonthlyPLChart data={stats?.monthlyPL || []} />
        </div>
      </div>

      <TradeTable trades={trades} limit={5} />

      <TradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchData();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
