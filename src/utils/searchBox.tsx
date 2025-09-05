"use client";
import React, { useEffect } from "react";
import { useSearchWithSuggestions } from "@/utils/useUniversalSearchDynamic";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Suggestion } from "@/utils/searchType";

interface SearchBoxProps {
  placeholder?: string;
  fetchSuggestionsApi: (query: string) => Promise<Suggestion[]>;
  fetchSearchResultsApi: (query: string) => Promise<any>;
  defaultFetchApi?: () => Promise<any>;
  getSuggestionLabel: (item: Suggestion) => React.ReactNode;
  getSuggestionValue?: (item: Suggestion) => string;
  inputWidth?: string;
  onSearchChange?: (value: string) => void;
  value?: string;               
}

export function SearchBox(props: SearchBoxProps) {
  const {
    placeholder = "Search...",
    fetchSuggestionsApi,
    fetchSearchResultsApi,
    defaultFetchApi,
    getSuggestionLabel,
    getSuggestionValue = (s: Suggestion) =>
      s.name || s.title || s.email || s.question || String(s),
    inputWidth = "w-full lg:w-[400px]",
    onSearchChange,
    value,  //controlled value coming from the parent
  } = props;

  const {
    searchQuery,
    setSearchQuery,
    showSuggestions,
    filteredSuggestions,
    selectedIndex,
    inputRef,
    suggestionsRef,
    handleInputChange,
    handleKeyDown,
    handleSuggestionClick,
    clearSearch,
    setShowSuggestions,
    setSelectedIndex,
  } = useSearchWithSuggestions({
    fetchSuggestionsApi,
    fetchSearchResultsApi,
    defaultFetchApi,
    getSuggestionValue,
  });

  //  Sync the parent value with the local searchQuery
  useEffect(() => {
    if (value !== undefined && value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value, searchQuery, setSearchQuery]);

  return (
    <form
      onSubmit={(e) => 
        e.preventDefault() 
      }
      className={cn("relative", inputWidth)}
    >
      <Popover open={showSuggestions && filteredSuggestions.length > 0}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => {
                handleInputChange(e);
                onSearchChange?.(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (filteredSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className={cn(inputWidth)}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="p-0 w-[var(--radix-popover-trigger-width)]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (!inputRef.current?.contains(e.target as Node)) {
              setShowSuggestions(false);
            }
          }}
        >
          <div
            ref={suggestionsRef}
            className="bg-white border border-border rounded-md shadow-lg overflow-hidden"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id || index}
                className={cn(
                  "px-3 py-2.5 cursor-pointer text-sm transition-colors text-left",
                  "hover:bg-muted/50",
                  index === selectedIndex && "bg-muted"
                )}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {getSuggestionLabel(suggestion)}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </form>
  );
}
