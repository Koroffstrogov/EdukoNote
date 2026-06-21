import { AppCard } from "./AppCard";

type FeedbackStatus = "success" | "near";

const feedbackCopy: Record<FeedbackStatus, { title: string; icon: string; tone: "mint" | "vanilla" }> = {
  success: {
    title: "Bravo !",
    icon: "✓",
    tone: "mint",
  },
  near: {
    title: "Presque !",
    icon: "•",
    tone: "vanilla",
  },
};

export type FeedbackCardProps = {
  status: FeedbackStatus;
  children: string;
};

export function FeedbackCard({ status, children }: FeedbackCardProps) {
  const feedback = feedbackCopy[status];

  return (
    <AppCard tone={feedback.tone} className={`feedback-card feedback-card--${status}`}>
      <span className="feedback-card__badge" aria-hidden="true">
        {feedback.icon}
      </span>
      <span>
        <h3 className="feedback-card__title">{feedback.title}</h3>
        <p className="feedback-card__message">{children}</p>
      </span>
    </AppCard>
  );
}
