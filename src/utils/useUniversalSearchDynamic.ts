
import {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
  } from "react";
  import { useRouter, useSearchParams } from "next/navigation";
  import useDebounce from "@/hooks/useDebounce";
  import {
    Suggestion,
    UseSearchWithSuggestionsProps,
    UseSearchWithSuggestionsReturn,
  } from "@/utils/searchType"
  
  export function useSearchWithSuggestions({
    fetchSuggestionsApi,
    fetchSearchResultsApi,
    defaultFetchApi,
    getSuggestionValue = (s) => s.name,
    debounceTime = 500,
    maxSuggestions = 6,
    onError,
    initialQuery,
  }: UseSearchWithSuggestionsProps): UseSearchWithSuggestionsReturn {
    const router = useRouter();
    const searchParams = useSearchParams();
  
    const [searchQuery, setSearchQuery] = useState(initialQuery || "");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
  
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const debouncedQuery = useDebounce(searchQuery, debounceTime);
    const previousQueryRef = useRef<string>("");
    const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState(false);

    const NOT_FOUND_SUGGESTION: Suggestion = {
      id: "__not_found__",
      name: "No results found",
      question: "No results found",
      title:"No results found",
    };
  
    const safeApiCall = useCallback(
      async <T,>(apiFn: () => Promise<T>, fallback: T): Promise<T> => {
        try {
          return await apiFn();
        } catch (err) {
          console.error("API Error:", err);
          onError?.(err);
          return fallback;
        }
      },
      [onError]
    );
  
    const updateURL = useCallback(
      (query: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (query.trim()) params.set("search", query.trim());
        else params.delete("search");
        const newURL = params.toString()
          ? `?${params.toString()}`
          : window.location.pathname;
        router.replace(newURL, { scroll: false });
      },
      [router, searchParams]
    );
  
    useEffect(() => {
      const urlQuery = searchParams.get("search")?.trim() || initialQuery || "";
      setSearchQuery(urlQuery);
      (async () => {
        if (urlQuery) {
          previousQueryRef.current = urlQuery;
          await safeApiCall(() => fetchSearchResultsApi(urlQuery), []);
        } else {
          await safeApiCall(() => defaultFetchApi?.() ?? Promise.resolve([]), []);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
      if (debouncedQuery.trim()) {
        setHasFetchedSuggestions(false);
  
        safeApiCall(() => fetchSuggestionsApi(debouncedQuery), [])
          .then((data) => {
            if (data.length === 0) {
              setSuggestions([NOT_FOUND_SUGGESTION]);
            } else {
              setSuggestions(data);
            }
            setHasFetchedSuggestions(true);
            // Keep dropdown open if input is focused
            if (inputRef.current === document.activeElement) {
              setShowSuggestions(true);
            }
          });
      } else {
        setSuggestions([]);
        setHasFetchedSuggestions(false);
        setShowSuggestions(false);
      }
  
      setSelectedIndex(-1);
    }, [debouncedQuery, fetchSuggestionsApi, safeApiCall]);
  
    
    const filteredSuggestions = useMemo(
      () => suggestions.slice(0, maxSuggestions),
      [suggestions, maxSuggestions]
    );
  
    const clearSearch = useCallback(() => {
      setSearchQuery("");
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setSuggestions([]);
      updateURL("");
      safeApiCall(() => defaultFetchApi?.() ?? Promise.resolve([]), []);
      previousQueryRef.current = "";
    }, [updateURL, defaultFetchApi, safeApiCall]);
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      setSelectedIndex(-1);
  
      if (!value.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        updateURL("");
  
        // 🔹 FIX: all data load when input is cleared
      safeApiCall(() => defaultFetchApi?.() ?? Promise.resolve([]), []);
      previousQueryRef.current = "";
      } else {
        setShowSuggestions(true);
      }
    };
  
    const handleSuggestionClick = async (suggestion: Suggestion) => {
      const value = getSuggestionValue(suggestion);
      setSearchQuery(value);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      updateURL(value);
      previousQueryRef.current = value;
      await safeApiCall(() => fetchSearchResultsApi(value), []);
    };
    
  
    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || filteredSuggestions.length === 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          const trimmed = searchQuery.trim();
          updateURL(trimmed);
          if (trimmed && trimmed !== previousQueryRef.current) {
            previousQueryRef.current = trimmed;
            await safeApiCall(() => fetchSearchResultsApi(trimmed), []);
          } else {
            await safeApiCall(() => defaultFetchApi?.() ?? Promise.resolve([]), []);
          }
        }
        if (e.key === "Escape") {
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        return;
      }
  
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
            await handleSuggestionClick(filteredSuggestions[selectedIndex]);
          } else {
            const trimmed = searchQuery.trim();
            updateURL(trimmed);
            setShowSuggestions(false);
            if (trimmed && trimmed !== previousQueryRef.current) {
              previousQueryRef.current = trimmed;
              await safeApiCall(() => fetchSearchResultsApi(trimmed), []);
            } else {
              await safeApiCall(() => defaultFetchApi?.() ?? Promise.resolve([]), []);
            }
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    };
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    return {
      searchQuery,
      showSuggestions,
      filteredSuggestions,
      selectedIndex,
      inputRef,
      suggestionsRef,
      handleInputChange,
      handleKeyDown,
      handleSuggestionClick,
      clearSearch,
      setSelectedIndex,
      setShowSuggestions,
      setSearchQuery,
      hasFetchedSuggestions, 
    };
  }