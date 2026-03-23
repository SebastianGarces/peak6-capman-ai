import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface border border-surface-border text-text-muted",
        primary: "bg-primary-muted text-primary border border-primary/20",
        lavender: "bg-lavender-muted text-lavender border border-lavender/20",
        amber: "bg-amber-muted text-amber border border-amber/20",
        orange: "bg-orange-muted text-orange border border-orange/20",
        green: "bg-green-muted text-green border border-green/20",
        red: "bg-red-muted text-red border border-red/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
