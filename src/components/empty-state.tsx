import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onReset: () => void;
};

export function EmptyState({ onReset }: EmptyStateProps){
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card">
        <SearchX className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-semibold">No prompts match your filters</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Try widening search terms, removing a few chips, or resetting to your full library.
      </p>
      <Button className="mt-4" variant="secondary" onClick={onReset}>
        Clear search & filters
      </Button>
    </div>
  );
}
