"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Pencil, Trash2, Paperclip, Eye } from "lucide-react";

export interface Trade {
  _id: string;
  asset: string;
  market: string;
  tradeType: "buy" | "sell";
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  profitLoss: number;
  result: "win" | "loss" | "break-even";
  tradeDate: string;
  strategy?: { name: string } | string;
  rrRatio?: number;
  stopLoss?: number;
  takeProfit?: number;
  notes?: string;
  images?: string[];
  ruleEvaluations?: {
    rule: string;
    ruleName: string;
    passed: boolean;
    actualValue: any;
  }[];
}

interface TradeTableProps {
  trades: Trade[];
  onEdit?: (trade: Trade) => void;
  onDelete?: (id: string) => void;
  onView?: (trade: Trade) => void;
  limit?: number;
  showActions?: boolean;
}

export default function TradeTable({
  trades,
  onEdit,
  onDelete,
  onView,
  limit,
  showActions = false,
}: TradeTableProps) {
  const displayTrades = limit ? trades.slice(0, limit) : trades;

  return (
    <Card className="col-span-4 lg:col-span-7">
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Exit</TableHead>
                <TableHead className="text-right">P/L</TableHead>
                <TableHead className="text-center">Result</TableHead>
                {showActions && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTrades.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showActions ? 11 : 10}
                    className="h-24 text-center"
                  >
                    No trades found.
                  </TableCell>
                </TableRow>
              ) : (
                displayTrades.map((trade) => (
                  <TableRow key={trade._id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(trade.tradeDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {trade.asset}
                        {trade.images && trade.images.length > 0 && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trade.tradeType === "buy" ? "default" : "secondary"
                        }
                        className={
                          trade.tradeType === "buy"
                            ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                            : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                        }
                      >
                        {trade.tradeType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {trade.positionSize}
                    </TableCell>
                    <TableCell className="text-right">
                      {trade.entryPrice}
                    </TableCell>
                    <TableCell className="text-right">
                      {trade.exitPrice}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        trade.profitLoss >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {trade.profitLoss >= 0 ? "+" : ""}
                      {trade.profitLoss.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
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
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView?.(trade)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit?.(trade)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onDelete?.(trade._id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
