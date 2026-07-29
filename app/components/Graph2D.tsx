"use client";

import React, { useState, useEffect, useRef } from "react";
import { compileFunction, derivative } from "@/lib/calcEngine";
import {
  saveGraphSet,
  getGraphSets,
  deleteGraphSet,
  SavedFunction,
  GraphFunctionSet,
} from "@/lib/storage";
import { loadPlotly } from "@/lib/plotlyLoader";
import { Plus, Trash2, Eye, EyeOff, Save, LineChart, FolderOpen, X } from "lucide-react";

const COLOR_PALETTE = [
  "#f97316", // Orange
  "#3b82f6", // Blue
  "#10b981", // Green
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

export default function Graph2D() {
  const [functions, setFunctions] = useState<SavedFunction[]>([
    { id: "1", expr: "sin(x)", color: COLOR_PALETTE[0], visible: true },
  ]);
  const [xMin, setXMin] = useState<number>(-10);
  const [xMax, setXMax] = useState<number>(10);
  const [showDerivative, setShowDerivative] = useState<boolean>(false);
  const [showIntegral, setShowIntegral] = useState<boolean>(false);
  const [plotlyLoaded, setPlotlyLoaded] = useState<boolean>(false);
  const [savedSets, setSavedSets] = useState<GraphFunctionSet[]>([]);
  const [showSavedSets, setShowSavedSets] = useState<boolean>(false);

  const plotDivRef = useRef<HTMLDivElement>(null);
  const plotlyRef = useRef<any>(null);

  // Load previously saved graph sets on mount
  useEffect(() => {
    setSavedSets(getGraphSets());
  }, []);

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

  // Render plot when functions, bounds, or toggles change
  useEffect(() => {
    if (!plotlyLoaded || !plotlyRef.current || !plotDivRef.current) return;

    const Plotly = plotlyRef.current;
    const traces: any[] = [];

    // Generate points for each visible function
    functions.forEach((fn) => {
      if (!fn.visible || !fn.expr.trim()) return;

      try {
        const compiled = compileFunction(fn.expr);
        const xValues: number[] = [];
        const yValues: (number | null)[] = [];
        const steps = 300;
        const stepSize = (xMax - xMin) / steps;

        // 1. Main Function Curve
        for (let i = 0; i <= steps; i++) {
          const x = xMin + i * stepSize;
          xValues.push(x);
          try {
            const y = compiled({ x });
            if (isNaN(y) || !isFinite(y) || Math.abs(y) > 1e6) {
              yValues.push(null); // Create gap for asymptotes
            } else {
              yValues.push(y);
            }
          } catch (e) {
            yValues.push(null);
          }
        }

        traces.push({
          x: xValues,
          y: yValues,
          type: "scatter",
          mode: "lines",
          name: `f(x) = ${fn.expr}`,
          line: { color: fn.color, width: 3 },
        });

        // 2. Derivative Curve Overlay
        if (showDerivative) {
          const derivExpr = derivative(fn.expr, "x");
          if (derivExpr) {
            const compiledDeriv = compileFunction(derivExpr);
            const yDerivValues: (number | null)[] = [];

            for (let i = 0; i <= steps; i++) {
              const x = xMin + i * stepSize;
              try {
                const y = compiledDeriv({ x });
                if (isNaN(y) || !isFinite(y) || Math.abs(y) > 1e6) {
                  yDerivValues.push(null);
                } else {
                  yDerivValues.push(y);
                }
              } catch (e) {
                yDerivValues.push(null);
              }
            }

            traces.push({
              x: xValues,
              y: yDerivValues,
              type: "scatter",
              mode: "lines",
              name: `f'(x) [${fn.expr}]`,
              line: { color: fn.color, width: 1.5, dash: "dash" },
            });
          }
        }

        // 3. Cumulative Integral Curve Overlay
        if (showIntegral) {
          const yIntegValues: (number | null)[] = [];
          
          // Pre-calculate function values for integration to avoid nested loops
          const rawY: number[] = [];
          const rawX: number[] = [];
          for (let i = 0; i <= steps; i++) {
            const x = xMin + i * stepSize;
            rawX.push(x);
            try {
              const y = compiled({ x });
              rawY.push(isNaN(y) || !isFinite(y) ? 0 : y);
            } catch (e) {
              rawY.push(0);
            }
          }

          // Cumulative trapezoidal integration
          let runningIntegral = 0;
          yIntegValues.push(0); // Integral at xMin is 0

          for (let i = 1; i <= steps; i++) {
            const h = stepSize;
            runningIntegral += (h / 2) * (rawY[i - 1] + rawY[i]);
            if (isNaN(runningIntegral) || !isFinite(runningIntegral) || Math.abs(runningIntegral) > 1e6) {
              yIntegValues.push(null);
            } else {
              yIntegValues.push(runningIntegral);
            }
          }

          traces.push({
            x: xValues,
            y: yIntegValues,
            type: "scatter",
            mode: "lines",
            name: `∫f(x)dx [${fn.expr}]`,
            line: { color: fn.color, width: 1.5, dash: "dot" },
          });
        }
      } catch (err) {
        console.error(`Error plotting function: ${fn.expr}`, err);
      }
    });

    const layout = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: {
        family: "ui-monospace, monospace",
        color: "#a3a3a3",
      },
      xaxis: {
        gridcolor: "#262626",
        zerolinecolor: "#404040",
        linecolor: "#262626",
        range: [xMin, xMax],
      },
      yaxis: {
        gridcolor: "#262626",
        zerolinecolor: "#404040",
        linecolor: "#262626",
        autorange: true,
      },
      legend: {
        orientation: "h",
        yanchor: "bottom",
        y: 1.02,
        xanchor: "right",
        x: 1,
        font: { size: 10 },
      },
      margin: { l: 30, r: 10, t: 40, b: 30 },
      hovermode: "closest",
    };

    const config = {
      responsive: true,
      displayModeBar: false,
    };

    Plotly.react(plotDivRef.current, traces, layout, config);
  }, [functions, xMin, xMax, showDerivative, showIntegral, plotlyLoaded]);

  const handleAddFunction = () => {
    if (functions.length >= 6) {
      alert("En fazla 6 fonksiyon ekleyebilirsiniz.");
      return;
    }
    const nextColor = COLOR_PALETTE[functions.length % COLOR_PALETTE.length];
    const newFn: SavedFunction = {
      id: Date.now().toString(),
      expr: "",
      color: nextColor,
      visible: true,
    };
    setFunctions([...functions, newFn]);
  };

  const handleRemoveFunction = (id: string) => {
    if (functions.length === 1) {
      setFunctions([{ id: "1", expr: "", color: COLOR_PALETTE[0], visible: true }]);
      return;
    }
    setFunctions(functions.filter((fn) => fn.id !== id));
  };

  const handleFunctionChange = (id: string, val: string) => {
    setFunctions(
      functions.map((fn) => (fn.id === id ? { ...fn, expr: val } : fn))
    );
  };

  const handleToggleVisibility = (id: string) => {
    setFunctions(
      functions.map((fn) => (fn.id === id ? { ...fn, visible: !fn.visible } : fn))
    );
  };

  const handleSaveSet = () => {
    const name = window.prompt("Bu grafik seti için bir isim girin:", "Grafik Seti 1");
    if (!name) return;
    const updated = saveGraphSet(name, functions, xMin, xMax);
    setSavedSets(updated);
    alert("Grafik seti başarıyla kaydedildi!");
  };

  const handleLoadSet = (set: GraphFunctionSet) => {
    setFunctions(set.functions);
    setXMin(set.xMin);
    setXMax(set.xMax);
    setShowSavedSets(false);
  };

  const handleDeleteSet = (id: string) => {
    const updated = deleteGraphSet(id);
    setSavedSets(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Function Inputs List */}
      <div className="flex flex-col gap-2">
        {functions.map((fn, idx) => (
          <div key={fn.id} className="flex items-center gap-2 bg-neutral-900/40 border border-fx-border/60 rounded-xl p-2">
            {/* Color Dot */}
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: fn.color }}
            />
            
            {/* Label */}
            <span className="text-xs text-fx-text-muted font-semibold shrink-0">
              f{idx + 1}(x) =
            </span>

            {/* Input */}
            <input
              type="text"
              value={fn.expr}
              onChange={(e) => handleFunctionChange(fn.id, e.target.value)}
              placeholder="Örn: x^2 - 4"
              className="bg-transparent text-sm text-fx-text font-mono focus:outline-none flex-1 min-w-0"
            />

            {/* Visibility Toggle */}
            <button
              onClick={() => handleToggleVisibility(fn.id)}
              className="p-1.5 text-neutral-500 hover:text-fx-orange transition-colors duration-150"
              title={fn.visible ? "Gizle" : "Göster"}
            >
              {fn.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Delete Button */}
            <button
              onClick={() => handleRemoveFunction(fn.id)}
              className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors duration-150"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <button
          onClick={handleAddFunction}
          className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 border border-fx-border hover:border-fx-orange text-fx-orange rounded-lg flex items-center gap-1 transition-all duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
          Fonksiyon Ekle
        </button>

        <button
          onClick={handleSaveSet}
          className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 border border-fx-border hover:border-fx-orange text-fx-orange rounded-lg flex items-center gap-1 transition-all duration-150"
        >
          <Save className="w-3.5 h-3.5" />
          Seti Kaydet
        </button>

        <button
          onClick={() => setShowSavedSets((prev) => !prev)}
          className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 border border-fx-border hover:border-fx-orange text-fx-orange rounded-lg flex items-center gap-1 transition-all duration-150"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Kayıtlı Setler ({savedSets.length})
        </button>
      </div>

      {/* Saved Graph Sets Panel */}
      {showSavedSets && (
        <div className="bg-neutral-900/30 border border-fx-border/60 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-fx-text-muted font-semibold">Kayıtlı Grafik Setleri</span>
            <button
              onClick={() => setShowSavedSets(false)}
              className="p-1 text-neutral-500 hover:text-fx-text transition-colors duration-150"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {savedSets.length === 0 ? (
            <p className="text-[11px] text-neutral-600 text-center py-3">
              Henüz kaydedilmiş bir grafik seti yok.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {savedSets.map((set) => (
                <div
                  key={set.id}
                  className="flex items-center justify-between gap-2 bg-black/40 border border-fx-border/50 rounded-lg px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-fx-text font-semibold truncate">{set.name}</p>
                    <p className="text-[10px] text-neutral-600">
                      {set.functions.length} fonksiyon · [{set.xMin}, {set.xMax}]
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleLoadSet(set)}
                      className="px-2 py-1 text-[10px] font-bold bg-fx-orange text-black rounded-md hover:bg-fx-orange-light transition-colors duration-150"
                    >
                      Yükle
                    </button>
                    <button
                      onClick={() => handleDeleteSet(set.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors duration-150"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Domain Bounds & Overlays */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-900/20 border border-fx-border/50 rounded-xl p-3">
        {/* X Min */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-fx-text-muted font-semibold">X Min</label>
          <input
            type="number"
            value={xMin}
            onChange={(e) => setXMin(Number(e.target.value))}
            className="bg-black border border-fx-border rounded-lg px-2 py-1 text-xs text-fx-text font-mono focus:outline-none focus:border-fx-orange"
          />
        </div>

        {/* X Max */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-fx-text-muted font-semibold">X Max</label>
          <input
            type="number"
            value={xMax}
            onChange={(e) => setXMax(Number(e.target.value))}
            className="bg-black border border-fx-border rounded-lg px-2 py-1 text-xs text-fx-text font-mono focus:outline-none focus:border-fx-orange"
          />
        </div>

        {/* Derivative Overlay Toggle */}
        <div className="flex items-center gap-2 h-full pt-4">
          <input
            type="checkbox"
            id="deriv-toggle"
            checked={showDerivative}
            onChange={(e) => setShowDerivative(e.target.checked)}
            className="rounded border-fx-border text-fx-orange focus:ring-fx-orange bg-black w-4 h-4 cursor-pointer"
          />
          <label htmlFor="deriv-toggle" className="text-xs text-fx-text-muted font-semibold cursor-pointer select-none">
            Türev (f&apos;(x))
          </label>
        </div>

        {/* Integral Overlay Toggle */}
        <div className="flex items-center gap-2 h-full pt-4">
          <input
            type="checkbox"
            id="integ-toggle"
            checked={showIntegral}
            onChange={(e) => setShowIntegral(e.target.checked)}
            className="rounded border-fx-border text-fx-orange focus:ring-fx-orange bg-black w-4 h-4 cursor-pointer"
          />
          <label htmlFor="integ-toggle" className="text-xs text-fx-text-muted font-semibold cursor-pointer select-none">
            İntegral (∫f)
          </label>
        </div>
      </div>

      {/* Plot Canvas */}
      <div className="bg-black border border-fx-border rounded-xl p-2 relative overflow-hidden">
        {!plotlyLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <LineChart className="w-8 h-8 text-fx-orange animate-pulse" />
              <span className="text-xs text-fx-text-muted">Grafik motoru yükleniyor...</span>
            </div>
          </div>
        )}
        <div ref={plotDivRef} className="w-full h-80 md:h-96" />
      </div>
    </div>
  );
}