import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  initialValue?: string;
}

interface Suggestion {
  query: string;
  category: string;
  highlighted: string;
}

export function SearchBar({ 
  placeholder = "Search AI tools, categories, or features...", 
  onSearch,
  className,
  initialValue = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update query when initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Fetch suggestions when user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchSuggestions(query.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setSelectedSuggestionIndex(-1);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const searchQuery = query.trim();
    if (!searchQuery) return;
    
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Force page navigation using window.location to ensure proper routing
      const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}`;
      window.location.href = searchUrl;
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.query);
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(suggestion.query);
    } else {
      // Force page navigation using window.location to ensure proper routing
      const searchUrl = `/search?q=${encodeURIComponent(suggestion.query)}`;
      window.location.href = searchUrl;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    }, 200);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && query.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          className="pl-12 pr-24 py-6 text-lg rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
        />
        <Button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6"
          disabled={isLoadingSuggestions}
        >
          {isLoadingSuggestions ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Search
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={cn(
                "px-4 py-3 cursor-pointer border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors",
                selectedSuggestionIndex === index && "bg-muted"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span 
                    className="text-foreground font-medium"
                    dangerouslySetInnerHTML={{ __html: suggestion.highlighted }}
                  />
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {suggestion.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
