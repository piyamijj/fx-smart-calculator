"use client";

import React, { useState } from "react";
import Graph2D from "./Graph2D";
import Graph3D from "./Graph3D";
import { LineChart, Box } from "lucide-react";

export default function GraphTab() {
  const [mode, setMode] = useState<"2d" | "3d">("2d");

  return (
    <div className="card max-w-2xl mx-auto flex flex-col gap-4">
      {/* Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-fx-border pb-3">
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-fx-orange" />
          <span className="text-fx-orange font-bold text-lg tracking-wider">GRAFİK</span>
        </div>

        {/* Segmented Control */}
        <div className="flex bg-neutral-900 p-1 rounded-lg border border-fx-border self-start sm:self-auto">
          <button
            onClick={() => setMode("2d")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all duration-150 ${
              mode === "2d"
                ? "bg-fx-orange text-black shadow-sm"
                : "text-fx-text-muted hover:text-fx-text"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            2D Grafik
          </button>
          <button
            onClick={() => setMode("3d")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all duration-150 ${
              mode === "3d"
                ? "bg-fx-orange text-black shadow-sm"
                : "text-fx-text-muted hover:text-fx-text"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            3D Yüzey
          </button>
        </div>
      </div>

      {/* Render Sub-Component */}
      <div className="mt-1">
        {mode === "2d" ? <Graph2D /> : <Graph3D />}
      </div>
    </div>
  );
}