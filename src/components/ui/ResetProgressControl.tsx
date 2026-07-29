import { useId, useState } from "react";
import { AppButton } from "./AppButton";

export type ResetProgressControlProps = {
  confirmationMessage: string;
  onConfirm: () => void;
};

export function ResetProgressControl({ confirmationMessage, onConfirm }: ResetProgressControlProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmationTitleId = useId();

  if (!isConfirming) {
    return (
      <AppButton tone="cream" onClick={() => setIsConfirming(true)}>
        Réinitialiser
      </AppButton>
    );
  }

  return (
    <div className="reset-confirmation" role="alertdialog" aria-labelledby={confirmationTitleId}>
      <p className="reset-confirmation__text" id={confirmationTitleId}>
        {confirmationMessage}
      </p>
      <div className="button-row">
        <AppButton
          tone="plum"
          autoFocus
          onClick={() => {
            onConfirm();
            setIsConfirming(false);
          }}
        >
          Confirmer la réinitialisation
        </AppButton>
        <AppButton tone="cream" onClick={() => setIsConfirming(false)}>
          Annuler
        </AppButton>
      </div>
    </div>
  );
}
