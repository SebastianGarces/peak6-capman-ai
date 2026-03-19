import { PageHeader } from "@/components/layout/page-header";

export default function StudentsPage() {
  return (
    <div>
      <PageHeader title="Students" description="View all learners" />
      <p className="text-muted-foreground">Click a learner in the heatmap to view their details.</p>
    </div>
  );
}
