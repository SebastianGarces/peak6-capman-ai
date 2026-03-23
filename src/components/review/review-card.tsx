import { Badge } from "@/components/ui/badge";
import { FileText, MessageSquare } from "lucide-react";

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
      {/* Scenario block */}
      <div className="bg-surface border border-primary/10 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <Badge variant="default" className="text-[10px] uppercase tracking-wider font-bold">
            Scenario
          </Badge>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text/90">
          {scenarioText}
        </p>
        {questionPrompt && (
          <div className="rounded-lg border border-primary/20 bg-primary-muted p-3">
            <p className="text-sm font-medium text-primary">{questionPrompt}</p>
          </div>
        )}
      </div>

      {/* Student response block */}
      <div className="bg-surface border border-surface-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-violet-400" />
          <Badge variant="default" className="text-[10px] uppercase tracking-wider font-bold">
            Student Response
          </Badge>
          <span className="ml-auto text-xs text-text-muted italic">Anonymous</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text/80">
          {responseText}
        </p>
      </div>
    </div>
  );
}
