"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { RefreshCw, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SyncStatus {
  totalTrades: number;
  lastSyncAt: string | null;
  lastTradeDate: string | null;
}

export default function SyncStatusIndicator() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/mt5/status");
      setStatus(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch sync status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading && !status) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Checking sync status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-500">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
        <button onClick={fetchStatus} className="underline hover:no-underline">
          Retry
        </button>
      </div>
    );
  }

  if (!status) return null;

  const isSyncedRecently = status.lastSyncAt
    ? new Date(status.lastSyncAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center">
          <RefreshCw className="mr-2 h-5 w-5 text-blue-500" />
          Sync Status
        </h3>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="p-1 hover:bg-muted rounded-full transition-colors"
          title="Refresh status"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connection</span>
          <div className="flex items-center">
            {isSyncedRecently ? (
              <span className="flex items-center text-sm text-green-600 font-medium">
                <CheckCircle className="mr-1.5 h-4 w-4" />
                Active
              </span>
            ) : status.lastSyncAt ? (
              <span className="flex items-center text-sm text-yellow-600 font-medium">
                <Clock className="mr-1.5 h-4 w-4" />
                Idle
              </span>
            ) : (
              <span className="flex items-center text-sm text-muted-foreground">
                No data yet
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last Sync</span>
          <span className="text-sm font-medium">
            {status.lastSyncAt
              ? formatDistanceToNow(new Date(status.lastSyncAt), { addSuffix: true })
              : "Never"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Trades Synced</span>
          <span className="text-sm font-medium">{status.totalTrades}</span>
        </div>

        {status.lastTradeDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Latest Trade</span>
            <span className="text-sm font-medium">
              {new Date(status.lastTradeDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
