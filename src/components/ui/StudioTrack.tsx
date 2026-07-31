type StudioTrackProps = {
  total: number;
  active?: number;
  results?: boolean[];
  label: string;
};

export function StudioTrack({ total, active, results, label }: StudioTrackProps) {
  const isResult = results !== undefined;

  return (
    <div
      className={`studio-track${isResult ? " studio-track--result" : ""}`}
      role={isResult ? "img" : "progressbar"}
      aria-label={label}
      aria-valuemin={isResult ? undefined : 1}
      aria-valuemax={isResult ? undefined : total}
      aria-valuenow={isResult ? undefined : active}
    >
      {Array.from({ length: total }, (_, index) => {
        const step = index + 1;
        const state = isResult
          ? results[index]
            ? "success"
            : "missed"
          : step < (active ?? 1)
            ? "done"
            : step === active
              ? "current"
              : "upcoming";

        return <span key={step} className={`studio-track__step studio-track__step--${state}`} />;
      })}
    </div>
  );
}
