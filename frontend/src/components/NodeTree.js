import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';

export default function NodeTree({ nodes, activeNodeId, onSelectNode }) {
  if (!nodes || nodes.length === 0) return null;

  // Build tree structure
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const renderNode = (node, depth = 0) => {
    const children = nodes.filter(n => n.parentId === node.id);
    const isActive = node.id === activeNodeId;

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: depth > 0 ? '2rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          {depth > 0 && (
            <div style={{ width: 24, height: 2, background: 'var(--mist)', flexShrink: 0 }} />
          )}
          <div
            className={`node slide-in ${isActive ? 'active active-pulse' : ''}`}
            title={node.content?.slice(0, 120)}
            onClick={() => onSelectNode(node)}
            style={{ maxWidth: '260px', minWidth: '100px' }}
          >
            <FontAwesomeIcon icon={faCodeBranch} style={{ marginRight: 4, opacity: 0.6, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {node.label || node.content?.slice(0, 35) + '…'}
            </span>
          </div>
        </div>
        {children.length > 0 && (
          <div style={{ borderLeft: '2px dashed var(--mist)', paddingLeft: '0.5rem', marginLeft: '1.5rem' }}>
            {children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const roots = nodes.filter(n => !n.parentId);

  return (
    <div className="node-tree" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '320px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <FontAwesomeIcon icon={faCodeBranch} style={{ color: 'var(--terracotta)' }} />
        <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Story Tree — {nodes.length} node{nodes.length !== 1 ? 's' : ''}
        </span>
      </div>
      {roots.map(root => renderNode(root, 0))}
    </div>
  );
}
