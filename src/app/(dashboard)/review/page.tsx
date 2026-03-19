"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ReviewCard } from "@/components/review/review-card";
import { ReviewRubricForm } from "@/components/review/review-rubric-form";
import { getReviewableAttempt, submitPeerReview } from "@/actions/peer-review";

export default function ReviewPage() {
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadAttempt();
  }, []);

  async function loadAttempt() {
    setLoading(true);
    const data = await getReviewableAttempt();
    setAttempt(data);
    setLoading(false);
  }

  async function handleSubmit(scores: any) {
    if (!attempt) return;
    await submitPeerReview(attempt.attemptId, scores);
    setSubmitted(true);
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  if (!attempt) {
    return (
      <div>
        <PageHeader title="Peer Review" description="Review anonymized responses from other traders" />
        <p className="py-8 text-center text-muted-foreground">No responses available for review</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div>
        <PageHeader title="Peer Review" />
        <p className="py-8 text-center text-primary">Review submitted! +5 XP</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Peer Review" description="Review anonymized responses from other traders" />
      <div className="space-y-6">
        <ReviewCard scenarioText={attempt.scenarioText} responseText={attempt.responseText} />
        <ReviewRubricForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
