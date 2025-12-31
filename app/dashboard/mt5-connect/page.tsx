"use client";

import ApiKeyCard from "@/components/mt5/ApiKeyCard";
import EADownloadCard from "@/components/mt5/EADownloadCard";
import SyncStatusIndicator from "@/components/mt5/SyncStatusIndicator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MT5ConnectPage() {
  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connect MetaTrader 5</h1>
          <p className="text-muted-foreground mt-1">
            Sync your trades automatically using our secure Expert Advisor.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Actions */}
        <div className="space-y-6">
          <ApiKeyCard />
          <EADownloadCard />
        </div>

        {/* Right Column: Status & Guide */}
        <div className="space-y-6">
          <SyncStatusIndicator />

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Installation Guide</h3>
            <ol className="space-y-4 text-sm text-muted-foreground list-decimal pl-4">
              <li className="pl-2">
                <span className="font-medium text-foreground">Download the EA</span>
                <p>Click the download button to get the <code className="bg-muted px-1 rounded">TradingJournalEA.ex5</code> file.</p>
              </li>
              <li className="pl-2">
                <span className="font-medium text-foreground">Open Data Folder</span>
                <p>In MT5, go to <strong>File &gt; Open Data Folder</strong>.</p>
              </li>
              <li className="pl-2">
                <span className="font-medium text-foreground">Install EA</span>
                <p>Navigate to <strong>MQL5 &gt; Experts</strong> and paste the file there.</p>
              </li>
              <li className="pl-2">
                <span className="font-medium text-foreground">Allow WebRequest</span>
                <p>In MT5, go to <strong>Tools &gt; Options &gt; Expert Advisors</strong>.</p>
                <p>Check "Allow WebRequest for listed URL" and add:</p>
                <code className="block mt-1 bg-muted p-2 rounded text-xs break-all select-all">
                  {process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://jtradebackend-production.up.railway.app'}
                </code>
              </li>
              <li className="pl-2">
                <span className="font-medium text-foreground">Activate</span>
                <p>Refresh the Navigator panel, drag the EA to any chart, and enter your API Key in the inputs.</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
