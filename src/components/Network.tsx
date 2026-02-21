import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { ideaNodes, type IdeaNode } from "../data/ideasGraph";

type TagNode = {
  id: string;
  label: string;
  type: "tag";
  tag: string;
  nodeKind: "tag";
};

type IdeaGraphNode = IdeaNode & { nodeKind: "idea" };

type GraphNode = IdeaGraphNode | TagNode;

type SimNode = d3.SimulationNodeDatum & GraphNode;

type GraphLink = {
  id: string;
  source: string | SimNode;
  target: string | SimNode;
  kind: "idea-tag" | "tag-tag";
  weight: number;
};

type LinkDatum = d3.SimulationLinkDatum<SimNode> & GraphLink;
type DragSubject = SimNode | d3.SubjectPosition;

const FONT_STACK =
  "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";

const cssVars = {
  "--panel-bg": "rgba(0,0,0,0.38)",
  "--panel-br": "rgba(255,255,255,0.14)",
  "--panel-shadow": "0 18px 50px rgba(0,0,0,0.45)",
  "--glass-bg": "rgba(255,255,255,0.06)",
  "--glass-br": "rgba(255,255,255,0.18)",
  "--text": "rgba(255,255,255,0.94)",
  "--muted": "rgba(255,255,255,0.78)",
  "--link": "rgba(255,255,255,0.92)",
} as const;

type IdeaPalette = {
  fill: string;
  stroke: string;
  glow: string;
};

const IDEA_PALETTE: Record<NonNullable<IdeaNode["type"]>, IdeaPalette> = {
  concept: {
    fill: "rgba(70, 210, 255, 0.85)",
    stroke: "rgba(70, 210, 255, 0.95)",
    glow: "drop-shadow(0 0 6px rgba(70, 210, 255, 0.55))",
  },
  resource: {
    fill: "rgba(255, 210, 70, 0.85)",
    stroke: "rgba(255, 210, 70, 0.95)",
    glow: "drop-shadow(0 0 6px rgba(255, 210, 70, 0.55))",
  },
  fact: {
    fill: "rgba(120, 255, 120, 0.85)",
    stroke: "rgba(120, 255, 120, 0.95)",
    glow: "drop-shadow(0 0 7px rgba(120, 255, 120, 0.55))",
  },
  location: {
    fill: "rgba(255, 140, 80, 0.85)",
    stroke: "rgba(255, 140, 80, 0.95)",
    glow: "drop-shadow(0 0 6px rgba(255, 140, 80, 0.45))",
  },
  year: {
    fill: "rgba(160, 120, 255, 0.85)",
    stroke: "rgba(160, 120, 255, 0.95)",
    glow: "drop-shadow(0 0 6px rgba(160, 120, 255, 0.45))",
  },
  person: {
    fill: "rgba(220, 120, 255, 0.85)",
    stroke: "rgba(220, 120, 255, 0.95)",
    glow: "drop-shadow(0 0 6px rgba(220, 120, 255, 0.45))",
  },
};

const glassPanel: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid var(--panel-br)",
  background: "var(--panel-bg)",
  backdropFilter: "blur(10px)",
  boxShadow: "var(--panel-shadow)",
};

const buttonGlass: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid var(--glass-br)",
  background: "var(--glass-bg)",
  color: "var(--link)",
  textDecoration: "none",
};

function isIdea(n: GraphNode): n is IdeaGraphNode {
  return n.nodeKind === "idea";
}

function paletteForIdeaType(t?: IdeaNode["type"]): IdeaPalette {
  return IDEA_PALETTE[t ?? "person"] ?? IDEA_PALETTE.person;
}

export default function IdeasGraphView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [selected, setSelected] = useState<GraphNode | null>(null);

  const { nodes, links } = useMemo(() => {
    const ideaSimNodes: (SimNode & IdeaGraphNode)[] = ideaNodes.map((n) => ({
      ...n,
      nodeKind: "idea",
    }));

    const tagSet = new Set<string>();
    for (const n of ideaNodes) for (const t of n.tags) tagSet.add(t);

    const tagNodes: (SimNode & TagNode)[] = Array.from(tagSet)
      .sort((a, b) => a.localeCompare(b))
      .map((tag) => ({
        id: `tag:${tag}`,
        label: tag,
        type: "tag",
        tag,
        nodeKind: "tag",
      }));

    const tagIndex = new Map<string, string>();
    for (const tn of tagNodes) tagIndex.set(tn.tag, tn.id);

    const builtLinks: GraphLink[] = [];

    for (const idea of ideaNodes) {
      for (const tag of idea.tags) {
        const tagId = tagIndex.get(tag);
        if (!tagId) continue;
        builtLinks.push({
          id: `L:idea-tag:${idea.id}->${tagId}`,
          source: idea.id,
          target: tagId,
          kind: "idea-tag",
          weight: 1,
        });
      }
    }

    const pairCounts = new Map<string, number>();
    const pairKey = (a: string, b: string) =>
      a < b ? `${a}||${b}` : `${b}||${a}`;

    for (const idea of ideaNodes) {
      const tags = Array.from(new Set(idea.tags));
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const k = pairKey(tags[i], tags[j]);
          pairCounts.set(k, (pairCounts.get(k) ?? 0) + 1);
        }
      }
    }

    const CO_OCCURRENCE_THRESHOLD = 1;
    for (const [k, count] of pairCounts.entries()) {
      if (count < CO_OCCURRENCE_THRESHOLD) continue;
      const [a, b] = k.split("||");
      const aId = tagIndex.get(a);
      const bId = tagIndex.get(b);
      if (!aId || !bId) continue;

      builtLinks.push({
        id: `L:tag-tag:${aId}<->${bId}`,
        source: aId,
        target: bId,
        kind: "tag-tag",
        weight: count,
      });
    }

    return { nodes: [...ideaSimNodes, ...tagNodes], links: builtLinks };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    d3.select(container).selectAll("div.hover-tooltip").remove();

    const tooltip = d3
      .select(container)
      .append("div")
      .attr("class", "hover-tooltip")
      .style("position", "absolute")
      .style("left", "0px")
      .style("top", "0px")
      .style("transform", "translate(-9999px, -9999px)")
      .style("pointer-events", "none")
      .style("z-index", "50")
      .style("max-width", "340px")
      .style("padding", "12px 12px")
      .style("border-radius", "14px")
      .style("border", "1px solid rgba(255,255,255,0.16)")
      .style("background", "rgba(0,0,0,0.70)")
      .style("backdrop-filter", "blur(10px)")
      .style("box-shadow", "0 12px 34px rgba(0,0,0,0.45)")
      .style("color", "var(--text)")
      .style("font-family", FONT_STACK)
      .style("font-size", "13px")
      .style("line-height", "1.35")
      .style("opacity", "0");

    const ttTitle = tooltip
      .append("div")
      .style("font-weight", "850")
      .style("font-size", "14px")
      .style("margin-bottom", "6px");

    const ttBody = tooltip.append("div").style("opacity", "0.92");

    const placeTooltip = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left + 14;
      const y = event.clientY - rect.top + 14;
      tooltip.style("transform", `translate(${x}px, ${y}px)`);
    };

    const hideTooltip = () => {
      tooltip
        .style("opacity", "0")
        .style("transform", "translate(-9999px, -9999px)");
    };

    const shouldTooltip = (d: SimNode) => d.nodeKind !== "tag";

    const showTooltip = (event: MouseEvent, d: SimNode) => {
      if (!shouldTooltip(d)) return;
      ttTitle.text(d.label);
      ttBody.text(d.description ?? "");
      placeTooltip(event);
      tooltip.style("opacity", "1");
    };

    const moveTooltip = (event: MouseEvent, d: SimNode) => {
      if (!shouldTooltip(d)) return;
      placeTooltip(event);
    };

    const gRoot = svg.append("g");
    const linkLayer = gRoot.append("g").attr("class", "links");
    const nodeLayer = gRoot.append("g").attr("class", "nodes");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 3])
      .on("zoom", (event) => {
        gRoot.attr("transform", event.transform.toString());
      });
    svg.call(zoom);

    const sim = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, LinkDatum>(links as LinkDatum[])
          .id((d) => d.id)
          .distance((l) => (l.kind === "tag-tag" ? 90 : 130))
          .strength((l) =>
            l.kind === "tag-tag" ? Math.min(0.4, 0.08 * l.weight) : 0.18,
          ),
      )
      .force("charge", d3.forceManyBody().strength(-420))
      .force(
        "collide",
        d3.forceCollide((d) => (d.nodeKind === "tag" ? 18 : 26)),
      )
      .force("x", d3.forceX(0).strength(0.03))
      .force("y", d3.forceY(0).strength(0.03));

    const visibleLinks: LinkDatum[] = (links as LinkDatum[]).filter(
      (l) => l.kind !== "tag-tag",
    );

    const linkSel = linkLayer
      .selectAll<SVGLineElement, LinkDatum>("line.link")
      .data(visibleLinks, (d) => d.id)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "rgba(255,255,255,0.10)")
      .attr("stroke-width", 1)
      .attr("stroke-linecap", "round");

    const nodeSel = nodeLayer
      .selectAll<SVGGElement, SimNode>("g.node")
      .data(nodes, (d) => d.id)
      .join("g")
      .attr("class", "node")
      .style("cursor", (d) => (d.nodeKind === "idea" ? "pointer" : "default"))
      .on("click", (_event, d) => {
        if (d.nodeKind !== "idea") return;
        setSelected(d);
      })
      .on("mouseenter", (event, d) => showTooltip(event as MouseEvent, d))
      .on("mousemove", (event, d) => moveTooltip(event as MouseEvent, d))
      .on("mouseleave", hideTooltip);

    nodeSel
      .append("circle")
      .attr("r", (d) => (d.nodeKind === "tag" ? 8 : 16))
      .attr("fill", (d) => {
        if (d.nodeKind === "tag") return "rgba(255,255,255,0.12)";
        return paletteForIdeaType((d as IdeaGraphNode).type).fill;
      })
      .attr("stroke", (d) => {
        if (d.nodeKind === "tag") return "rgba(255,255,255,0.35)";
        return paletteForIdeaType((d as IdeaGraphNode).type).stroke;
      })
      .attr("stroke-width", (d) => (d.nodeKind === "tag" ? 1.2 : 2))
      .style("filter", (d) => {
        if (d.nodeKind === "tag") return "none";
        return paletteForIdeaType((d as IdeaGraphNode).type).glow;
      });

    nodeSel
      .append("text")
      .text((d) => d.label)
      .attr("x", (d) => (d.nodeKind === "tag" ? 10 : 14))
      .attr("y", 4)
      .attr("fill", (d) =>
        d.nodeKind === "tag"
          ? "rgba(255,255,255,0.78)"
          : "rgba(255,255,255,0.92)",
      )
      .attr("font-size", (d) => (d.nodeKind === "tag" ? 9 : 16))
      .attr("font-family", FONT_STACK)
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(0,0,0,0.65)")
      .attr("stroke-width", 3);

    const drag: d3.DragBehavior<SVGGElement, SimNode, DragSubject> = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        hideTooltip();
        if (!event.active) sim.alphaTarget(0.2).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event) => {
        if (!event.active) sim.alphaTarget(0);
      });

    nodeSel.call(drag);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(320, rect.height);

      svg.attr("width", width).attr("height", height);
      sim.force("center", d3.forceCenter(width / 2, height / 2));
      sim.alpha(0.6).restart();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    sim.on("tick", () => {
      linkSel
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeSel.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      ro.disconnect();
      sim.stop();
      tooltip.remove();
    };
  }, [nodes, links]);

  const panel = useMemo(() => {
    if (!selected || !isIdea(selected)) return null;
    return {
      title: selected.label,
      description: selected.description,
      url: selected.url,
      tags: selected.tags,
      type: selected.type,
    };
  }, [selected]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        fontFamily: FONT_STACK,
        color: "var(--text)",
        ...Object.fromEntries(Object.entries(cssVars)),
      }}
    >
      <div
        ref={containerRef}
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden",
          background: "transparent",
          position: "relative",
        }}
      >
        <svg ref={svgRef} style={{ display: "block" }} />
      </div>

      <aside
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          width: 360,
          maxHeight: "calc(100vh - 32px)",
          overflow: "auto",
          padding: 16,
          boxSizing: "border-box",
          ...glassPanel,
        }}
      >
        {panel ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 850, marginBottom: 8 }}>
              {panel.title}
            </div>

            <div style={{ opacity: 0.92, lineHeight: 1.55, marginBottom: 12 }}>
              {panel.description}
            </div>

            {panel.url ? (
              <a
                href={panel.url}
                target="_blank"
                rel="noreferrer"
                style={{ ...buttonGlass, marginBottom: 14 }}
              >
                Open link <span aria-hidden>↗</span>
              </a>
            ) : null}

            {panel.tags?.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {panel.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 12,
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.16)",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.86)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div style={{ opacity: 0.86, lineHeight: 1.55 }}>
            Hover concept/resource nodes to preview details. Click any idea node
            to pin its info here.
          </div>
        )}
      </aside>
    </div>
  );
}
