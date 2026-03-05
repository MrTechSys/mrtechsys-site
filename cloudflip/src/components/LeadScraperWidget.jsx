import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Search, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const quickVerticals = [
  { id: 'dentist', label: 'Dentists', icon: '🦷' },
  { id: 'restaurant', label: 'Restaurants', icon: '🍽️' },
  { id: 'plumbing', label: 'Plumbers', icon: '🔧' },
  { id: 'hvac', label: 'HVAC', icon: '❄️' },
  { id: 'electrical', label: 'Electricians', icon: '⚡' },
];

export default function LeadScraperWidget({ compact = false }) {
  const [vertical, setVertical] = useState('');
  const [location, setLocation] = useState('');
  const [quickResults, setQuickResults] = useState(null);

  const quickScrapeMutation = useMutation({
    mutationFn: async ({ vertical, location }) => {
      const { data } = await api.functions.invoke('yellowPagesScraperAI', {
        vertical,
        location,
        limit: 5
      });
      return data;
    },
    onSuccess: (data) => {
      setQuickResults(data);
      toast.success(`Found ${data.leads?.length || 0} leads!`);
    },
    onError: (error) => {
      console.error('Quick scrape error:', error);
      toast.error("Quick search failed");
    }
  });

  const handleQuickSearch = () => {
    if (!vertical || !location) {
      toast.error("Select vertical and location");
      return;
    }
    quickScrapeMutation.mutate({ vertical, location });
  };

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Quick Lead Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={vertical} onValueChange={setVertical}>
            <SelectTrigger className="bg-white/5 border-amber-500/30 text-white h-9 text-sm">
              <SelectValue placeholder="Select vertical..." />
            </SelectTrigger>
            <SelectContent>
              {quickVerticals.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.icon} {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, State or ZIP"
            className="bg-white/5 border-amber-500/30 text-white h-9 text-sm"
          />

          <Button
            onClick={handleQuickSearch}
            disabled={quickScrapeMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
            size="sm"
          >
            {quickScrapeMutation.isPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-3 h-3 mr-2" />
                Find Leads
              </>
            )}
          </Button>

          {quickResults && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-white/70 text-xs mb-2">
                Found {quickResults.leads?.length || 0} businesses
              </p>
              <Link to={createPageUrl("LeadScraper")}>
                <Button variant="outline" size="sm" className="w-full border-cyan-500/30 text-cyan-400">
                  View All Results
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          AI Lead Discovery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/70 text-sm">
          Find local businesses in your target market automatically
        </p>

        <div className="flex gap-2">
          <Select value={vertical} onValueChange={setVertical}>
            <SelectTrigger className="bg-white/5 border-amber-500/30 text-white flex-1">
              <SelectValue placeholder="Select vertical..." />
            </SelectTrigger>
            <SelectContent>
              {quickVerticals.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.icon} {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Austin, TX"
            className="bg-white/5 border-amber-500/30 text-white flex-1"
          />
        </div>

        <Button
          onClick={handleQuickSearch}
          disabled={quickScrapeMutation.isPending}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
        >
          {quickScrapeMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Quick Search
            </>
          )}
        </Button>

        <Link to={createPageUrl("LeadScraper")}>
          <Button variant="outline" className="w-full border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-4 h-4 mr-2" />
            Open Full Scraper
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}