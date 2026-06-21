import { useExplorer } from '../../state/ExplorerContext';

export function Toolbar() {
  const { viewMode, setViewMode, theme, setTheme, selectedEdgeId, setSelectedEdgeId, onEdgeDelete } = useExplorer();
  return (
    <div className="nge-toolbar">
      <div className="nge-segmented" aria-label="View mode">
        {(['graph', 'explorer'] as const).map((mode) => (
          <button key={mode} type="button" aria-pressed={viewMode === mode} onClick={() => setViewMode(mode)}>
            {mode === 'graph' ? 'Graph' : 'Explorer'}
          </button>
        ))}
      </div>
      <div className="nge-toolbar__actions">
        {selectedEdgeId && onEdgeDelete && (
          <button className="nge-secondary-button" type="button" onClick={() => { onEdgeDelete(selectedEdgeId); setSelectedEdgeId(null); }}>
            Remove relationship
          </button>
        )}
        <label className="nge-theme-select">
          <span>Theme</span>
          <select value={theme} onChange={(event) => setTheme(event.target.value as typeof theme)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </label>
      </div>
    </div>
  );
}
