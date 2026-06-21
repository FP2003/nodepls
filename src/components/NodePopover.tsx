import * as Popover from '@radix-ui/react-popover';
import { degreeMap } from '../utils/graph';
import { useExplorer } from '../state/ExplorerContext';

export function NodePopoverContent() {
  const { data, selectedNode, setSelectedNodeId, resolvedTheme } = useExplorer();
  if (!selectedNode) return null;
  const degree = degreeMap(data.nodes, data.edges).get(selectedNode.id) ?? 0;
  return (
    <Popover.Portal>
      <Popover.Content className="nge-popover" data-theme={resolvedTheme} sideOffset={10} collisionPadding={12} onOpenAutoFocus={(event) => event.preventDefault()}>
        <div className="nge-popover__heading">
          <div>
            <strong>{selectedNode.label}</strong>
            {selectedNode.type && <span className="nge-badge">{selectedNode.type}</span>}
          </div>
          <Popover.Close className="nge-icon-button" aria-label="Close node details" onClick={() => setSelectedNodeId(null)}>×</Popover.Close>
        </div>
        <dl className="nge-metadata">
          <div><dt>ID</dt><dd className="nge-code">{selectedNode.id}</dd></div>
          <div><dt>Connections</dt><dd>{degree}</dd></div>
          {Object.entries(selectedNode.metadata ?? {}).map(([key, value]) => (
            <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>
          ))}
        </dl>
        <Popover.Arrow className="nge-popover__arrow" />
      </Popover.Content>
    </Popover.Portal>
  );
}

export { Popover };
