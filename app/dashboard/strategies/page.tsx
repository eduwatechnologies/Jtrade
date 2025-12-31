"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Strategy {
  _id: string;
  name: string;
  description: string;
}

interface StrategyStats {
  _id: string;
  name: string;
  totalTrades: number;
  winRate: number;
  totalPL: number;
  avgWin: number;
  avgLoss: number;
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [stats, setStats] = useState<StrategyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStrategy, setNewStrategy] = useState({ name: "", description: "" });
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [strategiesRes, statsRes] = await Promise.all([
        api.get("/strategies"),
        api.get("/strategies/stats"),
      ]);
      setStrategies(strategiesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching strategy data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStrategy) {
        await api.put(`/strategies/${editingStrategy._id}`, newStrategy);
      } else {
        await api.post("/strategies", newStrategy);
      }
      setIsModalOpen(false);
      setNewStrategy({ name: "", description: "" });
      setEditingStrategy(null);
      fetchData();
    } catch (error) {
      console.error("Error saving strategy:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will untag all trades with this strategy.")) {
      try {
        await api.delete(`/strategies/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting strategy:", error);
      }
    }
  };

  const openEditModal = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setNewStrategy({ name: strategy.name, description: strategy.description });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Strategies</h2>
        <Button onClick={() => {
            setEditingStrategy(null);
            setNewStrategy({ name: "", description: "" });
            setIsModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Strategy
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
            stat._id !== 'none' && (
                <Card key={stat._id} className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {stat.name}
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            const strategy = strategies.find(s => s._id === stat._id);
                            if (strategy) openEditModal(strategy);
                        }}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(stat._id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stat.totalPL >= 0 ? '+' : ''}${stat.totalPL.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Win Rate: <span className={stat.winRate >= 50 ? "text-green-500" : "text-red-500"}>{stat.winRate.toFixed(1)}%</span>
                        <span className="mx-2">•</span>
                        Trades: {stat.totalTrades}
                    </div>
                     <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        <div>
                            <span className="text-muted-foreground">Avg Win:</span>
                            <div className="text-green-500">${stat.avgWin.toFixed(2)}</div>
                        </div>
                        <div>
                             <span className="text-muted-foreground">Avg Loss:</span>
                            <div className="text-red-500">${Math.abs(stat.avgLoss).toFixed(2)}</div>
                        </div>
                     </div>
                    </CardContent>
                </Card>
            )
        ))}
        {/* Show strategies with no trades yet */}
        {strategies.filter(s => !stats.find(st => st._id === s._id && st._id !== 'none')).map(strategy => (
             <Card key={strategy._id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {strategy.name}
                </CardTitle>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(strategy)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(strategy._id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">No trades recorded yet.</div>
                </CardContent>
            </Card>
        ))}
      </div>
      
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStrategy ? "Edit Strategy" : "Create Strategy"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Strategy Name</Label>
              <Input
                id="name"
                value={newStrategy.name}
                onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                placeholder="e.g. ICT Silver Bullet"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newStrategy.description}
                onChange={(e) => setNewStrategy({ ...newStrategy, description: e.target.value })}
                placeholder="Brief description of the rules..."
              />
            </div>
            <Button type="submit" className="w-full">
              {editingStrategy ? "Update Strategy" : "Create Strategy"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
