"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Wallet,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Languages,
  Award,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
  X,
  ShieldCheck,
  Info,
} from "lucide-react";

import {
  ACADEMY_CURRICULUM,
  AcademyLevel,
  AcademyLesson,
} from "@/data/academyCurriculum";
import { VisualTeachingCanvas } from "./VisualTeachingCanvas";
import { AITutorChat } from "./AITutorChat";
import { PaperTradingSandbox } from "./PaperTradingSandbox";
import { GlossaryModal } from "./GlossaryModal";

interface AcademyProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
  selectedLevel: number;
  selectedLessonId: string;
}

export const TradingAcademy: React.FC = () => {
  const [activeMode, setActiveMode] = useState<"curriculum" | "sandbox" | "tutor">("curriculum");
  const [language, setLanguage] = useState<"en" | "hinglish">("en");
  const [selectedLevelIdx, setSelectedLevelIdx] = useState<number>(0);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);

  // User Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  // Persistent Progress State
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [passedQuizzes, setPassedQuizzes] = useState<Set<string>>(new Set());

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("marketpulse_academy_progress");
      if (saved) {
        const parsed: AcademyProgress = JSON.parse(saved);
        if (parsed.completedLessons) {
          setCompletedLessons(new Set(parsed.completedLessons));
        }
        if (parsed.quizScores) {
          setPassedQuizzes(new Set(Object.keys(parsed.quizScores)));
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save progress
  const saveProgress = (newCompleted: Set<string>, newQuizzes: Set<string>) => {
    setCompletedLessons(newCompleted);
    setPassedQuizzes(newQuizzes);
    try {
      const data: AcademyProgress = {
        completedLessons: Array.from(newCompleted),
        quizScores: Object.fromEntries(Array.from(newQuizzes).map((id) => [id, 100])),
        selectedLevel: selectedLevelIdx + 1,
        selectedLessonId: currentLesson.id,
      };
      localStorage.setItem("marketpulse_academy_progress", JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  };

  const currentLevel: AcademyLevel = ACADEMY_CURRICULUM[selectedLevelIdx] || ACADEMY_CURRICULUM[0];
  const currentLesson: AcademyLesson =
    currentLevel.lessons[selectedLessonIdx] || currentLevel.lessons[0];

  // Reset quiz inputs when changing lesson
  const handleSelectLesson = (idx: number) => {
    setSelectedLessonIdx(idx);
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  const handleSelectLevel = (idx: number) => {
    setSelectedLevelIdx(idx);
    setSelectedLessonIdx(0);
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  const handleAnswerSelect = (qIdx: number, optIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleQuizSubmit = () => {
    setSubmittedQuiz(true);
    // Check if all correct
    const allCorrect = currentLesson.quiz.every(
      (q, idx) => selectedAnswers[idx] === q.correctIndex
    );
    if (allCorrect) {
      const updatedQuizzes = new Set(passedQuizzes).add(currentLesson.id);
      const updatedCompleted = new Set(completedLessons).add(currentLesson.id);
      saveProgress(updatedCompleted, updatedQuizzes);
    }
  };

  const markLessonComplete = () => {
    const updated = new Set(completedLessons).add(currentLesson.id);
    saveProgress(updated, passedQuizzes);
  };

  const totalLessons = ACADEMY_CURRICULUM.reduce((sum, lvl) => sum + lvl.lessons.length, 0);
  const completionPercentage = Math.round((completedLessons.size / totalLessons) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Academy Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-sky-600 text-white rounded-xl shadow-md">
                <GraduationCap className="w-6 h-6" />
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                MarketPulse AI Trading Academy
              </h2>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                8 Progressive Levels
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Master stock market investing & quantitative trading from absolute beginner to advanced strategy design with patient AI tutoring and interactive visual models.
            </p>
          </div>

          {/* Stats Badges & Glossary */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Progress Badge */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow">
              <div>
                <span className="text-[11px] text-slate-400 block">Academy Progress</span>
                <span className="text-sm font-bold text-sky-400 font-mono">
                  {completedLessons.size} / {totalLessons} Lessons ({completionPercentage}%)
                </span>
              </div>
              <div className="w-12 h-12 relative flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-sky-500 transition-all duration-500"
                    strokeDasharray={`${completionPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-slate-200">
                  {completionPercentage}%
                </span>
              </div>
            </div>

            {/* Glossary Button */}
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="px-4 py-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 transition shadow"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Financial Glossary</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher Nav */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMode("curriculum")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeMode === "curriculum"
                  ? "bg-sky-600 text-white shadow-md"
                  : "bg-slate-900/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Structured Curriculum</span>
            </button>
            <button
              onClick={() => setActiveMode("sandbox")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeMode === "sandbox"
                  ? "bg-sky-600 text-white shadow-md"
                  : "bg-slate-900/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Paper Trading Sandbox</span>
            </button>
            <button
              onClick={() => setActiveMode("tutor")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeMode === "tutor"
                  ? "bg-sky-600 text-white shadow-md"
                  : "bg-slate-900/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Tutor</span>
            </button>
          </div>

          {/* Bilingual Language Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Languages className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400 text-[11px] font-medium">Teaching Language:</span>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                language === "en" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("hinglish")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                language === "hinglish" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Simple Hinglish
            </button>
          </div>
        </div>
      </div>

      {/* Main View Router */}
      {activeMode === "sandbox" ? (
        <PaperTradingSandbox />
      ) : activeMode === "tutor" ? (
        <AITutorChat
          currentLevel={selectedLevelIdx + 1}
          currentLessonId={currentLesson.id}
          language={language}
          onLanguageChange={setLanguage}
        />
      ) : (
        /* Structured Curriculum Mode */
        <div className="space-y-6">
          {/* Level Tabs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {ACADEMY_CURRICULUM.map((lvl, idx) => {
              const isSelected = selectedLevelIdx === idx;
              const levelCompletedLessons = lvl.lessons.filter((l) =>
                completedLessons.has(l.id)
              ).length;
              const isLevelDone = levelCompletedLessons === lvl.lessons.length;

              return (
                <button
                  key={lvl.id}
                  onClick={() => handleSelectLevel(idx)}
                  className={`p-3 rounded-xl text-left transition border ${
                    isSelected
                      ? "bg-sky-950/70 border-sky-500 text-sky-200 ring-1 ring-sky-500 shadow-md"
                      : isLevelDone
                      ? "bg-slate-900 border-emerald-600/40 text-slate-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Level {lvl.level}
                    </span>
                    {isLevelDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">
                        {levelCompletedLessons}/{lvl.lessons.length}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold truncate text-slate-100">
                    {language === "hinglish" ? lvl.titleHinglish.split(":")[1] || lvl.title : lvl.title.split(":")[1] || lvl.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Level Header Banner */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-bold border border-sky-800 uppercase">
                  Level {currentLevel.level} Syllabus
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  {language === "hinglish" ? currentLevel.titleHinglish : currentLevel.title}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                {currentLevel.description}
              </p>
            </div>

            {/* Lesson Picker Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {currentLevel.lessons.map((les, idx) => (
                <button
                  key={les.id}
                  onClick={() => handleSelectLesson(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    selectedLessonIdx === idx
                      ? "bg-sky-600 text-white shadow-sm"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {completedLessons.has(les.id) && (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>Lesson {idx + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Lesson Content Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Lesson Details & Text */}
            <div className="lg:col-span-7 space-y-6">
              {/* Lesson Overview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-md space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                      Lesson {selectedLessonIdx + 1} of {currentLevel.lessons.length}
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-1">
                      {language === "hinglish" ? currentLesson.titleHinglish : currentLesson.title}
                    </h3>
                  </div>

                  <button
                    onClick={markLessonComplete}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      completedLessons.has(currentLesson.id)
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      {completedLessons.has(currentLesson.id) ? "Completed" : "Mark as Read"}
                    </span>
                  </button>
                </div>

                {/* Lesson Explanations */}
                <div className="space-y-3 text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
                  {(language === "hinglish"
                    ? currentLesson.contentHinglish
                    : currentLesson.contentEn
                  ).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Key Terminology Callouts */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Key Vocabulary Defined:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentLesson.keyTerms.map((kt, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1"
                      >
                        <span className="font-bold text-sky-400 block">{kt.term}</span>
                        <p className="text-[11px] text-slate-300">
                          {language === "hinglish" ? kt.hinglish : kt.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Actionable Exercise */}
                <div className="p-3.5 bg-sky-950/30 border border-sky-800/60 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>
                      {language === "hinglish" ? "Practical Action Step" : "Practical Hands-On Exercise"}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {language === "hinglish"
                      ? currentLesson.practicalExercise.hinglish
                      : currentLesson.practicalExercise.en}
                  </p>
                </div>
              </div>

              {/* Interactive Understanding Check (Quiz Runner) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-base text-slate-100">
                      {language === "hinglish"
                        ? "Check Your Understanding (Interactive Quiz)"
                        : "Knowledge Check Quiz"}
                    </h4>
                  </div>
                  {passedQuizzes.has(currentLesson.id) && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Passed
                    </span>
                  )}
                </div>

                <div className="space-y-6">
                  {currentLesson.quiz.map((q, qIdx) => {
                    const selectedOpt = selectedAnswers[qIdx];
                    const isAnswered = selectedOpt !== undefined;
                    const isCorrect = selectedOpt === q.correctIndex;

                    return (
                      <div key={qIdx} className="space-y-3">
                        <div className="text-sm font-semibold text-slate-200">
                          {qIdx + 1}. {language === "hinglish" ? q.questionHinglish : q.question}
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedOpt === optIdx;
                            let btnStyle = "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800";

                            if (submittedQuiz) {
                              if (optIdx === q.correctIndex) {
                                btnStyle = "bg-emerald-950/80 border-emerald-600 text-emerald-200 font-bold";
                              } else if (isChosen && !isCorrect) {
                                btnStyle = "bg-rose-950/80 border-rose-600 text-rose-200";
                              } else {
                                btnStyle = "bg-slate-950/40 border-slate-900 text-slate-500 opacity-60";
                              }
                            } else if (isChosen) {
                              btnStyle = "bg-sky-950 border-sky-500 text-sky-200 font-bold ring-1 ring-sky-500";
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleAnswerSelect(qIdx, optIdx)}
                                disabled={submittedQuiz}
                                className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {submittedQuiz && optIdx === q.correctIndex && (
                                  <Check className="w-4 h-4 text-emerald-400 ml-2 flex-shrink-0" />
                                )}
                                {submittedQuiz && isChosen && !isCorrect && (
                                  <X className="w-4 h-4 text-rose-400 ml-2 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Detailed Explanation Reveal */}
                        {submittedQuiz && (
                          <div
                            className={`p-3 rounded-lg text-xs leading-relaxed border ${
                              isCorrect
                                ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                                : "bg-rose-950/30 border-rose-800/60 text-rose-300"
                            }`}
                          >
                            <span className="font-bold block mb-0.5">
                              {isCorrect ? "Correct! " : "Incorrect. "}
                              {language === "hinglish" ? "Kyu sahi/galat hai:" : "Rationale:"}
                            </span>
                            <span>
                              {language === "hinglish" ? q.explanationHinglish : q.explanation}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quiz Submit Button */}
                <div className="pt-2 flex justify-end">
                  {!submittedQuiz ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(selectedAnswers).length < currentLesson.quiz.length}
                      className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition shadow"
                    >
                      Submit Quiz Answers
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedAnswers({});
                        setSubmittedQuiz(false);
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                    >
                      Try Quiz Again
                    </button>
                  )}
                </div>
              </div>

              {/* Lesson Nav Controls */}
              <div className="flex justify-between items-center text-xs pt-2">
                <button
                  onClick={() => handleSelectLesson(Math.max(0, selectedLessonIdx - 1))}
                  disabled={selectedLessonIdx === 0}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Lesson
                </button>

                <button
                  onClick={() =>
                    handleSelectLesson(
                      Math.min(currentLevel.lessons.length - 1, selectedLessonIdx + 1)
                    )
                  }
                  disabled={selectedLessonIdx === currentLevel.lessons.length - 1}
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold disabled:opacity-40 hover:bg-sky-500 transition flex items-center gap-1.5 shadow"
                >
                  Next Lesson <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right 5 Columns: Interactive Visual Canvas */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-20 space-y-6">
                <VisualTeachingCanvas
                  visualType={currentLesson.visualType}
                  language={language}
                />

                {/* Quick Call to Action Cards */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Have Questions on this Lesson?</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Switch to the AI Tutor tab to have Prof. Pulse walk you through custom formulas, explain Indian market nuances, or answer follow-ups.
                  </p>
                  <button
                    onClick={() => setActiveMode("tutor")}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-sky-800 text-sky-300 rounded-lg font-semibold transition text-xs"
                  >
                    Open AI Tutor Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        language={language}
      />
    </div>
  );
};
