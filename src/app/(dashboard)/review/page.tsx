"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ReviewCard } from "@/components/review/review-card";
import { ReviewRubricForm } from "@/components/review/review-rubric-form";
import { getReviewableAttempt, submitPeerReview } from "@/actions/peer-review";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp, scaleIn } from "@/lib/motion";
import { MessageSquare, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Peer Review"
        description="Review anonymized responses from other traders"
        icon={MessageSquare}
      />

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </motion.div>
        )}

        {!loading && !attempt && !submitted && (
          <motion.div
            key="empty"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-surface border border-surface-border rounded-xl p-12 text-center"
          >
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-text-dim" />
            <p className="text-lg font-medium mb-1">No responses to review right now</p>
            <p className="text-sm text-text-muted">Check back later</p>
          </motion.div>
        )}

        {!loading && attempt && !submitted && (
          <motion.div
            key="review"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <ReviewCard
              scenarioText={attempt.scenarioText}
              responseText={attempt.responseText}
              questionPrompt={attempt.questionPrompt}
            />
            <ReviewRubricForm onSubmit={handleSubmit} />
          </motion.div>
        )}

        {submitted && (
          <motion.div
            key="success"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="bg-surface border border-surface-border rounded-xl p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green" />
            </motion.div>
            <p className="text-2xl font-bold text-gradient-streak mb-2">Well done!</p>
            <p className="text-sm text-text-muted mb-4">Your peer review has been submitted.</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-muted px-4 py-1.5 text-sm font-semibold text-amber">
              +5 XP
            </span>
            <div className="mt-6">
              <Button
                variant="link"
                onClick={() => { setSubmitted(false); loadAttempt(); }}
              >
                Review another response
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
