"use client";

import React, { useState, useEffect, useRef } from "react";
import { compileFunction } from "@/lib/calcEngine";
import { loadPlotly } from "@/lib/plotlyLoader";
import { Box, Play, AlertCircle } from "lucide-react";

export default function Graph3D() {
  const [expression, setExpression] = useState<string>("sin(sqrt(x^2 + y^2))");
  const [xMin, setXMin] = useState<number>(-5);
  const [xMax, setXMax] = useState<number>(5);
  const [yMin, setYMin] = useState<number>(-5);
  const [yMax, setYMax] = useState<number>(5);
  const [error, setError] = useState<string>("");
  const [plotlyLoaded, setPlotlyLoaded] = useState<boolean>(false);
  const [plotTrigger, setPlotTrigger] = useState<number>(0);

  const plotDivRef = useRef<HTMLDivElement>(null);
  const plotlyRef = useRef<any>(null);

  // Load Plotly on mount
  useEffect(() => {
    loadPlotly().then((Plotly) => {
      if (Plotly) {
        plotlyRef.current = Plotly;
        setPlotlyLoaded(true);
      }
    });

    return () => {
      if (plotlyRef.current && plotDivRef.current) {
        plotlyRef.current.purge(plotDivRef.current);
      }
    };
  }, []);

  // Render 3D surface plot
  useEffect(() => {
    if (!plotlyLoaded || !plotlyRef.current || !plotDivRef.current) return;

    const Plotly = plotlyRef.current;
    setError("");

    try {
      const compiled = compileFunction(expression);
      const steps = 40; // 40x40 grid is optimal for performance and detail
      const xStep = (xMax - xMin) / steps;
      const yStep = (yMax - yMin) / steps;

      const xValues: number[] = [];
      const yValues: number[] = [];
      const zMatrix: (number | null)[][] = [];

      // Generate 1D coordinate arrays
      for (let i = 0; i <= steps; i++) {
        xValues.push(xMin + i * xStep);
        yValues.push(yMin + i * yStep);
      }

      // Generate 2D Z matrix
      for (let j = 0; j <= steps; j++) {
        const y = yValues[j];
        const row: (number | null)[] = [];
        for (let i = 0; i <= steps; i++) {
          const x = xValues[i];
          try {
            const z = compiled({ x, y });
            if (isNaN(z) || !isFinite(z) || Math.abs(z) > 1e6) {
              row.push(null);
            } else {
              row.push(z);
            }
          } catch (e) {
            row.push(null);
          }
        }
        zMatrix.push(row);
      }

      const trace = {
        type: "surface",
        x: xValues,
        y: yValues,
        z: zMatrix,
        colorscale: [
          [0, "#121212"],
          [0.3, "#7c2d12"],
          [0.7, "#c2410c"],
          [1, "#f97316"],
        ],
        showscale: true,
        colorbar: {
          thickness: 10,
          len: 0.6,
          tickfont: { size: 10, color: "#a3a3a3" },
        },
      };

      const layout = {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
          family: "ui-monospace, monospace",
          color: "#a3a3a3",
        },
        scene: {
          xaxis: {
            title: "X",
            gridcolor: "#262626",
            backgroundcolor: "#0a0a0a",
            showbackground: true,
            zerolinecolor: "#404040",
          },
          yaxis: {
            title: "Y",
            gridcolor: "#262626",
            backgroundcolor: "#0a0a0a",
            showbackground: true,
            zerolinecolor: "#404040",
          },
          zaxis: {
            title: "Z",
            gridcolor: "#262626",
            backgroundcolor: "#0a0a0a",
            showbackground: true,
            zerolinecolor: "#404040",
          },
          camera: {
            eye: { x: 1.5, y: 1.5, z: 1.2 },
          },
        },
        margin: { l: 0, r: 0, t: 0, b: 0 },
        autosize: true,
      };

      const config = {
        responsive: true,
        displayModeBar: false,
      };

      Plotly.react(plotDivRef.current, [trace], layout, config);
    } catch (err: any) {
      console.error("3D Plotting Error:", err);
      setError("Yüzey çizilemedi: geçersiz veya çok karmaşık ifade.");
    }
  }, [plotlyLoaded, plotTrigger]);

  const handlePlot = () => {
    setPlotTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Expression Input */}
      <div className="flex items-center gap-2 bg-neutral-900/40 border border-fx-border/60 rounded-xl p-2">
        <span className="text-xs text-fx-text-muted font-semibold shrink-0">
          z = f(x, y) =
        </span>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="Örn: sin(sqrt(x^2 + y^2))"
          className="bg-transparent text-sm text-fx-text font-mono focus:outline-none flex-1 min-w-0"
        />
        <button
          onClick={handlePlot}
          className="px-3 py-1.5 text-xs font-semibold bg-fx-orange text-black hover:bg-fx-orange-light rounded-lg flex items-center gap-1 transition-all duration-150 shrink-0"
        >
          <Play className="w-3 h-3 fill-current" />
          Çiz
        </button>
      </div>

      {/* Bounds Grid */}
      <div className="grid grid-cols-4 gap-2 bg-neutral-900/20 border border-fx-border/50 rounded-xl p-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-fx-text-muted font-semibold">X Min</label>
          <input
            type="number"
            value={xMin}
            onChange={(e) => setXMin(Number(e.target.value))}
            className="bg-black border border-fx-border rounded-lg px-2 py-1 text-xs text-fx-text font-mono focus:outline-none focus:border-fx-orange"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-fx-text-muted font-semibold">X Max</label>
          <input
            type="number"
            value={xMax}
            onChange={(e) => setXMax(Number(e.target.value))}
            className="bg-black border border-fx-border rounded-lg px-2 py-1 text-xs text-fx-text font-mono focus:outline-none focus:border-fx-orange"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-fx-text-muted font-semibold">Y Min</label>
          <input
            type="number"
            value={yMin}
            onChange={(e) => setYMin(Number(e.target.value))}
            className="bg-black border border-fx-border rounded-lg px-2 py-1 text-xs text-fx-text font-mono focus:outline-none focus:border-fx-orange"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-fx-text-muted font-semibold">Y Max</label>
          <input
            type="number"
            value={yMax}
            onChange={(e) => setYMax(Number(e.target.value))}
            className="bg-black border border-fx-border rounded-lg px-2 py-1 text-xs text-fx-text font-mono focus:outline-none focus:border-fx-orange"
          />
        </div>
      </div>

      {/* Plot Canvas */}
      <div className="bg-black border border-fx-border rounded-xl p-2 relative overflow-hidden">
        {!plotlyLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <Box className="w-8 h-8 text-fx-orange animate-pulse" />
              <span className="text-xs text-fx-text-muted">3D Grafik motoru yükleniyor...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-x-4 top-4 flex items-center gap-2 bg-red-950/80 border border-red-800 text-red-200 px-3 py-2 rounded-lg text-xs z-10">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={plotDivRef} className="w-full h-80 md:h-[420px]" />
      </div>
    </div>
  );
}