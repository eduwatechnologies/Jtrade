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
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!trade) return null;

  const getImageUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const rootUrl = apiUrl.replace(/\/api\/?$/, "");
    return `${rootUrl}${path}`;
  };

  return (
    <>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {trade.images.map((img, index) => (
                    <div
                      key={index}
                      className="group relative aspect-video rounded-md overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                      onClick={() => setSelectedImage(getImageUrl(img))}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`Trade attachment ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Rule Evaluations */}
            {trade.ruleEvaluations && trade.ruleEvaluations.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Trading Rules Check</span>
                <div className="grid gap-2">
                  {trade.ruleEvaluations.map((evalItem, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                      <span className="text-sm font-medium">{evalItem.ruleName}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-xs text-muted-foreground">
                            Value: {evalItem.actualValue !== null && evalItem.actualValue !== undefined ? evalItem.actualValue : "N/A"}
                         </span>
                         {evalItem.passed ? (
                            <Badge variant="outline" className="border-green-500 text-green-500 bg-green-500/10">Passed</Badge>
                         ) : (
                            <Badge variant="outline" className="border-red-500 text-red-500 bg-red-500/10">Failed</Badge>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedImage}
            alt="Full size preview"
            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
