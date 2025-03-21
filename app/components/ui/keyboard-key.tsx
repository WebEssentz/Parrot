export function KeyboardKey({ children }: { children: React.ReactNode }) {
  const text = children?.toString() ?? '';
  const width = text.length > 1 ? "min-w-[50px]" : "min-w-[32px]";
  
  return (
    <div className={`my-2 flex h-8 items-center justify-center rounded-md border border-token-border-light capitalize text-token-text-secondary ${width}`}>
      <span className={text.length > 1 ? "text-xs" : "text-sm"}>
        {children}
      </span>
    </div>
  );
}