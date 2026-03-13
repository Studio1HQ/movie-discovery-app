"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import SearchView from "@/components/SearchView";
import ChatView from "@/components/ChatView";
import { Movie } from "@/components/MovieCard";

type View = "search" | "chat";

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("search");
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  const addToWatchlist = (movie: Movie) => {
    setWatchlist((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev;
      return [...prev, movie];
    });
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        watchlist={watchlist}
        onRemoveFromWatchlist={removeFromWatchlist}
      />

      <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-transparent">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-md shrink-0">
          <SidebarTrigger className="text-white/60 hover:text-white hover:bg-white/10 rounded-md p-1.5 transition-colors" />
          <h1 className="text-white/80 font-medium text-sm">
            {currentView === "search" ? "Movie Search" : "AI Chat"}
          </h1>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentView === "search" ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: "spring", stiffness: 150, damping: 22 }}
                className="h-full"
              >
                <SearchView
                  watchlist={watchlist}
                  onAddToWatchlist={addToWatchlist}
                />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 150, damping: 22 }}
                className="h-full flex flex-col"
              >
                <ChatView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
