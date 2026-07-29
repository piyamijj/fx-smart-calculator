"use client";

import React, { useState, useEffect } from "react";
import { getMemoryVars, setMemoryVar, clearMemoryVars, MemoryVars } from "@/lib/storage";
import { Database, RotateCcw, Check } from "lucide-react";

export default function MemoryTab() {
  const [memory, setMemory] = useState<MemoryVars>({
    A: 0,
    B: 0,
    C: 0,
    M: 0,
    Ans: 0,
  });
  const [editValues, setEditValues] = useState<Record<string, string>>({
    A: "",
    B: "",
    C: "",
    M: "",
    Ans: "",
  });

  useEffect(() => {
    setMemory(getMemoryVars());
  }, []);

  const handleResetSlot = (key: keyof MemoryVars) => {
    const updated = setMemoryVar(key, 0);
    setMemory(updated);
    setEditValues((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSaveSlot = (key: keyof MemoryVars) => {
    const valStr = editValues[key];
    const numVal = Number(valStr);
    if (valStr.trim() === "" || isNaN(numVal)) {
      alert("Lütfen geçerli bir sayı girin.");
      return;
    }
    const updated = setMemoryVar(key, numVal);
    setMemory(updated);
    setEditValues((prev) => ({ ...prev, [key]: "" }));
  };

  const handleResetAll = () => {
    if (confirm("Tüm hafıza değişkenlerini sıfırlamak istediğinize emin misiniz?")) {
      const cleared = clearMemoryVars();
      setMemory(cleared);
      setEditValues({ A: "", B: "", C: "", M: "", Ans: "" });
    }
  };

  const isAllZero = () => {
    return Object.values(memory).every((val) => val === 0);
  };

  const slots: (keyof MemoryVars)[] = ["A", "B", "C", "M", "Ans"];

  return (
    <div className="card max-w-md mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-fx-border pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-fx-orange" />
          <span className="text-fx-orange font-bold text-lg tracking-wider">HAFIZA</span>
        </div>
        {!isAllZero() && (
          <button
            onClick={handleResetAll}
            className="px-3 py-1.5 text-xs font-semibold border border-fx-orange/50 text-fx-orange hover:bg-fx-orange hover:text-black rounded-lg transition-all duration-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Tümünü Sıfırla
          </button>
        )}
      </div>

      {/* Empty State Concept from Reference App */}
      {isAllZero() && (
        <div className="bg-neutral-900/30 border border-dashed border-fx-border rounded-xl p-4 text-center text-xs text-fx-text-muted">
          <p className="font-semibold text-fx-orange/80 mb-1">Kayıtlı Hafıza Bulunmadı</p>
          <p className="text-[10px] text-neutral-600">Tüm değişkenler şu anda sıfır (0) değerindedir.</p>
        </div>
      )}

      {/* Memory Slots List */}
      <div className="flex flex-col gap-3">
        {slots.map((slot) => (
          <div
            key={slot}
            className="bg-neutral-900/40 border border-fx-border/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-800 transition-colors duration-150"
          >
            {/* Slot Name & Value */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-fx-border flex items-center justify-center text-fx-orange font-bold text-lg shrink-0">
                {slot}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-fx-text-muted font-semibold">Değer</span>
                <span className="text-base font-bold text-fx-text break-all font-mono">
                  {memory[slot]}
                </span>
              </div>
            </div>

            {/* Edit & Reset Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-black border border-fx-border rounded-lg overflow-hidden h-8">
                <input
                  type="text"
                  placeholder="Yeni değer"
                  value={editValues[slot]}
                  onChange={(e) =>
                    setEditValues((prev) => ({ ...prev, [slot]: e.target.value }))
                  }
                  className="bg-transparent text-xs text-fx-text px-2 py-1 w-20 focus:outline-none font-mono"
                />
                <button
                  onClick={() => handleSaveSlot(slot)}
                  className="bg-neutral-900 hover:bg-fx-orange hover:text-black text-fx-orange border-l border-fx-border px-2 h-full flex items-center justify-center transition-colors duration-150"
                  title="Ayarla"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>

              {memory[slot] !== 0 && (
                <button
                  onClick={() => handleResetSlot(slot)}
                  className="p-1.5 text-neutral-600 hover:text-fx-orange hover:bg-neutral-900 rounded-lg border border-transparent hover:border-fx-border transition-all duration-150"
                  title="Sıfırla"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Caption */}
      <div className="text-[10px] text-neutral-600 text-center mt-2">
        Hafıza değerleri tarayıcınızda yerel olarak saklanır ve oturumlar arasında korunur.
      </div>
    </div>
  );
}