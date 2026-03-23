import { DiagonalStreaks } from "@/components/decorative/diagonal-streaks";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <DiagonalStreaks variant="hero" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
