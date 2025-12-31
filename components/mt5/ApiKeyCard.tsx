"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ApiKeyCard() {
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy");

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get("/mt5/api-key/status");
      setHasKey(res.data.hasKey);
      setCreatedAt(res.data.createdAt);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const regenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/mt5/api-key/regenerate");
      setApiKey(res.data.apiKey);
      setHasKey(true);
      setCreatedAt(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopyLabel("Copied");
      setTimeout(() => setCopyLabel("Copy"), 1500);
    } catch {}
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>MT5 API Key</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!loading && (
          <>
            {apiKey ? (
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 rounded bg-muted">{apiKey}</code>
                <Button variant="secondary" onClick={copy}>{copyLabel}</Button>
              </div>
            ) : hasKey ? (
              <div className="text-sm text-muted-foreground">
                An API key exists. For security reasons it cannot be displayed again.
                Click regenerate to get a new key. Created:{" "}
                {createdAt ? new Date(createdAt).toLocaleString() : "Unknown"}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No API key yet. Generate one to connect your MT5 EA.
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={regenerate} disabled={loading}>
                {hasKey ? "Regenerate API Key" : "Generate API Key"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep this key private. The EA uses it to authenticate. It is shown only once after regeneration.
            </p>
          </>
        )}
        {loading && <div className="text-sm">Loading...</div>}
      </CardContent>
    </Card>
  );
}
