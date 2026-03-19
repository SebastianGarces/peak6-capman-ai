export function ReviewCard({ scenarioText, responseText }: { scenarioText: string; responseText: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Scenario</h3>
        <p className="whitespace-pre-wrap text-sm">{scenarioText}</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Student Response (Anonymous)</h3>
        <p className="whitespace-pre-wrap text-sm">{responseText}</p>
      </div>
    </div>
  );
}
