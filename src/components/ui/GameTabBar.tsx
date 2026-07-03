interface GameTabBarProps<T extends string> {
  tabs: Array<{ id: T; label: string }>;
  activeTab: T;
  onChangeTab: (tab: T) => void;
}

export function GameTabBar<T extends string>({
  tabs,
  activeTab,
  onChangeTab,
}: GameTabBarProps<T>) {
  return (
    <div className="game-tab-bar">
      {tabs.map((tab) => (
        <button
          className={activeTab === tab.id ? "is-selected" : ""}
          key={tab.id}
          onClick={() => onChangeTab(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
