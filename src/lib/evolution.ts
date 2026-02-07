import type { StageName, EvolutionStage } from "@/types";

/**
 * Evolution stages with their level requirements
 */
export const EVOLUTION_STAGES: EvolutionStage[] = [
  { stage: "egg", requiredLevel: 1 },
  { stage: "sproutling", requiredLevel: 3 },
  { stage: "blooming", requiredLevel: 8 },
  { stage: "fullyGrown", requiredLevel: 15 },
];

/**
 * Get the evolution stage for a given level
 */
export function getStageForLevel(level: number): StageName {
  // Find the highest stage the player qualifies for
  for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
    if (level >= EVOLUTION_STAGES[i].requiredLevel) {
      return EVOLUTION_STAGES[i].stage;
    }
  }
  return "egg";
}

/**
 * Check if a level-up triggers evolution
 */
export function checkEvolution(oldLevel: number, newLevel: number): boolean {
  const oldStage = getStageForLevel(oldLevel);
  const newStage = getStageForLevel(newLevel);
  return oldStage !== newStage;
}

/**
 * Get the image path for a stage
 */
export function getStageImagePath(stage: StageName): string {
  const stageMap: Record<StageName, string> = {
    egg: "/img/level_1_egg.png",
    sproutling: "/img/level_2_sproutling.png",
    blooming: "/img/level_3_blooming.png",
    fullyGrown: "/img/level_4_fullygrown.png",
  };
  return stageMap[stage];
}
