import React from 'react';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface CourseFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: string;
  setFilter: (f: string) => void;
  filters: string[];
  sortBy: string;
  setSortBy: (s: string) => void;
  sorts: string[];
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
}

export function CourseFilters({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  filters,
  sortBy,
  setSortBy,
  sorts,
  viewMode,
  onViewChange
}: CourseFiltersProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 }}
      className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-2xl p-4 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between sticky top-20 z-30"
    >
      {/* Search */}
      <div className="relative w-full xl:w-[320px] shrink-0 group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
        <Input 
          placeholder="Search your courses..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 h-11 rounded-xl bg-background/60 border-border/50 focus-visible:ring-2 focus-visible:ring-primary shadow-inner font-medium placeholder:text-muted-foreground/70 transition-all duration-200 hover:border-border/80"
          aria-label="Search courses"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-none">
        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0 pr-2 md:pr-0 w-full md:w-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 text-[13px] font-bold rounded-lg transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                filter === f 
                  ? 'bg-foreground text-background shadow-sm' 
                  : 'bg-transparent border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border/80'
              }`}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0 border-t border-border/40 md:border-t-0 md:border-l md:pl-4 pt-4 md:pt-0">
          {/* Sort Dropdown */}
          <div className="relative flex items-center gap-2 border border-border/50 rounded-lg bg-background/60 px-3 h-10 hover:border-border/80 transition-colors duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select 
              className="bg-transparent text-[13px] font-bold text-foreground outline-none border-none focus:ring-0 cursor-pointer w-full appearance-none pr-6"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort courses"
            >
              {sorts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex bg-background/60 border border-border/50 rounded-lg p-1 shrink-0">
            <button 
              onClick={() => onViewChange('grid')}
              className={`p-1.5 rounded-[5px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onViewChange('list')}
              className={`p-1.5 rounded-[5px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
