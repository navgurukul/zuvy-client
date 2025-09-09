export interface Suggestion {
    id: string | number;
    [key: string]: any;
  }
  
  export  interface UseSearchWithSuggestionsProps {
    fetchSuggestionsApi: (query: string) => Promise<Suggestion[]>;
    fetchSearchResultsApi: (query: string) => Promise<any>;
    defaultFetchApi?: () => Promise<any>;
    getSuggestionValue?: (suggestion: Suggestion) => string;
    debounceTime?: number;
    maxSuggestions?: number;
    onError?: (error: unknown) => void;
    initialQuery?: string;
  }
  
  export  interface UseSearchWithSuggestionsReturn {
    searchQuery: string;
    showSuggestions: boolean;
    filteredSuggestions: Suggestion[];
    selectedIndex: number;
    inputRef: React.RefObject<HTMLInputElement>;
    suggestionsRef: React.RefObject<HTMLDivElement>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => Promise<void>;
    handleSuggestionClick: (suggestion: Suggestion) => Promise<void>;
    clearSearch: () => void;
    setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
    setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  }
 

  export interface SearchBoxProps {
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