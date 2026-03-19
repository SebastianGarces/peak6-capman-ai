export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel — desktop only */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12"
        style={{
          background: "linear-gradient(to bottom right, hsl(222,47%,8%), hsl(222,30%,4%))",
        }}
      >
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gradient-primary mb-4">CapMan AI</h1>
          <p className="text-muted-foreground text-lg max-w-xs">
            Gamified options trading training powered by AI
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
