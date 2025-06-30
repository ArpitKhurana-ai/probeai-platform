import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import algoliasearch from "algoliasearch/lite";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  initialValue?: string;
}

interface Suggestion {
  objectID: string;
  name: string;
  query: string;
  category: string;
  highlighted: string;
}

const algoliaClient = algoliasearch("N19W8QAGPY", "4d9d414ea3f63d0952ea96f2dac8ec67");
const algoliaIndex = algoliaClient.initIndex("tools");

export function SearchBar({ 
  placeholder = "Search AI tools, categories, or features...", 
  onSearch,
  className,
  initialValue = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2 && isFocused) {
        fetchSuggestions(query.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query, isFocused]);

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoadingSuggestions(true);
    try {
      const result = await algoliaIndex.search(searchQuery, {
        hitsPerPage: 5,
        attributesToHighlight: ["name"],
      });
      const hits = result.hits.map((hit: any) => ({
        objectID: hit.objectID,
        name: hit.name,
        query: hit.query || hit.name,
        category: hit.category || "General",
        highlighted: hit._highlightResult?.name?.value || hit.name,
      }));
      setSuggestions(hits);
      setShowSuggestions(hits.length > 0);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error("Algolia suggestion error", error);
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
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const searchTerm = suggestion.query || suggestion.name;
    setQuery(searchTerm);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    }, 200);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (suggestions.length > 0 && query.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
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
          onBlur={() => {
            setIsFocused(false);
            handleInputBlur();
          }}
          onFocus={handleInputFocus}
          className="pl-12 pr-24 py-6 text-lg rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
        />
        {query.length > 0 && (
          <X
            className="absolute right-20 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer"
            onClick={handleClear}
          />
        )}
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

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.objectID || index}
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
                    dangerouslySetInnerHTML={{
                      __html: suggestion.highlighted || suggestion.name
                    }}
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
