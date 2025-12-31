"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import * as Papa from "papaparse";

interface ImportTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportTradesModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportTradesModalProps) {
  const [csvContent, setCsvContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<any[]>([]);

  const parseCSV = (content: string) => {
    const { data } = Papa.parse(content.trim(), {
      header: true,
      skipEmptyLines: true,
    });

    if (data.length === 0) return [];

    const trades: any[] = [];

    data.forEach((row: any) => {
      const trade: any = {};
      const keys = Object.keys(row);

      keys.forEach((key) => {
        const header = key.toLowerCase().trim();
        const value = row[key];
        if (!value) return;

        if (header.includes("asset") || header.includes("symbol"))
          trade.asset = value;
        if (header.includes("type") || header.includes("direction"))
          trade.tradeType = value.toLowerCase();
        if (header.includes("entry") || header.includes("open"))
          trade.entryPrice = parseFloat(value);
        if (header.includes("exit") || header.includes("close"))
          trade.exitPrice = parseFloat(value);
        if (
          header.includes("size") ||
          header.includes("volume") ||
          header.includes("lot")
        )
          trade.positionSize = parseFloat(value);
        if (header.includes("stop") || header.includes("sl"))
          trade.stopLoss = parseFloat(value);
        if (
          header.includes("profit") &&
          (header.includes("take") || header.includes("tp"))
        )
          trade.takeProfit = parseFloat(value);
        if (header.includes("date") || header.includes("time"))
          trade.tradeDate = new Date(value);
        if (header.includes("note") || header.includes("comment"))
          trade.notes = value;
        if (header.includes("market")) trade.market = value.toLowerCase();
        if (header.includes("strategy")) trade.strategy = value;
      });

      if (
        trade.asset &&
        trade.entryPrice &&
        trade.exitPrice &&
        trade.positionSize
      ) {
        trades.push(trade);
      }
    });

    return trades;
  };

  const handlePreview = () => {
    try {
      const parsed = parseCSV(csvContent);
      if (parsed.length === 0) {
        setError("No valid trades found. Check CSV format.");
      } else {
        setError("");
        setPreview(parsed);
      }
    } catch (err) {
      setError("Error parsing CSV.");
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      await api.post("/trades/import", { trades: preview });
      onSuccess();
      onClose();
      setCsvContent("");
      setPreview([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Trades via CSV</DialogTitle>
          <DialogDescription>
            Paste your CSV content below. Supported headers: Asset, Market,
            Type, Strategy, Entry Price, Exit Price, Size, Date, SL, TP, Notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {preview.length === 0 ? (
            <div className="space-y-2">
              <Label htmlFor="csv">CSV Content</Label>
              <Textarea
                id="csv"
                rows={10}
                placeholder={`Asset,Market,Type,Strategy,Entry Price,Exit Price,Size,Date
EURUSD,forex,buy,Trend Following,1.0500,1.0550,1.0,2024-01-01
BTCUSD,crypto,sell,Scalping,45000,44000,0.1,2024-01-02`}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="font-mono text-xs"
              />
              <Button
                onClick={handlePreview}
                variant="secondary"
                className="w-full"
              >
                Preview Trades
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 text-sm text-green-500 bg-green-100/10 border border-green-500/20 rounded-md">
                <CheckCircle2 className="h-4 w-4" />
                Found {preview.length} valid trades ready to import.
              </div>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="p-2">Asset</th>
                      <th className="p-2">Market</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Strategy</th>
                      <th className="p-2">Entry</th>
                      <th className="p-2">Exit</th>
                      <th className="p-2">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((t, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="p-2">{t.asset}</td>
                        <td className="p-2">{t.market || "-"}</td>
                        <td className="p-2">{t.tradeType}</td>
                        <td className="p-2">{t.strategy || "-"}</td>
                        <td className="p-2">{t.entryPrice}</td>
                        <td className="p-2">{t.exitPrice}</td>
                        <td className="p-2">{t.positionSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 5 && (
                  <div className="p-2 text-center text-muted-foreground text-xs bg-muted/50">
                    ...and {preview.length - 5} more
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreview([])}
                  className="flex-1"
                >
                  Back to Editor
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Importing..." : "Confirm Import"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
