"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import AssetPerformanceChart from "@/components/charts/AssetPerformanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [strategyStats, setStrategyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [tradeStatsRes, strategyStatsRes] = await Promise.all([
          api.get("/trades/stats"),
          api.get("/strategies/stats"),
        ]);
        setStats(tradeStatsRes.data);
        setStrategyStats(strategyStatsRes.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-center">No data available</div>;
  }

  // Calculate some additional stats
  const profitFactor =
    Math.abs(stats.avgLoss) > 0
      ? (
          (stats.totalWins * stats.avgWin) /
          (stats.totalLosses * Math.abs(stats.avgLoss))
        ).toFixed(2)
      : "N/A";

  const largestWin = stats.totalWins > 0 ? "TODO" : 0; // Backend doesn't send this yet, skip for now or add later

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Profit Factor"
          value={profitFactor}
          description="Gross Profit / Gross Loss"
        />
        <StatCard
          title="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          description={`${stats.totalWins} Wins / ${stats.totalLosses} Losses`}
        />
        <StatCard
          title="Average Win"
          value={`$${stats.avgWin.toFixed(2)}`}
          className="text-green-500"
        />
        <StatCard
          title="Average Loss"
          value={`$${Math.abs(stats.avgLoss).toFixed(2)}`}
          className="text-red-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <AssetPerformanceChart data={stats.assetPerformance || []} />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategyStats.map((strategy) => (
                <div
                  key={strategy._id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{strategy.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {strategy.totalTrades} trades
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        strategy.totalPL > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      ${strategy.totalPL.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {strategy.winRate.toFixed(1)}% Win Rate
                    </p>
                  </div>
                </div>
              ))}
              {strategyStats.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No strategy data available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
