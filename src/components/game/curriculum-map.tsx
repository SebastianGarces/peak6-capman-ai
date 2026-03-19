import Link from "next/link";

interface Level {
  id: number;
  levelNumber: number;
  name: string;
  description: string;
  objectiveCount: number;
}

interface CurriculumMapProps {
  levels: Level[];
  currentLevel: number;
}

export function CurriculumMap({ levels, currentLevel }: CurriculumMapProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {levels.map((level) => {
        const isUnlocked = level.levelNumber <= currentLevel;
        const isCurrent = level.levelNumber === currentLevel;

        const cardContent = (
          <div
            data-testid={`level-card-${level.levelNumber}`}
            className={[
              "rounded-lg border p-4 transition-all",
              isUnlocked
                ? "border-border bg-card text-card-foreground hover:border-primary/50"
                : "border-border/40 bg-card/50 text-muted-foreground opacity-60",
              isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Level {level.levelNumber}
              </span>
              {!isUnlocked && (
                <span className="text-muted-foreground" aria-label="Locked">
                  🔒
                </span>
              )}
              {isCurrent && (
                <span className="text-xs font-medium text-primary">Current</span>
              )}
            </div>
            <h3 className="mt-2 font-semibold">{level.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {level.description}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {level.objectiveCount} skill objective{level.objectiveCount !== 1 ? "s" : ""}
            </p>
          </div>
        );

        if (isUnlocked) {
          return (
            <Link key={level.id} href={`/learn/${level.id}`}>
              {cardContent}
            </Link>
          );
        }

        return <div key={level.id}>{cardContent}</div>;
      })}
    </div>
  );
}
