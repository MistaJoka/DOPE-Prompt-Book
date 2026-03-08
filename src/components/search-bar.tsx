import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type SearchBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function SearchBar({ query, onQueryChange }: SearchBarProps){
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search prompts, tags, collections..."
        className="h-10 border-border/70 bg-card pl-9"
      />
    </div>
  );
}
