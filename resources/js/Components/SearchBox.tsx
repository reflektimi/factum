import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    type: string;
    url: string;
    status: string | null;
}

export default function SearchBox() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length > 2) {
                performSearch(query);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const performSearch = async (searchQuery: string) => {
        setLoading(true);
        try {
            const response = await axios.get(route('global.search'), {
                params: { query: searchQuery }
            });
            setResults(response.data);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {loading ? (
                    <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                ) : (
                    <Search className="h-4 w-4 text-slate-400" />
                )}
            </div>
            <input
                type="search"
                placeholder="Search invoices, clients... (e.g. 'INV-001')"
                className="block w-full rounded-lg border-0 bg-slate-100 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-body"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                    if (query.length > 2) setShowResults(true);
                }}
            />

            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50">
                    <div className="max-h-96 overflow-y-auto">
                        {results.map((result, index) => (
                            <Link
                                key={`${result.type}-${result.id}-${index}`}
                                href={result.url}
                                className="block px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                onClick={() => setShowResults(false)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-slate-900 text-sm">{result.title}</div>
                                        <div className="text-xs text-slate-500">{result.subtitle}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {result.type}
                                        </span>
                                        {result.status && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${
                                                result.status === 'paid' || result.status === 'completed' || result.status === 'active' ? 'bg-green-100 text-green-700' :
                                                result.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {result.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            
            {showResults && query.length > 2 && results.length === 0 && !loading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 p-4 text-center text-sm text-slate-500 z-50">
                    No results found for "{query}"
                </div>
            )}
        </div>
    );
}
