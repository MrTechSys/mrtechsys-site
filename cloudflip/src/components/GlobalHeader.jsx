import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Globe,
  TrendingUp
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GlobalHeader({ 
  showSearch = true, 
  showFilters = false,
  onSearchChange,
  onFilterChange,
  filterOptions = []
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearchChange) onSearchChange(value);
  };

  const handleFilter = (value) => {
    setSelectedFilter(value);
    if (onFilterChange) onFilterChange(value);
  };

  return (
    <div className="bg-black/40 border-b border-amber-500/20 p-4 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* SEO & Global Actions */}
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Globe className="w-3 h-3 mr-1" />
            SEO Optimized
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            Analytics Active
          </Badge>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {showSearch && (
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <Input
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search..."
                className="pl-10 bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
              />
            </div>
          )}

          {showFilters && filterOptions.length > 0 && (
            <Select value={selectedFilter} onValueChange={handleFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-amber-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {filterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}