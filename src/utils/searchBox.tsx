"use client";
import React, { useEffect } from "react";
import { useSearchWithSuggestions } from "@/utils/useUniversalSearchDynamic";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Suggestion,SearchBoxProps } from "@/utils/searchType";

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
    hasFetchedSuggestions,
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
    maxSuggestions: 50, // Increased to show more suggestions
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
              className={cn(inputWidth, "bg-background-secondary")}
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
            className="bg-white border border-border rounded-md shadow-lg overflow-hidden max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id || index}
                className={cn(
                  "px-3 py-2.5 text-sm text-left",
                  suggestion.id === "__not_found__"
                    ? "text-gray-400 cursor-default"
                    : "cursor-pointer hover:bg-muted/50",
                  index === selectedIndex &&
                    suggestion.id !== "__not_found__" &&
                    "bg-muted"
                )}
                onClick={() =>
                  suggestion.id !== "__not_found__" &&
                  handleSuggestionClick(suggestion)
                }
                onMouseEnter={() =>
                  suggestion.id !== "__not_found__" && setSelectedIndex(index)
                }
              >
                  {getSuggestionLabel(suggestion)}
              </div>
            ))}

            {/* Optional: empty fallback (safety) */}
            {hasFetchedSuggestions &&
              filteredSuggestions.length === 0 && (
                <div className="px-3 py-2.5 text-sm text-gray-400 text-center cursor-default">
                  No results found
                </div>
              )}
          </div>
        </PopoverContent>
      </Popover>
    </form>
  );
}
