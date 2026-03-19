import { Badge } from "@/components/ui/badge";

export function ReviewCard({
  scenarioText,
  responseText,
  questionPrompt,
}: {
  scenarioText: string;
  responseText: string;
  questionPrompt?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-5 space-y-2">
        <Badge variant="secondary" className="mb-2">SCENARIO</Badge>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{scenarioText}</p>
        {questionPrompt && (
          <p className="mt-3 text-sm font-medium text-primary">{questionPrompt}</p>
        )}
      </div>
      <div className="glass-card rounded-xl p-5 space-y-2">
        <Badge variant="secondary" className="mb-2">STUDENT RESPONSE</Badge>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{responseText}</p>
      </div>
    </div>
  );
}
