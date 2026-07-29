"use client";

import React, { useState, useRef } from "react";
import { addHistoryEntry } from "@/lib/storage";
import { Sparkles, Upload, Camera, X, BrainCircuit, AlertCircle } from "lucide-react";

export default function Solver() {
  const [question, setQuestion] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [solution, setSolution] = useState<string>("");
  const [error, setError] = useState<string>("");

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    if (uploadInputRef.current) uploadInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSolve = async () => {
    if (!question.trim() && !imageBase64) return;

    setLoading(true);
    setError("");
    setSolution("");

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          imageBase64: imageBase64 || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("API error");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setSolution(data.solution);

      // Save to calculation history
      const historyExpr = question.trim() || "[Görsel Matematik Sorusu]";
      const historyRes = "AI Çözümü (Detaylar Çözücü sekmesinde)";
      addHistoryEntry(historyExpr, historyRes);
    } catch (err: any) {
      console.error("AI Solver Error:", err);
      setError("Çözüm alınamadı. Lütfen API anahtarınızı kontrol edin ve tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Simple helper to render basic markdown-like bold text (**text**)
  const renderSolutionText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="text-fx-orange font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="card max-w-md mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col border-b border-fx-border pb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-fx-orange" />
          <span className="text-fx-orange font-bold text-lg tracking-wider">AI ÇÖZÜCÜ</span>
        </div>
        <span className="text-[10px] text-fx-text-muted mt-1">
          Herhangi bir matematik sorusu sorun veya fotoğraf çekin
        </span>
      </div>

      {/* Text Input */}
      <div className="flex flex-col gap-1">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Matematik probleminizi buraya yazın..."
          rows={4}
          className="bg-black border border-fx-border rounded-xl p-3 text-sm text-fx-text font-mono focus:outline-none focus:border-fx-orange resize-none placeholder:text-neutral-600"
          disabled={loading}
        />
      </div>

      {/* Image Upload & Camera Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Hidden Inputs */}
        <input
          type="file"
          ref={uploadInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleImageChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        <button
          onClick={() => uploadInputRef.current?.click()}
          className="h-10 key-btn-accent text-xs flex items-center justify-center gap-1.5"
          disabled={loading}
        >
          <Upload className="w-4 h-4" />
          Resim Yükle
        </button>

        <button
          onClick={() => cameraInputRef.current?.click()}
          className="h-10 key-btn-accent text-xs flex items-center justify-center gap-1.5"
          disabled={loading}
        >
          <Camera className="w-4 h-4" />
          Kamera
        </button>
      </div>

      {/* Image Preview Thumbnail */}
      {imageBase64 && (
        <div className="relative bg-neutral-900 border border-fx-border rounded-xl p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageBase64}
              alt="Preview"
              className="w-12 h-12 object-cover rounded-lg border border-fx-border shrink-0"
            />
            <span className="text-[10px] text-fx-text-muted truncate">Görsel yüklendi</span>
          </div>
          <button
            onClick={handleRemoveImage}
            className="p-1 text-neutral-500 hover:text-red-500 hover:bg-neutral-800 rounded-lg transition-all duration-150"
            title="Görseli Kaldır"
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Solve Button */}
      <button
        onClick={handleSolve}
        disabled={loading || (!question.trim() && !imageBase64)}
        className="h-12 key-btn-orange text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-fx-orange/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-4 h-4 fill-current" />
        {loading ? "Çözülüyor..." : "Çöz"}
      </button>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 bg-red-950/50 border border-red-900 text-red-200 p-3 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Solution Result Area */}
      {solution && (
        <div className="bg-black border border-fx-border rounded-xl p-4 flex flex-col gap-2 max-h-[350px] overflow-y-auto">
          <span className="text-xs text-fx-orange font-bold tracking-wider border-b border-fx-border pb-1">
            ADIM ADIM ÇÖZÜM
          </span>
          <div className="text-xs md:text-sm text-fx-text font-mono whitespace-pre-wrap leading-relaxed">
            {renderSolutionText(solution)}
          </div>
        </div>
      )}
    </div>
  );
}