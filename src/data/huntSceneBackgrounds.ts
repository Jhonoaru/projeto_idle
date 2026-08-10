export interface HuntSceneBackgroundDefinition {
  src: string;
  className: string;
  label: string;
  source: "generated-original";
}

const generatedBackground = (
  fileName: string,
  className: string,
  label: string,
): HuntSceneBackgroundDefinition => ({
  src: `/assets/environments/generated/${fileName}.jpg`,
  className,
  label,
  source: "generated-original",
});

const sewerCellar = generatedBackground("sewer-cellar", "scene-cave", "Thaeron undercity");

export const huntSceneBackgrounds: Record<string, HuntSceneBackgroundDefinition> = {
  "hunt-sewers-thaeron": sewerCellar,
  "hunt-cave-spider-cellar": sewerCellar,
  "hunt-trollwood-camp": generatedBackground("trollwood-camp", "scene-forest", "Trollwood camp"),
  "hunt-mudrot-cave": generatedBackground("mudrot-grotto", "scene-swamp", "Mudrot grotto"),
  "hunt-minotaur-outpost": generatedBackground("minotaur-outpost", "scene-outpost", "Minotaur outpost"),
  "hunt-ancient-crypt": generatedBackground("ancient-crypt", "scene-dungeon", "Ancient crypt"),
  "hunt-cyclops-hills": generatedBackground("cyclops-hills", "scene-mountain", "Khazgrim highlands"),
  "hunt-ember-dragon-nest": generatedBackground("ember-dragon-nest", "scene-volcanic", "Ember dragon nest"),
};

export function getHuntSceneBackground(huntId?: string) {
  return huntId ? huntSceneBackgrounds[huntId] : undefined;
}
