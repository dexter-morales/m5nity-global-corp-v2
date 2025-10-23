import type { BinaryNode } from '@/types/binary';
import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import NodeDetailsModal from './components/NodeDetailsModal';

interface Props {
    rootNode: BinaryNode;
    maxDepth?: number; // how many levels to show; matches controller default (4)
    nodeSize?: number; // px diameter of node circles
    levelGap?: number; // px vertical gap between levels
}

type PositionedNode = {
    node: BinaryNode;
    level: number; // 1-based
    positionIndex: number; // 0-based slot index within the full binary layer
};

export default function TreeView({
    rootNode,
    maxDepth = 4,
    nodeSize = 64,
    levelGap = 120,
}: Props) {
    const [selectedNode, setSelectedNode] = useState<BinaryNode | null>(null);

    const handleNodeClick = (node: BinaryNode) => {
        setSelectedNode(node);
    };

    const handleViewGenealogy = () => {
        if (!selectedNode?.members_account_id) return;
        router.visit(`/binary?account=${selectedNode.members_account_id}`);
    };

    // Build levels using DFS and track the "position index" each node would occupy
    // in a perfect binary tree at that level. Left child doubles the parent's index,
    // right child doubles and adds one. This keeps spacing balanced.
    const positioned = useMemo(() => {
        const list: PositionedNode[] = [];

        function place(
            node: BinaryNode | null,
            level: number,
            positionIndex: number,
        ) {
            if (!node || level > maxDepth) return;
            list.push({ node, level, positionIndex });

            place(node.leftChild ?? null, level + 1, positionIndex * 2);
            place(node.rightChild ?? null, level + 1, positionIndex * 2 + 1);
        }

        place(rootNode, 1, 0);
        return list;
    }, [rootNode, maxDepth]);

    // compute coords for each positioned node: x% and y pixels
    const coords = useMemo(() => {
        const map = new Map<number, { xPct: number; yPx: number }>(); // key by node.id
        positioned.forEach((p) => {
            const slotsAtLevel = 2 ** (p.level - 1);
            // center position within the available slots at this level
            const xPct = ((p.positionIndex + 0.5) / slotsAtLevel) * 100;
            const yPx = (p.level - 1) * levelGap + nodeSize / 2; // top offset plus half node height
            map.set(p.node.id, { xPct, yPx });
        });
        return map;
    }, [positioned, levelGap, nodeSize]);

    // build connector lines parent->child as arrays of points in percent and px (we'll normalize later for SVG)
    const connectors = useMemo(() => {
        const lines: { fromId: number; toId: number }[] = [];
        positioned.forEach((p) => {
            const n = p.node;
            if (n.leftChild) lines.push({ fromId: n.id, toId: n.leftChild.id });
            if (n.rightChild)
                lines.push({ fromId: n.id, toId: n.rightChild.id });
        });
        return lines;
    }, [positioned]);

    // container height to contain all levels
    const maxY = useMemo(() => {
        let max = 0;
        coords.forEach((v) => {
            if (v.yPx > max) max = v.yPx;
        });
        // add bottom padding
        return max + nodeSize;
    }, [coords, nodeSize]);

    const deepestLevel = useMemo(() => {
        return positioned.reduce((max, p) => Math.max(max, p.level), 1);
    }, [positioned]);

    const maxSlotsAtLevel = 2 ** (deepestLevel - 1);
    const minWidthPx = Math.max(maxSlotsAtLevel * (nodeSize * 1.5), 800);

    // Render
    return (
        <div className="relative w-full overflow-auto">
            <div
                style={{
                    position: 'relative',
                    height: maxY + 'px',
                    minWidth: `${minWidthPx}px`,
                }}
            >
                {/* SVG overlay for connectors (use viewBox width 100 and height = maxY px) */}
                <svg
                    className="pointer-events-none absolute inset-0"
                    width="100%"
                    height={maxY}
                    viewBox={`0 0 100 ${maxY}`}
                    preserveAspectRatio="none"
                >
                    {connectors.map((c, i) => {
                        const from = coords.get(c.fromId);
                        const to = coords.get(c.toId);
                        if (!from || !to) return null;
                        // Convert xPct to SVG X coordinate in 0..100
                        const x1 = from.xPct; // percent
                        const y1 = (from.yPx / maxY) * maxY; // px -> viewport px
                        const x2 = to.xPct;
                        const y2 = (to.yPx / maxY) * maxY;
                        // Since viewBox width is 100 units, x are already percentage points (0..100)
                        // Build a simple curved path (cubic bezier) from parent to child
                        const path = `
              M ${x1} ${y1}
              C ${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2}
            `;
                        return (
                            <path
                                key={i}
                                d={path}
                                fill="none"
                                stroke="#9ca3af"
                                strokeWidth={0.6}
                                strokeDasharray="3 3"
                                vectorEffect="non-scaling-stroke"
                            />
                        );
                    })}
                </svg>

                {/* Nodes absolutely positioned */}
                {positioned.map((p) => {
                    const coord = coords.get(p.node.id)!;
                    // Convert xPct to left px using percentage via style with calc
                    // We use translate(-50%) to center the node at its coordinate
                    const leftStyle = `calc(${coord.xPct}% - ${
                        nodeSize / 2
                    }px)`;
                    const topStyle = `${coord.yPx - nodeSize / 2}px`;

                    return (
                        <div
                            key={p.node.id}
                            role="button"
                            tabIndex={0}
                            style={{
                                position: 'absolute',
                                left: leftStyle,
                                top: topStyle,
                                width: nodeSize,
                                height: nodeSize + 24, // extra for label
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                pointerEvents: 'auto',
                                cursor: 'pointer',
                                outline: 'none',
                            }}
                            onClick={() => handleNodeClick(p.node)}
                            onKeyDown={(evt) => {
                                if (evt.key === 'Enter' || evt.key === ' ') {
                                    evt.preventDefault();
                                    handleNodeClick(p.node);
                                }
                            }}
                        >
                            <div
                                style={{
                                    width: nodeSize,
                                    height: nodeSize,
                                    borderRadius: '9999px',
                                    border: '4px solid #10b981', // green border
                                    background: '#ecfdf5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Avatar (fallback placeholder) */}
                                <img
                                    src={
                                        p.node.user?.avatar ??
                                        'https://cdn-icons-png.flaticon.com/512/194/194938.png'
                                    }
                                    alt={
                                        p.node.user?.name ??
                                        `User ${p.node.user_id}`
                                    }
                                    style={{
                                        width: nodeSize * 0.6,
                                        height: nodeSize * 0.6,
                                        borderRadius: '9999px',
                                    }}
                                />
                                {/* small badge on top-right */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: 18,
                                        height: 18,
                                        background: '#10b981',
                                        borderRadius: '9999px',
                                        right: -2,
                                        top: -2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: 12,
                                        border: '2px solid white',
                                    }}
                                >
                                    {'\u2713'}
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: 6,
                                    textAlign: 'center',
                                    fontSize: 12,
                                    color: '#374151',
                                }}
                            >
                                {p.node.meta?.account_name ??
                                    p.node.meta?.member_name ??
                                    p.node.user?.name ??
                                    `User #${p.node.user_id}`}
                            </div>
                        </div>
                    );
                })}
            </div>
            <NodeDetailsModal
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onViewGenealogy={handleViewGenealogy}
            />
        </div>
    );
}
