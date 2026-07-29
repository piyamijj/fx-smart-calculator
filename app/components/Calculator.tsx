"use client";

import React, { useState, useEffect } from "react";
import {
  evaluateExpression,
  formatDisplayExpression,
} from "@/lib/calcEngine";
import {
  getMemoryVars,
  setMemoryVar,
  addHistoryEntry,
  MemoryVars,
} from "@/lib/storage";

export default function Calculator() {
  const [expression, setExpression] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [angleMode, setAngleMode] = useState<"DEG" | "RAD">("DEG");
  const [memory, setMemory] = useState<MemoryVars>({
    A: 0,
    B: 0,
    C: 0,
    M: 0,
    Ans: 0,
  });
  const [stoMode, setStoMode] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Load memory variables on mount
  useEffect(() => {
    setMemory(getMemoryVars());
  }, []);

  // Live preview evaluation
  useEffect(() => {
    if (!expression) {
      setPreview("");
      return;
    }
    // Don't evaluate if expression ends with an operator to avoid noisy errors
    if (/[+\-*/÷×(]$/.test(expression)) {
      return;
    }
    const evalRes = evaluateExpression(expression, angleMode, memory);
    if (!evalRes.error && typeof evalRes.result === "number") {
      setPreview(String(evalRes.result));
    } else {
      setPreview("");
    }
  }, [expression, angleMode, memory]);

  const handleKeyPress = (val: string) => {
    setMessage("");
    setExpression((prev) => prev + val);
  };

  const handleAc = () => {
    setExpression("");
    setResult("");
    setPreview("");
    setStoMode(false);
    setMessage("");
  };

  const handleDel = () => {
    setMessage("");
    setExpression((prev) => {
      if (prev.length === 0) return prev;
      
      // Check for multi-character functions to delete them as a single unit
      const functions = [
        "asin(", "acos(", "atan(", "sin(", "cos(", "tan(", "log(", "ln(", "sqrt(", "mod("
      ];
      for (const fn of functions) {
        if (prev.endsWith(fn)) {
          return prev.slice(0, -fn.length);
        }
      }
      return prev.slice(0, -1);
    });
  };

  const handleEvaluate = () => {
    if (!expression) return;
    const evalRes = evaluateExpression(expression, angleMode, memory);
    if (evalRes.error) {
      setResult(evalRes.error);
      setPreview("");
    } else {
      const finalResult = String(evalRes.result);
      setResult(finalResult);
      setPreview("");
      
      // Save to Ans variable and localStorage
      const updatedMemory = setMemoryVar("Ans", Number(evalRes.result));
      setMemory(updatedMemory);

      // Save to history
      addHistoryEntry(expression, finalResult);
    }
  };

  const handleStoToggle = () => {
    setStoMode((prev) => !prev);
    if (!stoMode) {
      setMessage("Hafıza Seçin (A, B, C, M)");
    } else {
      setMessage("");
    }
  };

  const handleMemoryPress = (varName: keyof MemoryVars) => {
    if (stoMode) {
      // Store current result or preview into variable
      const valueToStore = result && !isNaN(Number(result)) 
        ? Number(result) 
        : (preview && !isNaN(Number(preview)) ? Number(preview) : 0);
      
      const updatedMemory = setMemoryVar(varName, valueToStore);
      setMemory(updatedMemory);
      setStoMode(false);
      setMessage(`${varName} Hafızasına Kaydedildi: ${valueToStore}`);
    } else {
      // Insert variable into expression
      handleKeyPress(varName);
    }
  };

  const toggleAngleMode = () => {
    setAngleMode((prev) => (prev === "DEG" ? "RAD" : "DEG"));
  };

  return (
    <div className="card max-w-md mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-fx-border pb-2">
        <div className="flex flex-col">
          <span className="text-fx-orange font-bold text-lg tracking-wider">fx-SMART</span>
          <span className="text-[10px] text-fx-text-muted font-mono">SMART-CALC fx-991</span>
        </div>
        <div className="flex gap-1 bg-neutral-900 p-1 rounded-lg border border-fx-border">
          <button
            onClick={() => setAngleMode("DEG")}
            className={`px-2 py-1 text-xs font-bold rounded ${
              angleMode === "DEG"
                ? "bg-fx-orange text-black"
                : "text-fx-text-muted hover:text-fx-text"
            }`}
          >
            DEG
          </button>
          <button
            onClick={() => setAngleMode("RAD")}
            className={`px-2 py-1 text-xs font-bold rounded ${
              angleMode === "RAD"
                ? "bg-fx-orange text-black"
                : "text-fx-text-muted hover:text-fx-text"
            }`}
          >
            RAD
          </button>
        </div>
      </div>

      {/* Display Screen */}
      <div className="bg-black border border-fx-border rounded-xl p-4 flex flex-col justify-between min-h-[100px] text-right font-mono relative overflow-hidden">
        {/* Top Line: Expression */}
        <div className="text-fx-text-muted text-sm md:text-base break-all min-h-[24px]">
          {formatDisplayExpression(expression)}
        </div>
        
        {/* Bottom Line: Result / Preview */}
        <div className="flex flex-col items-end justify-end mt-2">
          {preview && (
            <span className="text-xs text-neutral-500 font-semibold">
              Önizleme: {preview}
            </span>
          )}
          <span className="text-xl md:text-2xl font-bold text-fx-orange break-all">
            {result || "0"}
          </span>
        </div>

        {/* Status Message Overlay */}
        {message && (
          <div className="absolute top-1 left-2 text-[10px] text-fx-orange animate-pulse">
            {message}
          </div>
        )}
      </div>

      {/* Memory Indicators */}
      <div className="flex flex-wrap gap-2 text-[10px] text-fx-text-muted font-mono bg-neutral-900/50 p-2 rounded-lg border border-fx-border/50">
        <span className="text-fx-orange font-semibold">Hafıza:</span>
        <span>A: {memory.A}</span>
        <span>B: {memory.B}</span>
        <span>C: {memory.C}</span>
        <span>M: {memory.M}</span>
        <span>Ans: {memory.Ans}</span>
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-5 gap-2">
        {/* Row 1: Memory & STO */}
        <button
          onClick={handleStoToggle}
          className={`h-11 ${stoMode ? "key-btn-orange" : "key-btn-accent"}`}
        >
          STO
        </button>
        <button onClick={() => handleMemoryPress("A")} className="h-11 key-btn-accent">A</button>
        <button onClick={() => handleMemoryPress("B")} className="h-11 key-btn-accent">B</button>
        <button onClick={() => handleMemoryPress("C")} className="h-11 key-btn-accent">C</button>
        <button onClick={() => handleMemoryPress("M")} className="h-11 key-btn-accent">M</button>

        {/* Row 2: Trig & Clear */}
        <button onClick={() => handleKeyPress("sin(")} className="h-11 key-btn-accent">sin</button>
        <button onClick={() => handleKeyPress("cos(")} className="h-11 key-btn-accent">cos</button>
        <button onClick={() => handleKeyPress("tan(")} className="h-11 key-btn-accent">tan</button>
        <button onClick={toggleAngleMode} className="h-11 key-btn-accent text-xs">D/R</button>
        <button onClick={handleAc} className="h-11 key-btn-orange font-bold">AC</button>

        {/* Row 3: Inverse Trig & Parentheses */}
        <button onClick={() => handleKeyPress("asin(")} className="h-11 key-btn-accent text-xs">sin⁻¹</button>
        <button onClick={() => handleKeyPress("acos(")} className="h-11 key-btn-accent text-xs">cos⁻¹</button>
        <button onClick={() => handleKeyPress("atan(")} className="h-11 key-btn-accent text-xs">tan⁻¹</button>
        <button onClick={() => handleKeyPress("(")} className="h-11 key-btn-accent">(</button>
        <button onClick={() => handleKeyPress(")")} className="h-11 key-btn-accent">)</button>

        {/* Row 4: Powers & Constants */}
        <button onClick={() => handleKeyPress("²")} className="h-11 key-btn-accent">x²</button>
        <button onClick={() => handleKeyPress("sqrt(")} className="h-11 key-btn-accent">√</button>
        <button onClick={() => handleKeyPress("π")} className="h-11 key-btn-accent">π</button>
        <button onClick={() => handleKeyPress("e")} className="h-11 key-btn-accent">e</button>
        <button onClick={() => handleKeyPress(" mod ")} className="h-11 key-btn-accent text-xs">mod</button>

        {/* Row 5: Digits 7-9 */}
        <button onClick={() => handleKeyPress("7")} className="h-11 key-btn-dark">7</button>
        <button onClick={() => handleKeyPress("8")} className="h-11 key-btn-dark">8</button>
        <button onClick={() => handleKeyPress("9")} className="h-11 key-btn-dark">9</button>
        <button onClick={() => handleKeyPress("÷")} className="h-11 key-btn-accent text-lg">÷</button>
        <button onClick={handleDel} className="h-11 key-btn-orange font-bold">DEL</button>

        {/* Row 6: Digits 4-6 */}
        <button onClick={() => handleKeyPress("4")} className="h-11 key-btn-dark">4</button>
        <button onClick={() => handleKeyPress("5")} className="h-11 key-btn-dark">5</button>
        <button onClick={() => handleKeyPress("6")} className="h-11 key-btn-dark">6</button>
        <button onClick={() => handleKeyPress("×")} className="h-11 key-btn-accent text-lg">×</button>
        <button onClick={() => handleKeyPress("!")} className="h-11 key-btn-accent">x!</button>

        {/* Row 7: Digits 1-3 */}
        <button onClick={() => handleKeyPress("1")} className="h-11 key-btn-dark">1</button>
        <button onClick={() => handleKeyPress("2")} className="h-11 key-btn-dark">2</button>
        <button onClick={() => handleKeyPress("3")} className="h-11 key-btn-dark">3</button>
        <button onClick={() => handleKeyPress("-")} className="h-11 key-btn-accent text-lg">-</button>
        <button onClick={() => handleKeyPress("ln(")} className="h-11 key-btn-accent text-xs">ln</button>

        {/* Row 8: Digits 0, Dot, Ans, Plus, Log */}
        <button onClick={() => handleKeyPress("0")} className="h-11 key-btn-dark">0</button>
        <button onClick={() => handleKeyPress(".")} className="h-11 key-btn-dark">.</button>
        <button onClick={() => handleKeyPress("Ans")} className="h-11 key-btn-dark text-xs">Ans</button>
        <button onClick={() => handleKeyPress("+")} className="h-11 key-btn-accent text-lg">+</button>
        <button onClick={() => handleKeyPress("log(")} className="h-11 key-btn-accent text-xs">log</button>

        {/* Row 9: Equals (Spans full width) */}
        <button
          onClick={handleEvaluate}
          className="col-span-5 h-12 key-btn-orange text-lg font-bold shadow-md shadow-fx-orange/20"
        >
          =
        </button>
      </div>
    </div>
  );
}