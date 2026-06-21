type ProgressStatus = "complete" | "current" | "missed";

const progressMarks: Record<ProgressStatus, string> = {
  complete: "✅",
  current: "🟡",
  missed: "🔴",
};

export type ProgressChipProps = {
  label: string;
  status: ProgressStatus;
};

export function ProgressChip({ label, status }: ProgressChipProps) {
  return <span className={`progress-chip progress-chip--${status}`}>{`${label} ${progressMarks[status]}`}</span>;
}
