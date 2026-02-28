import { Loader2, Network, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMindMapsBySession } from "../../hooks/useQueries";

interface Props {
  sessionId: string;
}

interface MindMapNode {
  id: string;
  label: string;
  parentId: string | null;
}

interface LayoutNode extends MindMapNode {
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  color: string;
}

const NODE_COLORS = [
  "oklch(0.62 0.22 265)", // primary
  "oklch(0.72 0.18 200)", // cyan
  "oklch(0.68 0.18 155)", // emerald
  "oklch(0.82 0.18 75)", // amber
  "oklch(0.68 0.22 300)", // violet
  "oklch(0.62 0.2 25)", // red
];

function computeLayout(nodes: MindMapNode[]): LayoutNode[] {
  if (!nodes.length) return [];

  const root = nodes.find((n) => !n.parentId) ?? nodes[0];
  const childrenMap: Record<string, MindMapNode[]> = {};

  for (const n of nodes) {
    if (n.parentId) {
      if (!childrenMap[n.parentId]) childrenMap[n.parentId] = [];
      childrenMap[n.parentId].push(n);
    }
  }

  const layout: LayoutNode[] = [];
  const nodeWidth = (label: string) => Math.max(120, label.length * 8 + 40);
  const nodeHeight = 44;
  const hGap = 60;
  const vGap = 20;

  function getSubtreeHeight(nodeId: string, depth: number): number {
    const children = childrenMap[nodeId] ?? [];
    if (!children.length) return nodeHeight;
    const totalChildH = children.reduce(
      (sum, c) => sum + getSubtreeHeight(c.id, depth + 1),
      0,
    );
    const gaps = (children.length - 1) * vGap;
    return Math.max(nodeHeight, totalChildH + gaps);
  }

  function placeNode(
    node: MindMapNode,
    x: number,
    centerY: number,
    depth: number,
  ) {
    const w = depth === 0 ? 160 : nodeWidth(node.label);
    const h = nodeHeight;
    const children = childrenMap[node.id] ?? [];
    const colorIndex = depth % NODE_COLORS.length;

    layout.push({
      ...node,
      x: x - w / 2,
      y: centerY - h / 2,
      width: w,
      height: h,
      depth,
      color: NODE_COLORS[colorIndex],
    });

    if (children.length) {
      const subtreeH = getSubtreeHeight(node.id, depth);
      let childY = centerY - subtreeH / 2;
      for (const child of children) {
        const childSubH = getSubtreeHeight(child.id, depth + 1);
        const childCY = childY + childSubH / 2;
        placeNode(
          child,
          x + (depth === 0 ? 260 : 220) + hGap,
          childCY,
          depth + 1,
        );
        childY += childSubH + vGap;
      }
    }
  }

  placeNode(root, 0, 0, 0);
  return layout;
}

export function MindMapTab({ sessionId }: Props) {
  const { data: mindmaps = [], isLoading } = useMindMapsBySession(sessionId);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: 800, h: 500 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const mindmap = mindmaps[0];
  const nodes: MindMapNode[] = (() => {
    if (!mindmap?.mapData) return [];
    try {
      const parsed = JSON.parse(mindmap.mapData);
      if (Array.isArray(parsed)) return parsed;
      if (parsed.nodes && Array.isArray(parsed.nodes)) return parsed.nodes;
      return [];
    } catch {
      return [];
    }
  })();

  const layoutNodes = computeLayout(nodes);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [pan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.3, Math.min(3, z * delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!nodes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Network size={40} className="mb-3 opacity-40" />
        <p className="font-medium">No mind map generated yet</p>
        <p className="text-sm opacity-60">
          Mind map will appear here after processing
        </p>
      </div>
    );
  }

  const minX = Math.min(...layoutNodes.map((n) => n.x)) - 40;
  const minY = Math.min(...layoutNodes.map((n) => n.y)) - 40;
  const maxX = Math.max(...layoutNodes.map((n) => n.x + n.width)) + 40;
  const maxY = Math.max(...layoutNodes.map((n) => n.y + n.height)) + 40;
  const svgW = maxX - minX;
  const svgH = maxY - minY;

  const centerX = containerSize.w / 2;
  const centerY = containerSize.h / 2;

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card/50">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3, z * 1.2))}
          className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))}
          className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          title="Reset view"
        >
          <RotateCcw size={16} />
        </button>
        <span className="text-xs text-muted-foreground ml-1">
          {Math.round(zoom * 100)}%
        </span>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
          Drag to pan • Scroll to zoom
        </span>
      </div>

      {/* SVG canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width={containerSize.w}
          height={containerSize.h}
          style={{ display: "block" }}
          aria-label="Mind map visualization"
          role="img"
        >
          <title>Mind Map</title>
          <defs>
            <filter id="node-shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2" />
            </filter>
          </defs>
          <g
            transform={`translate(${centerX + pan.x},${centerY + pan.y}) scale(${zoom}) translate(${-svgW / 2 - minX},${-svgH / 2 - minY})`}
          >
            {/* Edges */}
            {layoutNodes.map((node) => {
              if (!node.parentId) return null;
              const parent = layoutNodes.find((n) => n.id === node.parentId);
              if (!parent) return null;
              const px = parent.x + parent.width;
              const py = parent.y + parent.height / 2;
              const nx = node.x;
              const ny = node.y + node.height / 2;
              const cx = (px + nx) / 2;

              return (
                <path
                  key={`edge-${node.id}`}
                  d={`M ${px} ${py} C ${cx} ${py}, ${cx} ${ny}, ${nx} ${ny}`}
                  fill="none"
                  stroke="oklch(var(--border))"
                  strokeWidth={node.depth === 1 ? 2 : 1.5}
                  opacity={0.7}
                />
              );
            })}

            {/* Nodes */}
            {layoutNodes.map((node) => {
              const isRoot = node.depth === 0;
              const rx = isRoot ? 14 : 8;

              return (
                <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                  <rect
                    width={node.width}
                    height={node.height}
                    rx={rx}
                    ry={rx}
                    fill={node.color}
                    opacity={isRoot ? 1 : 0.85}
                    filter="url(#node-shadow)"
                  />
                  {isRoot && (
                    <rect
                      x={2}
                      y={2}
                      width={node.width - 4}
                      height={node.height - 4}
                      rx={rx - 2}
                      ry={rx - 2}
                      fill="none"
                      stroke="oklch(1 0 0 / 0.3)"
                      strokeWidth={1}
                    />
                  )}
                  <text
                    x={node.width / 2}
                    y={node.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isRoot ? 14 : 12}
                    fontWeight={isRoot ? 700 : 500}
                    fill="oklch(0.98 0 0)"
                    fontFamily="Bricolage Grotesque, sans-serif"
                    style={{ userSelect: "none" }}
                  >
                    {node.label.length > 22
                      ? `${node.label.slice(0, 20)}…`
                      : node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
