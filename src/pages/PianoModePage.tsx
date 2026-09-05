import { ExercisePageLayout } from "../components/exercise/ExercisePageLayout";
import { AuroraMenuIcon } from "../components/ui/AuroraMenuIcon";
import { HomeActionCard } from "../components/ui/HomeActionCard";

export function PianoModePage() {
  return (
    <ExercisePageLayout
      eyebrow="Piano"
      title="Choisis ton mode"
      className="piano-mode-page"
      navLabel="Accueil"
    >
      <section className="piano-mode-page__choices" aria-label="Modes Piano">
        <HomeActionCard
          title="Jeu libre"
          text="Joue à ton rythme"
          icon={<AuroraMenuIcon name="piano" />}
          href="/piano/play"
          tone="rose"
          featured
        />
        <HomeActionCard
          title="Trouve la note"
          text="Lis la portée et trouve la touche"
          icon={<AuroraMenuIcon name="note" />}
          href="/exercise?mode=piano"
          tone="lavender"
        />
      </section>
    </ExercisePageLayout>
  );
}
