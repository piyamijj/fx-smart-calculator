"use client";

import React, { useState } from "react";
import Calculator from "./components/Calculator";
import HistoryTab from "./components/History";
import MemoryTab from "./components/Memory";
import GraphTab from "./components/GraphTab";
import Solver from "./components/Solver";
import { Calculator as CalcIcon, History, Database, LineChart, BrainCircuit } from "lucide-react";

type TabType = "COMP" | "HIST" | "MEM" | "GRAPH" | "SOLVE";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>("COMP");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "COMP":
        return <Calculator />;
      case "HIST":
        return <HistoryTab />;
      case "MEM":
        return <MemoryTab />;
      case "GRAPH":
        return <GraphTab />;
      case "SOLVE":
        return <Solver />;
      default:
        return <Calculator />;
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "COMP", label: "COMP", icon: <CalcIcon className="w-4 h-4" /> },
    { id: "HIST", label: "HIST", icon: <History className="w-4 h-4" /> },
    { id: "MEM", label: "MEM", icon: <Database className="w-4 h-4" /> },
    { id: "GRAPH", label: "GRAPH", icon: <LineChart className="w-4 h-4" /> },
    { id: "SOLVE", label: "SOLVE", icon: <BrainCircuit className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-fx-bg flex flex-col">
      {/* Top App Title Bar */}
      <header className="bg-black/40 border-b border-fx-border/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-fx-orange font-bold text-xl tracking-wider font-fx-mono">
              fx-SMART
            </span>
            <span className="text-[10px] text-fx-text-muted border border-fx-border px-1.5 py-0.5 rounded font-mono">
              v1.0.0
            </span>
          </div>
          <span className="text-xs text-fx-text-muted font-mono">
            Gelişmiş Bilimsel Hesap Makinesi
          </span>
        </div>

        {/* Tab Bar */}
        <div className="max-w-4xl mx-auto px-2">
          <nav className="flex overflow-x-auto no-scrollbar border-t border-fx-border/40">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? "tab-active" : "tab-inactive"}
              >
                {tab.icon}
                <span className="text-xs tracking-wider font-bold">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col justify-start">
        <div className="w-full transition-all duration-300 ease-in-out">
          {renderActiveTab()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-fx-border/40 py-4 text-center text-[10px] text-neutral-600 font-mono mt-auto">
        fx-SMART © {new Date().getFullYear()} · Tüm hakları saklıdır.
      </footer>
    </div>
  );
}