"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, ScanLine } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { Trade } from "./TradeTable";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tradeToEdit?: Trade | null;
}

interface Strategy {
  _id: string;
  name: string;
}

export default function TradeModal({
  isOpen,
  onClose,
  onSuccess,
  tradeToEdit,
}: TradeModalProps) {
  const [formData, setFormData] = useState({
    asset: "",
    market: "forex",
    tradeType: "buy",
    entryPrice: "",
    exitPrice: "",
    positionSize: "",
    stopLoss: "",
    takeProfit: "",
    tradeDate: new Date().toISOString().split("T")[0],
    notes: "",
    strategy: "",
    images: [] as string[],
  });

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [riskMetrics, setRiskMetrics] = useState({ risk: 0, reward: 0, rr: 0 });

  // Fetch strategies
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const { data } = await api.get("/strategies");
        setStrategies(data);
      } catch (err) {
        console.error("Failed to fetch strategies", err);
      }
    };
    if (isOpen) {
      fetchStrategies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (tradeToEdit) {
      setFormData({
        asset: tradeToEdit.asset,
        market: tradeToEdit.market,
        tradeType: tradeToEdit.tradeType,
        entryPrice: tradeToEdit.entryPrice.toString(),
        exitPrice: tradeToEdit.exitPrice.toString(),
        positionSize: tradeToEdit.positionSize.toString(),
        stopLoss: tradeToEdit.stopLoss?.toString() || "",
        takeProfit: tradeToEdit.takeProfit?.toString() || "",
        tradeDate: new Date(tradeToEdit.tradeDate).toISOString().split("T")[0],
        notes: tradeToEdit.notes || "",
        strategy:
          typeof tradeToEdit.strategy === "object" && tradeToEdit.strategy
            ? (tradeToEdit.strategy as any)._id
            : tradeToEdit.strategy || "",
        images: tradeToEdit.images || [],
      });
      setSelectedFiles([]);
    } else {
      // Reset form
      setFormData({
        asset: "",
        market: "forex",
        tradeType: "buy",
        entryPrice: "",
        exitPrice: "",
        positionSize: "",
        stopLoss: "",
        takeProfit: "",
        tradeDate: new Date().toISOString().split("T")[0],
        notes: "",
        strategy: "",
        images: [],
      });
      setSelectedFiles([]);
    }
  }, [tradeToEdit, isOpen]);

  // Calculate Risk/Reward on the fly
  useEffect(() => {
    const entry = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp = parseFloat(formData.takeProfit);
    const size = parseFloat(formData.positionSize);

    if (!isNaN(entry) && !isNaN(sl) && !isNaN(size)) {
      const risk = Math.abs(entry - sl) * size;
      let reward = 0;
      let rr = 0;

      if (!isNaN(tp)) {
        reward = Math.abs(tp - entry) * size;
        if (risk > 0) rr = reward / risk;
      }
      setRiskMetrics({ risk, reward, rr });
    } else {
      setRiskMetrics({ risk: 0, reward: 0, rr: 0 });
    }
  }, [
    formData.entryPrice,
    formData.stopLoss,
    formData.takeProfit,
    formData.positionSize,
  ]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExtractFromImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setExtracting(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/trades/extract", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const extracted = data.data;
      setFormData((prev) => ({
        ...prev,
        asset: extracted.asset || prev.asset,
        tradeType: extracted.tradeType || prev.tradeType,
        entryPrice: extracted.entryPrice || prev.entryPrice,
        exitPrice: extracted.exitPrice || prev.exitPrice,
        stopLoss: extracted.stopLoss || prev.stopLoss,
        takeProfit: extracted.takeProfit || prev.takeProfit,
      }));

      // Also add the image to the list of selected files to upload
      if (selectedFiles.length + 1 <= 3) {
        setSelectedFiles((prev) => [...prev, file]);
      }

      alert("Trade details extracted! Please verify the data.");
    } catch (err) {
      console.error("Extraction failed", err);
      setError("Failed to extract trade details from image.");
    } finally {
      setExtracting(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + formData.images.length + selectedFiles.length > 3) {
        alert("You can only upload a maximum of 3 images.");
        return;
      }
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imagePaths = [...formData.images];

      if (selectedFiles.length > 0) {
        const uploadData = new FormData();
        selectedFiles.forEach((file) => {
          uploadData.append("images", file);
        });

        setUploading(true);
        try {
          const { data } = await api.post("/upload", uploadData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          imagePaths = [...imagePaths, ...data];
        } catch (err) {
          console.error("Failed to upload images", err);
          throw new Error("Failed to upload images");
        } finally {
          setUploading(false);
        }
      }

      const payload = {
        ...formData,
        entryPrice: parseFloat(formData.entryPrice),
        exitPrice: parseFloat(formData.exitPrice),
        positionSize: parseFloat(formData.positionSize),
        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
        takeProfit: formData.takeProfit
          ? parseFloat(formData.takeProfit)
          : undefined,
        strategy: formData.strategy === "none" ? "" : formData.strategy,
        images: imagePaths,
      };

      if (tradeToEdit) {
        await api.put(`/trades/${tradeToEdit._id}`, payload);
      } else {
        await api.post("/trades", payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(
        err.message || err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const rootUrl = apiUrl.replace(/\/api\/?$/, "");
    return `${rootUrl}${path}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tradeToEdit ? "Edit Trade" : "Add New Trade"}
          </DialogTitle>
          <DialogDescription>
            {tradeToEdit
              ? "Make changes to your trade here."
              : "Enter the details of your trade below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {!tradeToEdit && (
            <div className="mb-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">
                    Auto-fill from Screenshot
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Upload a trade screenshot to automatically extract details.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={extracting}
                >
                  {extracting ? (
                    "Processing..."
                  ) : (
                    <>
                      <ScanLine className="mr-2 h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleExtractFromImage}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset">Asset</Label>
              <Input
                id="asset"
                placeholder="EURUSD"
                value={formData.asset}
                onChange={(e) => handleChange("asset", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market">Market</Label>
              <Select
                value={formData.market}
                onValueChange={(value) => handleChange("market", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="stocks">Stocks</SelectItem>
                  <SelectItem value="indices">Indices</SelectItem>
                  <SelectItem value="commodities">Commodities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tradeType">Type</Label>
              <Select
                value={formData.tradeType}
                onValueChange={(value) => handleChange("tradeType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Long (Buy)</SelectItem>
                  <SelectItem value="sell">Short (Sell)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.tradeDate}
                onChange={(e) => handleChange("tradeDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strategy">Strategy</Label>
            <Select
              value={formData.strategy}
              onValueChange={(value) => handleChange("strategy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Strategy (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Strategy</SelectItem>
                {strategies.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry">Entry Price</Label>
              <Input
                id="entry"
                type="number"
                step="any"
                value={formData.entryPrice}
                onChange={(e) => handleChange("entryPrice", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exit">Exit Price</Label>
              <Input
                id="exit"
                type="number"
                step="any"
                value={formData.exitPrice}
                onChange={(e) => handleChange("exitPrice", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Position Size</Label>
              <Input
                id="size"
                type="number"
                step="any"
                value={formData.positionSize}
                onChange={(e) => handleChange("positionSize", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sl">Stop Loss (Optional)</Label>
              <Input
                id="sl"
                type="number"
                step="any"
                value={formData.stopLoss}
                onChange={(e) => handleChange("stopLoss", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp">Take Profit (Optional)</Label>
              <Input
                id="tp"
                type="number"
                step="any"
                value={formData.takeProfit}
                onChange={(e) => handleChange("takeProfit", e.target.value)}
              />
            </div>
          </div>

          {/* Risk Metrics Display */}
          {riskMetrics.risk > 0 && (
            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg text-xs">
              <div>
                <span className="text-muted-foreground block">Risk</span>
                <span className="text-red-500 font-medium">
                  ${riskMetrics.risk.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Reward</span>
                <span className="text-green-500 font-medium">
                  ${riskMetrics.reward.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">R:R Ratio</span>
                <span className="font-medium">{riskMetrics.rr.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Why did you take this trade?"
            />
          </div>

          <div className="space-y-2">
            <Label>Images (Max 4)</Label>
            <div className="flex flex-wrap gap-4">
              {/* Existing Images */}
              {formData.images.map((img, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative w-20 h-20 border rounded-md overflow-hidden"
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Existing ${index}`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, true)}
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-md hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Selected New Files */}
              {selectedFiles.map((file, index) => (
                <div
                  key={`new-${index}`}
                  className="relative w-20 h-20 border rounded-md overflow-hidden"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New ${index}`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, false)}
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-md hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {formData.images.length + selectedFiles.length < 4 && (
                <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed rounded-md cursor-pointer hover:border-primary">
                  <Upload size={20} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">
                    Upload
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : tradeToEdit
                ? "Update Trade"
                : "Add Trade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
