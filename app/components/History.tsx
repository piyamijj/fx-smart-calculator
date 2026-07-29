"use client";

import React, { useState, useEffect } from "react";
import { getHistory, deleteHistoryEntry, clearHistory, HistoryEntry } from "@/lib/storage";
import { formatDisplayExpression } from "@/lib/calcEngine";
import { Trash2, History } from "lucide-react";

export default function HistoryTab() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    const updated = deleteHistoryEntry(id);
    setHistory(updated);
  };

  const handleClearAll = () => {
    if (confirm("Tüm hesaplama geçmişini silmek istediğinize emin misiniz?")) {
      clearHistory();
      setHistory([]);
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="card max-w-md mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-fx-border pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-fx-orange" />
          <span className="text-fx-orange font-bold text-lg tracking-wider">GEÇMİŞ</span>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 text-xs font-semibold border border-fx-orange/50 text-fx-orange hover:bg-fx-orange hover:text-black rounded-lg transition-all duration-200"
          >
            Tümünü Temizle
          </button>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <History className="w-12 h-12 text-neutral-700 mb-3" />
          <p className="text-fx-text-muted text-sm">Henüz hesaplama geçmişi yok.</p>
          <p className="text-xs text-neutral-600 mt-1">Hesap makinesinde yaptığınız işlemler burada listelenir.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="bg-neutral-900/40 border border-fx-border/60 rounded-xl p-3 flex justify-between items-start gap-3 hover:border-neutral-800 transition-colors duration-150"
            >
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                {/* Expression */}
                <span className="text-fx-text-muted text-xs md:text-sm break-all font-mono">
                  {formatDisplayExpression(entry.expression)}
                </span>
                {/* Result */}
                <span className="text-fx-orange font-bold text-base md:text-lg break-all font-mono">
                  = {entry.result}
                </span>
                {/* Timestamp */}
                <span className="text-[10px] text-neutral-600 mt-1">
                  {formatTime(entry.timestamp)}
                </span>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(entry.id)}
                className="p-1.5 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-150 shrink-0"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}