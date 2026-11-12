"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Layout,
  Sliders,
  Sun,
  Moon,
  ShieldCheck,
  Eye,
} from "lucide-react";

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  background: string;
  cardBg: string;
  accent: string;
  accentText: string;
  border: string;
  isDark: boolean;
}

export const PRESET_THEMES: ThemeConfig[] = [
  {
    id: "midnight-graphite",
    name: "Midnight Graphite",
    description: "Default private banking obsidian aesthetic with electric cyan accents.",
    background: "#070B12",
    cardBg: "#0D1424",
    accent: "#0EA5E9",
    accentText: "#38BDF8",
    border: "#1E293B",
    isDark: true,
  },
  {
    id: "sapphire-blue",
    name: "Sapphire Blue",
    description: "Deep oceanic navy with rich cobalt and sapphire highlights.",
    background: "#050C1A",
    cardBg: "#0B1933",
    accent: "#2563EB",
    accentText: "#60A5FA",
    border: "#1D3557",
    isDark: true,
  },
  {
    id: "royal-violet",
    name: "Royal Violet",
    description: "Sophisticated dark amethyst with controlled AI violet glow.",
    background: "#0B0714",
    cardBg: "#170F28",
    accent: "#8B5CF6",
    accentText: "#A78BFA",
    border: "#2E1C4E",
    isDark: true,
  },
  {
    id: "emerald-elite",
    name: "Emerald Elite",
    description: "Private wealth dark jade with fine emerald accents.",
    background: "#040D09",
    cardBg: "#0A1D15",
    accent: "#10B981",
    accentText: "#34D399",
    border: "#163B2B",
    isDark: true,
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    description: "Deep sea dark teal with vibrant aquamarine contrasts.",
    background: "#030E12",
    cardBg: "#091E26",
    accent: "#06B6D4",
    accentText: "#22D3EE",
    border: "#153D4C",
    isDark: true,
  },
  {
    id: "arctic-silver",
    name: "Arctic Silver",
    description: "Monochrome platinum with cold titanium and ice-blue borders.",
    background: "#0B0E14",
    cardBg: "#121824",
    accent: "#94A3B8",
    accentText: "#E2E8F0",
    border: "#243044",
    isDark: true,
  },
  {
    id: "rose-quartz",
    name: "Rose Quartz",
    description: "Refined dark slate with soft rose-gold highlights.",
    background: "#12080D",
    cardBg: "#22111A",
    accent: "#F43F5E",
    accentText: "#FB7185",
    border: "#441D30",
    isDark: true,
  },
  {
    id: "carbon-monochrome",
    name: "Carbon Monochrome",
    description: "Pure charcoal with minimalist high-contrast typography.",
    background: "#0A0A0A",
    cardBg: "#141414",
    accent: "#FFFFFF",
    accentText: "#E5E5E5",
    border: "#262626",
    isDark: true,
  },
  {
    id: "solar-amber",
    name: "Solar Amber",
    description: "Deep bronze graphite with warm institutional gold highlights.",
    background: "#0E0A04",
    cardBg: "#1C1408",
    accent: "#F59E0B",
    accentText: "#FBBF24",
    border: "#3B2B11",
    isDark: true,
  },
  {
    id: "crimson-edge",
    name: "Crimson Edge",
    description: "Bold obsidian graphite with high-energy ruby borders.",
    background: "#0E0404",
    cardBg: "#1C0B0B",
    accent: "#EF4444",
    accentText: "#F87171",
    border: "#3C1515",
    isDark: true,
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    description: "Ultra-deep Mariana trench navy with electric cyan luminescence.",
    background: "#020712",
    cardBg: "#06132C",
    accent: "#00E5FF",
    accentText: "#67E8F9",
    border: "#0E2B63",
    isDark: true,
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Nordic night atmosphere with iridescent emerald-cyan gradients.",
    background: "#040A10",
    cardBg: "#0A1724",
    accent: "#10B981",
    accentText: "#6EE7B7",
    border: "#143345",
    isDark: true,
  },
];

export interface ThemeStudioProps {
  onApplyTheme?: (theme: ThemeConfig) => void;
}

export const ThemeStudio: React.FC<ThemeStudioProps> = ({ onApplyTheme }) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>("midnight-graphite");
  const [density, setDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [customAccent, setCustomAccent] = useState<string>("#0EA5E9");
  const [useCustomAccent, setUseCustomAccent] = useState<boolean>(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("marketpulse_theme_prefs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.themeId) setSelectedThemeId(parsed.themeId);
        if (parsed.density) setDensity(parsed.density);
        if (parsed.customAccent) {
          setCustomAccent(parsed.customAccent);
          setUseCustomAccent(parsed.useCustomAccent || false);
        }
      }
    } catch {}
  }, []);

  const activePreset = PRESET_THEMES.find((t) => t.id === selectedThemeId) || PRESET_THEMES[0];

  const handleSelectTheme = (theme: ThemeConfig) => {
    setSelectedThemeId(theme.id);
    savePreferences(theme.id, density, customAccent, useCustomAccent);
    if (onApplyTheme) onApplyTheme(theme);
  };

  const handleDensityChange = (newDensity: "compact" | "comfortable" | "spacious") => {
    setDensity(newDensity);
    savePreferences(selectedThemeId, newDensity, customAccent, useCustomAccent);
  };

  const handleCustomAccentChange = (hex: string) => {
    setCustomAccent(hex);
    setUseCustomAccent(true);
    savePreferences(selectedThemeId, density, hex, true);
  };

  const savePreferences = (themeId: string, dens: string, accentHex: string, isCustom: boolean) => {
    try {
      localStorage.setItem(
        "marketpulse_theme_prefs",
        JSON.stringify({
          themeId,
          density: dens,
          customAccent: accentHex,
          useCustomAccent: isCustom,
        })
      );
    } catch {}
  };

  const resetToDefault = () => {
    setSelectedThemeId("midnight-graphite");
    setDensity("comfortable");
    setCustomAccent("#0EA5E9");
    setUseCustomAccent(false);
    savePreferences("midnight-graphite", "comfortable", "#0EA5E9", false);
    if (onApplyTheme) onApplyTheme(PRESET_THEMES[0]);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Personalized Theme Studio</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              12 Curated Presets
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tailor your terminal aesthetics, color accents, and layout density. All choices persist per user account.
          </p>
        </div>

        <button
          onClick={resetToDefault}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* Preset Themes Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Curated Institutional Themes</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PRESET_THEMES.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme)}
                className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "border-sky-500 shadow-lg shadow-sky-950/40 bg-slate-800/90"
                    : "border-slate-800/80 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{theme.name}</span>
                    {isSelected && (
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-sky-500 text-white">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{theme.description}</p>
                </div>

                {/* Color swatches strip */}
                <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80">
                  <span
                    className="w-4 h-4 rounded-full border border-slate-700"
                    style={{ backgroundColor: theme.background }}
                    title="Background"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-slate-700"
                    style={{ backgroundColor: theme.cardBg }}
                    title="Surface Card"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-slate-700"
                    style={{ backgroundColor: theme.accent }}
                    title="Accent Highlight"
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-slate-700"
                    style={{ backgroundColor: theme.border }}
                    title="Border Contour"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Density & Custom Accent Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
        {/* Density Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5 text-sky-400" />
            <span>Layout Density</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["compact", "comfortable", "spacious"] as const).map((d) => (
              <button
                key={d}
                onClick={() => handleDensityChange(d)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition ${
                  density === d
                    ? "bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-950"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            {density === "compact"
              ? "Higher information density for rapid multi-chart scanning."
              : density === "spacious"
              ? "Relaxed padding and larger typography for deep visual study."
              : "Balanced standard layout designed for general quantitative research."}
          </p>
        </div>

        {/* Custom Accent Color Control */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Custom Accent Tint</span>
          </label>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customAccent}
              onChange={(e) => handleCustomAccentChange(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer bg-slate-950 border border-slate-700"
            />
            <div className="flex-1 font-mono text-xs text-white bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
              {customAccent.toUpperCase()}
            </div>
            {useCustomAccent && (
              <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-1 rounded border border-sky-800">
                Custom Active
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Select any preferred brand or terminal highlight color. Chart up/down green and red remain protected for mathematical safety.
          </p>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-white">
            <Eye className="w-3.5 h-3.5 text-sky-400" /> Terminal Live Preview
          </span>
          <span className="font-mono text-[10px]">Active Theme: {activePreset.name}</span>
        </div>

        <div
          className="p-4 rounded-lg border space-y-2.5 transition-colors"
          style={{
            backgroundColor: activePreset.cardBg,
            borderColor: activePreset.border,
          }}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white">TCS.NS • Tata Consultancy Services</span>
            <span
              className="font-bold font-mono px-2 py-0.5 rounded text-[11px]"
              style={{
                backgroundColor: useCustomAccent ? customAccent : activePreset.accent,
                color: "#FFFFFF",
              }}
            >
              ₹2,475.40 (-0.92%)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Verified closing observation • Quantitative Confluence Score: <strong className="text-white">72/100</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
