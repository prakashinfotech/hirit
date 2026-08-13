import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, X, ChevronDown, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';

// Popular Indian cities for autocomplete suggestions
const POPULAR_CITIES = [
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Noida',
  'Gurugram',
  'Chandigarh',
  'Kochi',
  'Indore',
  'Remote',
];

const EXPERIENCE_OPTIONS = [
  { label: 'Fresher (0 yrs)', value: '0' },
  { label: '1 year', value: '1' },
  { label: '2 years', value: '2' },
  { label: '3 years', value: '3' },
  { label: '4 years', value: '4' },
  { label: '5 years', value: '5' },
  { label: '6 years', value: '6' },
  { label: '7 years', value: '7' },
  { label: '8 years', value: '8' },
  { label: '9 years', value: '9' },
  { label: '10+ years', value: '10' },
];

interface SearchBarProps {
  /** Controls visual size. 'lg' is the full hero variant; 'sm' is the compact variant for the search page. */
  size?: 'lg' | 'sm';
  /** Called when the user submits a search. */
  onSearch?: (keyword: string, location: string) => void;
  /** Pre-populate the keyword field. */
  defaultKeyword?: string;
  /** Pre-populate the location field. */
  defaultLocation?: string;
  className?: string;
}

export default function SearchBar({
  size = 'lg',
  onSearch,
  defaultKeyword = '',
  defaultLocation = '',
  className,
}: SearchBarProps) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [location, setLocation] = useState(defaultLocation);
  const [experience, setExperience] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showExpDropdown, setShowExpDropdown] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const expDropdownRef = useRef<HTMLDivElement>(null);

  const isCompact = size === 'sm';

  // Sync props -> local state when defaults change (e.g., URL-driven)
  useEffect(() => {
    setKeyword(defaultKeyword);
  }, [defaultKeyword]);

  useEffect(() => {
    setLocation(defaultLocation);
  }, [defaultLocation]);

  // Filter city suggestions based on input
  useEffect(() => {
    if (!location.trim()) {
      setLocationSuggestions(POPULAR_CITIES.slice(0, 6));
    } else {
      const filtered = POPULAR_CITIES.filter((city) =>
        city.toLowerCase().startsWith(location.toLowerCase()),
      );
      setLocationSuggestions(filtered.slice(0, 6));
    }
  }, [location]);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        locationInputRef.current !== e.target
      ) {
        setShowSuggestions(false);
      }
      if (
        expDropdownRef.current &&
        !expDropdownRef.current.contains(e.target as Node)
      ) {
        setShowExpDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setShowExpDropdown(false);
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    if (experience) params.set('experience_min', experience);
    onSearch?.(keyword.trim(), location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const selectCity = (city: string) => {
    setLocation(city);
    setShowSuggestions(false);
    locationInputRef.current?.blur();
  };

  const clearKeyword = () => setKeyword('');
  const clearLocation = () => {
    setLocation('');
    locationInputRef.current?.focus();
  };

  const selectedExpLabel = experience
    ? EXPERIENCE_OPTIONS.find((o) => o.value === experience)?.label ?? 'Experience'
    : 'Experience';

  if (isCompact) {
    // Compact variant for JobSearch page top bar
    return (
      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex w-full overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-sm',
          'h-12',
          className,
        )}
        role="search"
      >
        {/* Keyword field */}
        <div className="relative flex flex-1 min-w-0 items-center gap-2 border-r border-[#e0e0e0] px-3">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search jobs…"
            aria-label="Job keyword"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#333333] placeholder-gray-400 outline-none"
          />
          {keyword && (
            <button
              type="button"
              onClick={clearKeyword}
              aria-label="Clear keyword"
              className="shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Location field */}
        <div className="relative flex items-center">
          <div className="flex w-40 items-center gap-2 border-r border-[#e0e0e0] px-3">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              ref={locationInputRef}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="City"
              aria-label="Location"
              className="flex-1 bg-transparent text-sm text-[#333333] placeholder-gray-400 outline-none"
            />
            {location && (
              <button type="button" onClick={clearLocation} className="text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {showSuggestions && locationSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-[#e0e0e0] bg-white py-1 shadow-lg"
            >
              {locationSuggestions.map((city) => (
                <button
                  key={city}
                  type="button"
                  onMouseDown={() => selectCity(city)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm text-[#333333] hover:bg-[#f5f5f5]',
                    location === city && 'bg-blue-50 font-medium text-[#2563eb]',
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="shrink-0 bg-[#2563eb] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none"
        >
          Search
        </button>
      </form>
    );
  }

  // Large hero variant — 3 fields: keyword | location | experience + purple search button
  // Displayed as rounded-full pill bar matching foundit.in hero
  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-full overflow-hidden rounded-full bg-white shadow-lg',
        className,
      )}
      role="search"
    >
      {/* Keyword field — flex grow */}
      <div className="relative flex flex-1 items-center gap-3 border-r border-[#e0e0e0] px-5 py-3.5 min-w-[320px]">
        <Search className="h-5 w-5 shrink-0 text-gray-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search by Skills, Company or Job Title"
          aria-label="Job keyword"
          className="flex-1 bg-transparent text-sm text-[#333333] placeholder-gray-400 outline-none"
        />
        {keyword && (
          <button
            type="button"
            onClick={clearKeyword}
            aria-label="Clear keyword"
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Location field — 25% */}
      <div className="relative flex items-center border-r border-[#e0e0e0]">
        <div className="flex w-36 items-center gap-2 px-4 py-3.5">
          <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            ref={locationInputRef}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Location"
            aria-label="Location"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            className="flex-1 bg-transparent text-sm text-[#333333] placeholder-gray-400 outline-none min-w-0"
          />
          {location && (
            <button
              type="button"
              onClick={clearLocation}
              aria-label="Clear location"
              className="shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Location autocomplete dropdown */}
        {showSuggestions && locationSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            role="listbox"
            aria-label="City suggestions"
            className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-[#e0e0e0] bg-white py-1 shadow-lg"
          >
            {locationSuggestions.map((city) => (
              <button
                key={city}
                type="button"
                role="option"
                aria-selected={location === city}
                onMouseDown={() => selectCity(city)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm text-[#333333] transition-colors hover:bg-[#f5f5f5]',
                  location === city && 'bg-blue-50 font-medium text-[#2563eb]',
                )}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Experience dropdown — 25% */}
      <div className="relative" ref={expDropdownRef}>
        <button
          type="button"
          onClick={() => setShowExpDropdown((v) => !v)}
          className="flex h-full w-36 items-center gap-2 px-4 py-3.5 hover:bg-gray-50"
        >
          <Briefcase className="h-5 w-5 shrink-0 text-gray-400" />
          <span
            className={cn(
              'flex-1 text-left text-sm',
              experience ? 'text-[#333333]' : 'text-gray-400',
            )}
          >
            {selectedExpLabel}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-gray-400 transition-transform',
              showExpDropdown && 'rotate-180',
            )}
          />
        </button>

        {showExpDropdown && (
          <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-[#e0e0e0] bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => { setExperience(''); setShowExpDropdown(false); }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm hover:bg-[#f5f5f5]',
                !experience ? 'font-semibold text-[#2563eb]' : 'text-[#333333]',
              )}
            >
              Any experience
            </button>
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setExperience(opt.value); setShowExpDropdown(false); }}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-[#f5f5f5]',
                  experience === opt.value
                    ? 'bg-blue-50 font-semibold text-[#2563eb]'
                    : 'text-[#333333]',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submit button — purple pill */}
      <button
        type="submit"
        className="shrink-0 rounded-full bg-[#2563eb] my-1.5 mr-1.5 px-7 text-sm font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-1"
      >
        Search
      </button>
    </form>
  );
}
