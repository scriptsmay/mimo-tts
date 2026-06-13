"use client";

interface AppShellProps {
  sidebar: React.ReactNode;
  topBar: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, topBar, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 border-r border-[var(--card-border)] bg-[var(--sidebar)] flex flex-col">
        {sidebar}
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        {topBar}
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
