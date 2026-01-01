import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

interface RuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ruleToEdit?: any;
}

export default function RuleModal({
  isOpen,
  onClose,
  onSuccess,
  ruleToEdit,
}: RuleModalProps) {
  const [name, setName] = useState(ruleToEdit?.name || "");
  const [category, setCategory] = useState(ruleToEdit?.category || "risk");
  const [field, setField] = useState(ruleToEdit?.condition?.field || "risk");
  const [operator, setOperator] = useState(
    ruleToEdit?.condition?.operator || ">"
  );
  const [value, setValue] = useState(ruleToEdit?.condition?.value || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const ruleData = {
      name,
      category,
      condition: {
        field,
        operator,
        value:
          operator === "exists" || operator === "not_exists"
            ? undefined
            : value,
      },
    };

    try {
      if (ruleToEdit) {
        await api.put(`/rules/${ruleToEdit._id}`, ruleData);
      } else {
        await api.post("/rules", ruleData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save rule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {ruleToEdit ? "Edit Rule" : "Create New Rule"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Max Risk 2%"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk">Risk Management</SelectItem>
                <SelectItem value="entry">Entry Confirmation</SelectItem>
                <SelectItem value="trade">Trade Management</SelectItem>
                <SelectItem value="time">Time/Session</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Condition</Label>
            <div className="flex gap-2">
              <Select value={field} onValueChange={setField}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk">Risk Amount</SelectItem>
                  <SelectItem value="reward">Reward Amount</SelectItem>
                  <SelectItem value="rrRatio">R:R Ratio</SelectItem>
                  <SelectItem value="stopLoss">Stop Loss</SelectItem>
                  <SelectItem value="takeProfit">Take Profit</SelectItem>
                  <SelectItem value="time">Time (Hour)</SelectItem>
                  <SelectItem value="dayOfWeek">Day of Week</SelectItem>
                  <SelectItem value="tradeType">Trade Type</SelectItem>
                </SelectContent>
              </Select>

              <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Op" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=">">&gt;</SelectItem>
                  <SelectItem value="<">&lt;</SelectItem>
                  <SelectItem value=">=">&ge;</SelectItem>
                  <SelectItem value="<=">&le;</SelectItem>
                  <SelectItem value="=">=</SelectItem>
                  <SelectItem value="!=">!=</SelectItem>
                  <SelectItem value="exists">Exists</SelectItem>
                  <SelectItem value="not_exists">Not Exists</SelectItem>
                </SelectContent>
              </Select>

              {operator !== "exists" &&
                operator !== "not_exists" &&
                (field === "dayOfWeek" ? (
                  <Select value={value.toString()} onValueChange={setValue}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                ) : field === "tradeType" ? (
                  <Select value={value.toString()} onValueChange={setValue}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="flex-1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Value"
                    required
                  />
                ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
