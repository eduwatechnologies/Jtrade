"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import TradeTable, { Trade } from "@/components/TradeTable";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import TradeModal from "@/components/TradeModal";
import TradeDetailsModal from "@/components/TradeDetailsModal";
import ImportTradesModal from "@/components/ImportTradesModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);
  const [strategies, setStrategies] = useState<any[]>([]);

  // Filters
  const [assetFilter, setAssetFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [strategyFilter, setStrategyFilter] = useState("all");

  const fetchStrategies = async () => {
    try {
      const { data } = await api.get("/strategies");
      setStrategies(data);
    } catch (error) {
      console.error("Error fetching strategies:", error);
    }
  };

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (assetFilter) params.asset = assetFilter;
      if (resultFilter !== "all") params.result = resultFilter;
      if (strategyFilter !== "all") params.strategy = strategyFilter;

      const { data } = await api.get("/trades", { params });
      setTrades(data);
    } catch (error) {
      console.error("Error fetching trades:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [assetFilter, resultFilter, strategyFilter]);

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setIsModalOpen(true);
  };

  const handleView = (trade: Trade) => {
    setViewingTrade(trade);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      try {
        await api.delete(`/trades/${id}`);
        fetchTrades();
      } catch (error) {
        console.error("Error deleting trade:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrade(null);
  };

  const handleSuccess = () => {
    fetchTrades();
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Trade History</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Trade
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex-1">
          <Input
            placeholder="Filter by Asset (e.g. EURUSD)"
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={strategyFilter} onValueChange={setStrategyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strategies</SelectItem>
              {strategies.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={resultFilter} onValueChange={setResultFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="win">Wins</SelectItem>
              <SelectItem value="loss">Losses</SelectItem>
              <SelectItem value="break-even">Break Even</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading trades...</div>
      ) : (
        <TradeTable
          trades={trades}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          showActions={true}
        />
      )}

      <TradeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        tradeToEdit={editingTrade}
      />

      <TradeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        trade={viewingTrade}
      />

      <ImportTradesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchTrades();
          // Optionally show success toast
        }}
      />
    </div>
  );
}
