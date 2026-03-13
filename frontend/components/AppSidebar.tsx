"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FaFilm, FaSearch, FaComments, FaTimes, FaDownload } from "react-icons/fa";
import { Movie } from "@/components/MovieCard";

type View = "search" | "chat";

interface AppSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  watchlist: Movie[];
  onRemoveFromWatchlist: (id: string) => void;
}

export default function AppSidebar({
  currentView,
  onViewChange,
  watchlist,
  onRemoveFromWatchlist,
}: AppSidebarProps) {
  const handleExport = () => {
    const lines = watchlist.map((m) => `${m.title} (${m.release_year})`);
    const content = "My Movie Watchlist\n==================\n\n" + lines.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "watchlist.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "search", label: "Search", icon: <FaSearch size={14} /> },
    { id: "chat", label: "Chat", icon: <FaComments size={14} /> },
  ];

  return (
    <Sidebar className="border-r border-white/10">
      <div className="h-full flex flex-col bg-white/5 backdrop-blur-xl">
        {/* Header */}
        <SidebarHeader className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/60 flex items-center justify-center shrink-0">
              <FaFilm className="text-white" size={14} />
            </div>
            <span className="font-semibold text-white text-sm leading-tight">
              Movie Discovery
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/40 text-xs uppercase tracking-wider px-2 pb-1">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={currentView === item.id}
                      onClick={() => onViewChange(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                        currentView === item.id
                          ? "bg-purple-600/40 text-white border border-purple-400/30"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="bg-white/10 my-2" />

          {/* Weaviate branding + features */}
          <SidebarGroup>
            <div className="px-2 pt-1 pb-3 flex flex-col gap-2">
              <img
                src="https://weaviate.io/img/site/weaviate-logo-light.png"
                alt="Weaviate"
                className="h-7 w-auto object-contain opacity-75"
              />
              <p className="text-white/35 text-xs leading-relaxed">
                Semantic search powered by Weaviate vector database.
              </p>
              <div className="flex flex-col gap-1 mt-0.5">
                {[
                  "text2vec-weaviate",
                  "multi2multivec-weaviate",
                  "generative-openai",
                  "near_text search",
                  "single_prompt RAG",
                  "grouped_task RAG",
                  "Query Agent",
                ].map((feature) => (
                  <span key={feature} className="text-white/40 text-xs flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-purple-400/60 shrink-0" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </SidebarGroup>

          <SidebarSeparator className="bg-white/10 my-2" />

          {/* Watchlist */}
          <SidebarGroup className="flex-1">
            <SidebarGroupLabel className="text-white/40 text-xs uppercase tracking-wider px-2 pb-1 flex items-center justify-between">
              <span>My Watchlist</span>
              {watchlist.length > 0 && (
                <span className="bg-purple-600/40 text-purple-300 text-xs rounded-full px-1.5 py-0.5 font-medium">
                  {watchlist.length}
                </span>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <AnimatePresence>
                {watchlist.length === 0 ? (
                  <p className="text-white/30 text-xs px-2 py-2">
                    No movies saved yet. Search and add some!
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {watchlist.map((movie) => (
                      <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-xs font-medium truncate leading-tight">
                            {movie.title}
                          </p>
                          <p className="text-white/40 text-xs">{movie.release_year}</p>
                        </div>
                        <button
                          onClick={() => onRemoveFromWatchlist(movie.id)}
                          className="shrink-0 text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove"
                        >
                          <FaTimes size={10} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        {watchlist.length > 0 && (
          <SidebarFooter className="p-3 border-t border-white/10">
            <Button
              size="sm"
              onClick={handleExport}
              className="w-full bg-white/10 hover:bg-white/20 text-white/70 border border-white/20 gap-1.5 text-xs"
            >
              <FaDownload size={10} /> Export .txt
            </Button>
          </SidebarFooter>
        )}
      </div>
    </Sidebar>
  );
}
