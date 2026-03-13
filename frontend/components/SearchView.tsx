"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MovieCard, { Movie } from "@/components/MovieCard";
import ReactMarkdown from "react-markdown";
import { FaSearch, FaRobot, FaMoon, FaChevronDown, FaChevronUp, FaSpinner } from "react-icons/fa";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_HOST ?? "localhost:8000";

interface ExplanationItem {
  title: string;
  release_year: number;
  explanation: string;
}

interface SearchViewProps {
  watchlist: Movie[];
  onAddToWatchlist: (movie: Movie) => void;
}

export default function SearchView({ watchlist, onAddToWatchlist }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [explanations, setExplanations] = useState<ExplanationItem[] | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});

  const [movieNightPlan, setMovieNightPlan] = useState<string | null>(null);
  const [planning, setPlanning] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    setMovies([]);
    setExplanations(null);
    setMovieNightPlan(null);

    try {
      const res = await fetch(`http://${BACKEND}/search?q=${encodeURIComponent(query)}&limit=3`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMovies(data.movies ?? []);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleExplain = async () => {
    if (!movies.length) return;
    setExplaining(true);
    setExplainError(null);
    setExplanations(null);

    try {
      const res = await fetch(`http://${BACKEND}/ai/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: movies.length }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setExplanations(data.explanations ?? []);
    } catch (err: unknown) {
      setExplainError(err instanceof Error ? err.message : "AI explain failed");
    } finally {
      setExplaining(false);
    }
  };

  const handlePlan = async () => {
    if (!movies.length) return;
    setPlanning(true);
    setPlanError(null);
    setMovieNightPlan(null);

    try {
      const res = await fetch(`http://${BACKEND}/ai/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, titles: movies.map((m) => m.title), limit: movies.length }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMovieNightPlan(data.plan ?? "");
    } catch (err: unknown) {
      setPlanError(err instanceof Error ? err.message : "Planning failed");
    } finally {
      setPlanning(false);
    }
  };

  const toggleExplanation = (title: string) => {
    setExpandedExplanations((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isInWatchlist = (movie: Movie) => watchlist.some((w) => w.id === movie.id);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-4 py-6">
      {/* Search input */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="flex gap-2"
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Describe a movie you're in the mood for..."
          className="flex-1 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-400/50 focus-visible:border-purple-400/50"
        />
        <Button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="bg-purple-600/60 hover:bg-purple-600/80 text-white border border-purple-400/30 gap-2 backdrop-blur-md"
        >
          {searching ? <FaSpinner className="animate-spin" size={14} /> : <FaSearch size={14} />}
          Search
        </Button>
      </motion.div>

      {searchError && (
        <p className="text-red-400 text-sm text-center">{searchError}</p>
      )}

      {/* Movie grid */}
      <AnimatePresence>
        {movies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            {movies.map((movie, i) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onAddToWatchlist={onAddToWatchlist}
                isInWatchlist={isInWatchlist(movie)}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI action buttons */}
      <AnimatePresence>
        {movies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Button
              onClick={handleExplain}
              disabled={explaining}
              className="bg-indigo-600/40 hover:bg-indigo-600/60 text-white border border-indigo-400/30 gap-2 backdrop-blur-md"
            >
              {explaining ? <FaSpinner className="animate-spin" size={14} /> : <FaRobot size={14} />}
              Ask AI about these movies
            </Button>
            <Button
              onClick={handlePlan}
              disabled={planning}
              className="bg-pink-600/40 hover:bg-pink-600/60 text-white border border-pink-400/30 gap-2 backdrop-blur-md"
            >
              {planning ? <FaSpinner className="animate-spin" size={14} /> : <FaMoon size={14} />}
              Plan My Movie Night
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {explainError && <p className="text-red-400 text-sm">{explainError}</p>}

      {/* AI Explanations */}
      <AnimatePresence>
        {explanations && explanations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="flex flex-col gap-3"
          >
            <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider">
              AI Explanations
            </h2>
            {explanations.map((item) => (
              <motion.div
                key={item.title}
                layout
                className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  onClick={() => toggleExplanation(item.title)}
                >
                  <span className="text-white font-medium text-sm">
                    {item.title}{" "}
                    <span className="text-white/50 font-normal">({item.release_year})</span>
                  </span>
                  {expandedExplanations[item.title] ? (
                    <FaChevronUp className="text-white/50 shrink-0" size={12} />
                  ) : (
                    <FaChevronDown className="text-white/50 shrink-0" size={12} />
                  )}
                </button>
                <AnimatePresence>
                  {expandedExplanations[item.title] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-white/70 text-sm leading-relaxed">
                        {item.explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {planError && <p className="text-red-400 text-sm">{planError}</p>}

      {/* Movie Night Plan */}
      <AnimatePresence>
        {movieNightPlan && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg p-5"
          >
            <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <FaMoon size={14} /> Movie Night Plan
            </h2>
            <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed [&>p]:mb-2 [&>ul]:mb-2 [&>h1]:text-white [&>h2]:text-white [&>h3]:text-white [&>strong]:text-white">
              <ReactMarkdown>{movieNightPlan}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
