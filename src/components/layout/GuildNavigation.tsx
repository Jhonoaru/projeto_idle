import { Castle, Compass, Backpack, Store, Hammer, Users, BookOpen, Shield, Sparkles, Archive, Activity, Gift, Map, Trophy, Settings, type LucideIcon } from "lucide-react";
import type { MainPanelTab } from "./MainPanel";
import { useState } from "react";
const sections: { title: string; entries: [MainPanelTab, string, LucideIcon][] }[] = [
  { title: "AVENTURA", entries: [["central", "Central da guilda", Castle], ["hunts", "Explorar", Compass], ["home", "Combate", Shield], ["action", "Atividade atual", Activity]] },
  { title: "PERSONAGEM", entries: [["character", "Atributos", Users], ["inventory", "Inventario", Backpack], ["skills", "Habilidades", Sparkles], ["blessings", "Bencaos", Shield]] },
  { title: "RECURSOS", entries: [["market", "NPC e Bazar", Store], ["depot", "Deposito", Archive], ["forge", "Forja", Hammer], ["imbuing", "Imbuements", Sparkles]] },
  { title: "GUILDA", entries: [["recruitment", "Recrutamento", Users], ["headquarters", "Sede", Castle], ["daily", "Recompensa diaria", Gift], ["collections", "Colecoes", Trophy]] },
];
const extra: [MainPanelTab, string, LucideIcon][] = [["atlas", "Atlas", Map], ["bestiary", "Bestiario", BookOpen], ["focus", "Monster Focus", Compass], ["destiny", "Destino", Sparkles], ["proficiency", "Proficiencia", Shield], ["treasury", "Tesouraria", Archive], ["operations", "Operacoes", Map], ["logistics", "Logistica", Archive], ["projects", "Projetos", Hammer], ["staff", "Especialistas", Users], ["contracts", "Contratos", BookOpen], ["armory", "Arsenal", Shield], ["store", "Visuais", Sparkles], ["ranking", "Ranking local", Trophy], ["wiki", "Guia", BookOpen], ["updates", "Novidades", BookOpen], ["settings", "Configuracoes", Settings]];
export function GuildNavigation({ activeTab, onOpenTab }: { activeTab: MainPanelTab; onOpenTab: (tab: MainPanelTab) => void }) {
  const [expanded, setExpanded] = useState(false);
  const link = ([tab, label, Icon]: [MainPanelTab, string, LucideIcon]) => <button key={tab} aria-current={activeTab === tab ? "page" : undefined} onClick={() => { onOpenTab(tab); setExpanded(false); }}><Icon size={17} aria-hidden="true" /><span>{label}</span></button>;
  return <nav className="guild-navigation" aria-label="Sistemas da guilda" data-expanded={expanded}><button className="navigation-toggle" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><Compass size={18} />Navegar pela guilda</button>{sections.map(section => <section key={section.title}><h2>{section.title}</h2>{section.entries.map(link)}</section>)}<details open={extra.some(([tab]) => tab === activeTab) || undefined}><summary>Mais sistemas</summary>{extra.map(link)}</details></nav>;
}
