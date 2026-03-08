import {
  Archive,
  Clock3,
  FolderKanban,
  Layers,
  Star,
  Workflow
} from "lucide-react";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PromptScope } from "@/types/prompt";

type SidebarProps = {
  scope: PromptScope;
  onScopeChange: (scope: PromptScope) => void;
  smartViews: Array<{ id: string; label: string; action: () => void }>;
  collapsed?: boolean;
};

const navItems: Array<{
  id: PromptScope;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "all", label: "All Prompts", icon: Layers },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "recent", label: "Recent", icon: Clock3 },
  { id: "collections", label: "Collections", icon: FolderKanban },
  { id: "drafts", label: "Drafts", icon: Workflow },
  { id: "archived", label: "Archived", icon: Archive }
];

export function Sidebar({
  scope,
  onScopeChange,
  smartViews,
  collapsed = false
}: SidebarProps){
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/80 bg-[#0f1317] transition-all",
        collapsed ? "w-0 overflow-hidden" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b border-border/70 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary">
          <Layers className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <p className="text-sm font-semibold">Prompt Workspace</p>
          <p className="text-[11px] text-muted-foreground">Local-first library</p>
        </div>
      </div>

      <nav className="space-y-1 px-2 py-3">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onScopeChange(id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition",
              scope === id ? "bg-accent text-foreground" : "hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-3 border-t border-border/70 px-2 pt-3">
        <p className="px-3 text-[11px] uppercase tracking-wide text-muted-foreground">Smart Views</p>
        <div className="mt-2 space-y-1">
          {smartViews.map((view) => (
            <Button
              key={view.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
              onClick={view.action}
            >
              {view.label}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}
