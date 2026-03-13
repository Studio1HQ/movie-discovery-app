"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FaPlus, FaCheck, FaFilm } from "react-icons/fa";

export interface Movie {
  id: string;
  title: string;
  description: string;
  release_year: number;
  poster: string | null;
}

interface MovieCardProps {
  movie: Movie;
  onAddToWatchlist: (movie: Movie) => void;
  isInWatchlist: boolean;
  index?: number;
}

export default function MovieCard({
  movie,
  onAddToWatchlist,
  isInWatchlist,
  index = 0,
}: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="flex flex-col rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
    >
      {/* Poster */}
      <div className="relative w-full aspect-[2/3] bg-white/5 overflow-hidden">
        {movie.poster ? (
          <img
            src={`data:image/jpeg;base64,${movie.poster}`}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-white/30">
            <FaFilm size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 text-xs font-medium text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {movie.release_year}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">
          {movie.title}
        </h3>
        <p className="text-white/60 text-xs leading-relaxed line-clamp-3 flex-1">
          {movie.description}
        </p>
        <Button
          size="sm"
          onClick={() => onAddToWatchlist(movie)}
          disabled={isInWatchlist}
          className={`mt-2 w-full text-xs gap-1 transition-all ${
            isInWatchlist
              ? "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/20 cursor-default"
              : "bg-purple-600/40 hover:bg-purple-600/60 text-white border border-purple-400/30"
          }`}
        >
          {isInWatchlist ? (
            <>
              <FaCheck size={10} /> In Watchlist
            </>
          ) : (
            <>
              <FaPlus size={10} /> Watchlist
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
