import { AppShell } from "@/components/app-shell";
import { getPromptRuntimeConfig } from "@/lib/prompt-runtime";

export default function Home() {
  return <AppShell runtimeConfig={getPromptRuntimeConfig()} />;
}
