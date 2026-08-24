<template>
  <div class="overflow-x-auto">
    <svg :width="svgWidth" :height="svgHeight">
      <g :transform="`translate(${offsetX},${offsetY})`">
        <!-- Links -->
        <path
          v-for="(link, i) in links"
          :key="'l' + i"
          :d="curvePath(link)"
          fill="none"
          stroke="rgba(150,150,150,0.25)"
          stroke-width="1.5"
        />

        <!-- Nodos -->
        <g
          v-for="(node, i) in nodes"
          :key="'n' + i"
          :transform="`translate(${node.y},${node.x - NODE_H / 2})`"
          :class="{ 'cursor-pointer': isClickable(node.data) }"
          @click="onNodeClick(node)"
        >
          <!-- Rect del nodo -->
          <rect
            :width="NODE_W"
            :height="NODE_H"
            rx="6"
            :fill="fillColor(node.data.side)"
            :stroke="strokeColor(node.data.side)"
            stroke-width="1.5"
          />

          <!-- Etiqueta: tipo + cantidad -->
          <text
            :x="6"
            :y="15"
            font-size="10"
            font-weight="700"
            :fill="strokeColor(node.data.side)"
          >
            {{ node.data.label }}
          </text>

          <!-- Sub-etiqueta: counterparty -->
          <text x="6" :y="28" font-size="9" fill="currentColor" opacity="0.55">
            {{ node.data.subLabel }}
          </text>

          <!-- Fecha -->
          <text
            v-if="node.data.date"
            x="6"
            :y="40"
            font-size="8"
            fill="currentColor"
            opacity="0.35"
          >
            {{ node.data.date }}
          </text>

          <!-- Indicador expand/collapse -->
          <text
            v-if="node.data.hasHiddenChildren || node.children?.length"
            :x="NODE_W - 10"
            :y="28"
            font-size="11"
            fill="currentColor"
            opacity="0.4"
            text-anchor="middle"
          >
            {{ node.data.hasHiddenChildren ? "▸" : "▾" }}
          </text>

          <!-- Indicador de trazar -->
          <g
            v-if="node.data.isTraceable"
            :transform="`translate(${NODE_W - 14}, 13)`"
          >
            <circle
              r="8"
              :fill="
                node.data.isLoadingTrace
                  ? 'rgba(33,150,243,0.3)'
                  : 'rgba(33,150,243,0.12)'
              "
              stroke="rgb(33,150,243)"
              stroke-width="1"
            />
            <text
              x="0"
              y="3"
              font-size="9"
              fill="rgb(33,150,243)"
              text-anchor="middle"
              font-weight="700"
            >
              {{ node.data.isLoadingTrace ? "…" : "?" }}
            </text>
          </g>

          <!-- Badges de estado -->
          <g
            v-if="node.data.statusBadges.length"
            :transform="`translate(0, ${NODE_H})`"
          >
            <g
              v-for="(badge, bi) in node.data.statusBadges"
              :key="bi"
              :transform="`translate(${bi * 48}, 1)`"
            >
              <rect
                width="45"
                height="14"
                rx="3"
                :fill="badge.bg"
                :stroke="badge.color"
                stroke-width="0.5"
              />
              <text
                x="22"
                y="10"
                font-size="7"
                font-weight="600"
                :fill="badge.color"
                text-anchor="middle"
              >
                {{ badge.text }}
              </text>
            </g>
          </g>

          <!-- Tooltip nativo SVG -->
          <title>{{ node.data.tooltip }}</title>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { hierarchy, tree } from "d3-hierarchy";
import type { HierarchyPointLink } from "d3-hierarchy";
import type { NodeDatum } from "./types";

// ── Constantes de layout ────────────────────────────────────────────────────
const NODE_W = 140;
const NODE_H = 52;
const GAP_X = 24;
const GAP_Y = 8;
const MARGIN = 16;
const BADGE_EXTRA_H = 18;

// ── Tipos ───────────────────────────────────────────────────────────────────

interface LayoutNode {
  x: number;
  y: number;
  data: NodeDatum;
  children?: LayoutNode[];
}

// ── Props y eventos ─────────────────────────────────────────────────────────

const props = defineProps<{
  rootData: NodeDatum;
}>();

const emit = defineEmits<{
  "node-click": [node: LayoutNode];
}>();

// ── Layout d3 ───────────────────────────────────────────────────────────────

const treeRoot = computed(() => {
  const root = hierarchy(props.rootData);
  const layout = tree<NodeDatum>().nodeSize([
    NODE_H + GAP_Y + BADGE_EXTRA_H,
    NODE_W + GAP_X,
  ]);
  layout(root);
  return root;
});

const nodes = computed(
  () => treeRoot.value.descendants() as unknown as LayoutNode[],
);
const links = computed(
  () => treeRoot.value.links() as unknown as HierarchyPointLink<NodeDatum>[],
);

// ── Dimensiones SVG ─────────────────────────────────────────────────────────

const svgWidth = computed(() => {
  const ns = nodes.value;
  if (!ns.length) return 0;
  const maxY = Math.max(...ns.map((n) => n.y));
  const minY = Math.min(...ns.map((n) => n.y));
  return maxY - minY + NODE_W + MARGIN * 2;
});

const svgHeight = computed(() => {
  const ns = nodes.value;
  if (!ns.length) return 0;
  const maxX = Math.max(...ns.map((n) => n.x));
  const minX = Math.min(...ns.map((n) => n.x));
  return maxX - minX + NODE_H + BADGE_EXTRA_H + MARGIN * 2;
});

const offsetX = computed(() => {
  const ns = nodes.value;
  if (!ns.length) return 0;
  return -Math.min(...ns.map((n) => n.y)) + MARGIN;
});

const offsetY = computed(() => {
  const ns = nodes.value;
  if (!ns.length) return 0;
  return -Math.min(...ns.map((n) => n.x)) + NODE_H / 2 + MARGIN;
});

// ── Links curvados ──────────────────────────────────────────────────────────

function curvePath(link: HierarchyPointLink<NodeDatum>): string {
  const sx = link.source.y + NODE_W;
  const sy = link.source.x;
  const tx = link.target.y;
  const ty = link.target.x;
  const mx = (sx + tx) / 2;
  return `M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`;
}

// ── Colores ─────────────────────────────────────────────────────────────────

const DEFAULT_COLOR = { fill: "rgba(33,150,243,0.12)", stroke: "rgb(33,150,243)" };
const COLORS: Record<string, { fill: string; stroke: string }> = {
  root: { fill: "rgba(33,150,243,0.12)", stroke: "rgb(33,150,243)" },
  buy: { fill: "rgba(34,197,94,0.12)", stroke: "rgb(34,197,94)" },
  "transfer-in": { fill: "rgba(0,188,212,0.12)", stroke: "rgb(0,188,212)" },
  sell: { fill: "rgba(239,68,68,0.12)", stroke: "rgb(239,68,68)" },
  "transfer-out": { fill: "rgba(249,115,22,0.12)", stroke: "rgb(249,115,22)" },
};

function fillColor(side: string): string {
  return COLORS[side]?.fill ?? DEFAULT_COLOR.fill;
}

function strokeColor(side: string): string {
  return COLORS[side]?.stroke ?? DEFAULT_COLOR.stroke;
}

// ── Interactividad ──────────────────────────────────────────────────────────

function isClickable(data: NodeDatum): boolean {
  return data.isTraceable || data.hasHiddenChildren || (data.children?.length ?? 0) > 0;
}

function onNodeClick(node: LayoutNode) {
  emit("node-click", node);
}
</script>
