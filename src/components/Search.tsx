import { Search as SearchIcon } from "lucide-react";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Search({ value, onChange }: SearchProps) {
  return (
    <div className="flex items-center gap-3 w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-gray-900 dark:text-zinc-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-400 dark:focus-within:ring-gray-600 focus-within:border-transparent transition-all">
      <SearchIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500 shrink-0" />
      <input
        type="text"
        placeholder="Search snippets..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
      />
    </div>
  );
}
