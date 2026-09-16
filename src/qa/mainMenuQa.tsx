import { useState } from "react";
import { createRoot } from "react-dom/client";
import { MainMenu } from "../components/menu/MainMenu";
import { createNewGame } from "../game-engine/new-game/createNewGame";

function Preview() {
  const [result, setResult] = useState("");
  return result ? <main><h1>QA sem persistencia</h1><p>{result}</p><button onClick={() => setResult("")}>Voltar ao teste</button></main>
    : <MainMenu hasSave={false} guildName="" loading={false} unavailable={false} onContinue={() => {}}
      onNewGame={async (guild, hero, choice) => {
        const state = createNewGame(guild, hero, choice);
        setResult(`${state.guild.name}: ${state.characters[0].name}, ${state.characters[0].vocation}, nivel ${state.characters[0].level}, ${state.characters.length} personagem, ${state.guild.gold} gold. Nenhum save gravado.`);
      }} />;
}
createRoot(document.getElementById("root")!).render(<Preview />);
