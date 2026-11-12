"use client";

import React, { useState } from "react";
import { Search, X, BookOpen, Layers } from "lucide-react";
import { ACADEMY_CURRICULUM, KeyTerm } from "@/data/academyCurriculum";

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "hinglish";
}

interface TermWithMeta extends KeyTerm {
  levelTitle: string;
  levelNumber: number;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");

  if (!isOpen) return null;

  // Extract all key terms across all 8 levels
  const allTerms: TermWithMeta[] = [];
  ACADEMY_CURRICULUM.forEach((lvl) => {
    lvl.lessons.forEach((les) => {
      les.keyTerms.forEach((kt) => {
        allTerms.push({
          ...kt,
          levelTitle: lvl.title,
          levelNumber: lvl.level,
        });
      });
    });
  });

  const filtered = allTerms.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hinglish.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || item.levelNumber === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-base text-slate-100">
              {language === "hinglish" ? "Trading Academy Glossary" : "MarketPulse Financial Glossary"}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
              {allTerms.length} Terms Defined
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Level Filter */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by term (e.g. Demat, RSI, Position Sizing, STT)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedLevel("all")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition ${
                selectedLevel === "all"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All Levels
            </button>
            {ACADEMY_CURRICULUM.map((lvl) => (
              <button
                key={lvl.level}
                onClick={() => setSelectedLevel(lvl.level)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition ${
                  selectedLevel === lvl.level
                    ? "bg-sky-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Level {lvl.level}
              </button>
            ))}
          </div>
        </div>

        {/* Term List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching financial terms found. Try a different search word.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 text-sm">{item.term}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    Level {item.levelNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{item.definition}</p>
                <div className="pt-1 border-t border-slate-800/80 text-[11px] text-amber-300/90 italic">
                  💡 Hinglish: {item.hinglish}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 text-right text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-semibold"
          >
            Close Glossary
          </button>
        </div>
      </div>
    </div>
  );
};
