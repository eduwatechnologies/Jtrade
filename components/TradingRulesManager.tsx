import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RuleModal from "./RuleModal";

interface Rule {
  _id: string;
  name: string;
  category: string;
  condition: {
    field: string;
    operator: string;
    value?: any;
  };
  isActive: boolean;
}

interface RuleStats {
  ruleId: string;
  ruleName: string;
  total: number;
  passed: number;
  passRate: number;
}

export default function TradingRulesManager() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [stats, setStats] = useState<RuleStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | undefined>(undefined);

  const fetchData = async () => {
    try {
      const [rulesRes, statsRes] = await Promise.all([
        api.get("/rules"),
        api.get("/rules/stats"),
      ]);
      setRules(rulesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    try {
      await api.delete(`/rules/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete rule", err);
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingRule(undefined);
    setIsModalOpen(true);
  };

  const getRuleStat = (ruleId: string) => {
    return stats.find((s) => s.ruleId === ruleId);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "risk":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "entry":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "trade":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "time":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trading Rules</h2>
          <p className="text-muted-foreground">
            Define your trading discipline and automated checks.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Rule
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.map((rule) => (
          <Card key={rule._id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge
                  variant="outline"
                  className={getCategoryColor(rule.category)}
                >
                  {rule.category.toUpperCase()}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => handleDelete(rule._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg mt-2">{rule.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded mb-3">
                <code className="text-primary font-semibold">
                  {rule.condition.field}
                </code>
                <span>{rule.condition.operator}</span>
                {rule.condition.value && (
                  <code className="text-primary font-semibold">
                    {rule.condition.value}
                  </code>
                )}
              </div>

              {getRuleStat(rule._id) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Adherence Rate</span>
                    <span
                      className={
                        getRuleStat(rule._id)!.passRate >= 80
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {getRuleStat(rule._id)!.passRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        getRuleStat(rule._id)!.passRate >= 80
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${getRuleStat(rule._id)!.passRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    {getRuleStat(rule._id)!.passed} /{" "}
                    {getRuleStat(rule._id)!.total} trades
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {rules.length === 0 && !loading && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/20">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No Rules Defined</h3>
            <p className="text-muted-foreground mb-4">
              Create your first trading rule to start tracking discipline.
            </p>
            <Button onClick={handleAdd}>Create Rule</Button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <RuleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
          ruleToEdit={editingRule}
        />
      )}
    </div>
  );
}
