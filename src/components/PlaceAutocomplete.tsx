'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Module-level cache shared across all instances — survives re-renders
const suggestionsCache = new Map<string, any[]>();

export interface PlaceAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export function PlaceAutocomplete({
  value,
  onChange,
  placeholder = 'Enter location...',
  className,
  icon,
  required = false,
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync prop value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!query || query === value) {
      setSuggestions([]);
      return;
    }

    // Cache hit — instant, no loading state
    const cacheKey = query.toLowerCase().trim();
    if (suggestionsCache.has(cacheKey)) {
      setSuggestions(suggestionsCache.get(cacheKey)!);
      setIsOpen(true);
      return;
    }

    const fetchPlaces = async () => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      try {
        const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          },
          body: JSON.stringify({
            input: query,
            includedRegionCodes: ['IS'],
          }),
          signal: abortRef.current.signal,
        });
        const data = await res.json();
        const results = data.suggestions ?? [];
        suggestionsCache.set(cacheKey, results);
        setSuggestions(results);
        if (results.length > 0) setIsOpen(true);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching places:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // 150ms debounce — fast enough to feel instant, slow enough to batch keystrokes
    const debounceTimer = setTimeout(fetchPlaces, 150);
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [query, value]);

  const handleSelect = (suggestion: any) => {
    const mainText = suggestion.placePrediction.text.text;
    const secText = suggestion.placePrediction.text.secondaryText || '';
    const fullText = secText ? `${mainText}, ${secText}` : mainText;
    
    setQuery(fullText);
    onChange(fullText);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5 z-10 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={query}
          required={required}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={cn(
            'w-full h-12 rounded-lg transition-all text-sm font-medium focus:outline-none',
            icon ? 'pl-12 pr-4' : 'px-4',
            className
          )}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-4 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <ul className="max-h-64 overflow-y-auto py-2 custom-scrollbar">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onMouseDown={(e) => {
                  // Prevent input blur before click registers
                  e.preventDefault();
                }}
                onClick={() => handleSelect(s)}
                className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer flex flex-col transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
              >
                <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {s.placePrediction.text.text}
                </span>
                {s.placePrediction.text.secondaryText && (
                  <span className="text-xs text-slate-500 truncate mt-0.5">
                    {s.placePrediction.text.secondaryText}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
