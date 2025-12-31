"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trade } from "./TradeTable";
import { Separator } from "@/components/ui/separator";

interface TradeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
}

export default function TradeDetailsModal({
  isOpen,
  onClose,
  trade,
}: TradeDetailsModalProps) {
  if (!trade) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Trade Details</DialogTitle>
            <Badge
              variant={trade.tradeType === "buy" ? "default" : "secondary"}
              className={
                trade.tradeType === "buy"
                  ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 mr-8"
                  : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 mr-8"
              }
            >
              {trade.tradeType.toUpperCase()}
            </Badge>
          </div>
          <DialogDescription>
            {format(new Date(trade.tradeDate), "MMMM dd, yyyy")} - {trade.asset}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Market</span>
              <p className="font-medium capitalize">{trade.market}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Result</span>
              <Badge
                variant="outline"
                className={`${
                  trade.result === "win"
                    ? "border-green-500 text-green-500"
                    : trade.result === "loss"
                    ? "border-red-500 text-red-500"
                    : "border-gray-500 text-gray-500"
                }`}
              >
                {trade.result.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Strategy</span>
              <p className="font-medium">
                {typeof trade.strategy === "object" && trade.strategy
                  ? trade.strategy.name
                  : "No Strategy"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">P/L</span>
              <p
                className={`font-bold ${
                  trade.profitLoss >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {trade.profitLoss >= 0 ? "+" : ""}
                ${trade.profitLoss.toFixed(2)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Price & Size Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Entry Price</span>
              <p className="font-mono">{trade.entryPrice}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Exit Price</span>
              <p className="font-mono">{trade.exitPrice}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Position Size</span>
              <p className="font-mono">{trade.positionSize}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">R:R Ratio</span>
              <p className="font-mono">
                {trade.rrRatio ? trade.rrRatio.toFixed(2) : "-"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Risk Management */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Stop Loss</span>
              <p className="font-mono">{trade.stopLoss || "-"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Take Profit</span>
              <p className="font-mono">{trade.takeProfit || "-"}</p>
            </div>
          </div>

          {/* Notes */}
          {trade.notes && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Notes</span>
              <div className="p-3 bg-muted/30 rounded-md text-sm whitespace-pre-wrap">
                {trade.notes}
              </div>
            </div>
          )}

          {/* Images */}
          {trade.images && trade.images.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Attached Images</span>
              <div className="grid grid-cols-2 gap-4">
                {trade.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-md overflow-hidden border bg-muted"
                  >
                    <img
                      src={`http://localhost:5000${img}`}
                      alt={`Trade attachment ${index + 1}`}
                      className="object-contain w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
