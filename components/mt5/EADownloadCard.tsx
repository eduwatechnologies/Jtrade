"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EADownloadCard() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const backendOrigin = useMemo(() => apiBase.replace(/\/api\/?$/, ""), [apiBase]);
  const downloadUrl = `${backendOrigin}/downloads/TradingJournalEA.ex5`;

  const handleDownload = () => {
    window.open(downloadUrl, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download MT5 Expert Advisor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          Download the EA and place it in your MT5 Experts folder. Then attach it to a chart.
        </div>
        <Button onClick={handleDownload}>Download EA (.ex5)</Button>
        <div className="text-xs text-muted-foreground">
          Path: File → Open Data Folder → MQL5 → Experts
        </div>
      </CardContent>
    </Card>
  );
}
