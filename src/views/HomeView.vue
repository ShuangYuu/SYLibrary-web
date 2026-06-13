<template>
  <div class="home-page">
    <section v-if="adminInfo" class="welcome-panel">
      <div>
        <p class="eyebrow">馆藏元数据工作台</p>
        <h1>欢迎管理员 {{ adminInfo.username }}</h1>
        <p class="welcome-copy">在这里维护读者、馆员与图书元数据，保持数字馆藏记录清晰、完整、可追溯。</p>
      </div>
      <div class="catalog-card">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </section>
    <div v-else class="loading-state">
      <p>正在载入管理员信息...</p>
    </div>

    <section class="trend-section">
      <div class="section-heading">
        <p class="eyebrow">近 10 天数据</p>
        <h2>馆藏与读者趋势</h2>
      </div>

      <div v-if="trendLoading" class="trend-grid">
        <div class="chart-card skeleton-card"></div>
        <div class="chart-card skeleton-card"></div>
      </div>

      <el-alert
        v-else-if="trendError"
        type="error"
        show-icon
        :closable="false"
        :title="trendError"
      />

      <div v-else class="trend-grid">
        <div class="chart-card">
          <div class="chart-head">
            <div>
              <h3>近期新增图书数量</h3>
              <p>按日期统计每日新增馆藏记录</p>
            </div>
            <strong>{{ latestBookCount }}</strong>
          </div>
          <TrendLineChart :points="recentBookAdds" line-color="#6aa9d6" />
        </div>

        <div class="chart-card">
          <div class="chart-head">
            <div>
              <h3>目前用户数量</h3>
              <p>按日期统计截至当天的用户总量</p>
            </div>
            <strong>{{ latestUserTotal }}</strong>
          </div>
          <TrendLineChart :points="userTotals" line-color="#6fa6a0" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from "vue";
import apiClient from "@/utils/apiClient.js";

const adminInfo = ref(null);
const recentBookAdds = ref([]);
const userTotals = ref([]);
const trendLoading = ref(false);
const trendError = ref("");

const latestBookCount = computed(() => latestCount(recentBookAdds.value));
const latestUserTotal = computed(() => latestCount(userTotals.value));

const latestCount = (points) => {
  if (!points.length) {
    return 0;
  }
  return points[points.length - 1].count || 0;
};

const getAdminInfo = async () => {
  const res = await apiClient.get("/admin/info");
  adminInfo.value = res.data;
};

const getTrendData = async () => {
  trendLoading.value = true;
  trendError.value = "";
  try {
    const res = await apiClient.get("/dashboard/trends");
    recentBookAdds.value = normalizePoints(res.data?.recentBookAdds);
    userTotals.value = normalizePoints(res.data?.userTotals);
  } catch (e) {
    console.log("获取工作台趋势数据失败", e);
    trendError.value = "趋势数据加载失败，请稍后重试";
  } finally {
    trendLoading.value = false;
  }
};

const normalizePoints = (points) => {
  if (!Array.isArray(points)) {
    return [];
  }
  return points.map((point) => ({
    date: point.date,
    label: formatDate(point.date),
    count: Number(point.count || 0),
  }));
};

const formatDate = (dateText) => {
  if (!dateText) {
    return "";
  }
  const [, month, day] = String(dateText).split("-");
  return `${month}/${day}`;
};

const TrendLineChart = defineComponent({
  name: "TrendLineChart",
  props: {
    points: {
      type: Array,
      default: () => [],
    },
    lineColor: {
      type: String,
      default: "#6aa9d6",
    },
  },
  setup(props) {
    return () => {
      const width = 640;
      const height = 260;
      const padding = { top: 24, right: 24, bottom: 58, left: 58 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      const points = props.points;
      const maxValue = Math.max(1, ...points.map((point) => point.count));
      const linePoints = points.map((point, index) => {
        const x = padding.left + (points.length === 1 ? 0 : (index / (points.length - 1)) * chartWidth);
        const y = padding.top + chartHeight - (point.count / maxValue) * chartHeight;
        return { ...point, x, y };
      });
      const polyline = linePoints.map((point) => `${point.x},${point.y}`).join(" ");
      const gridLines = [0, 1, 2, 3].map((step) => {
        const ratio = step / 3;
        const y = padding.top + chartHeight - ratio * chartHeight;
        const value = Math.round(maxValue * ratio);
        return { y, value };
      });

      if (!points.length) {
        return h("div", { class: "chart-empty" }, "暂无趋势数据");
      }

      return h("svg", {
        class: "trend-chart",
        viewBox: `0 0 ${width} ${height}`,
        role: "img",
        "aria-label": "近十天趋势线性图",
      }, [
        ...gridLines.map((line) => h("g", { key: `grid-${line.y}` }, [
          h("line", {
            x1: padding.left,
            y1: line.y,
            x2: width - padding.right,
            y2: line.y,
            class: "grid-line",
          }),
          h("text", {
            x: padding.left - 18,
            y: line.y + 4,
            class: "axis-label",
            "text-anchor": "end",
          }, line.value),
        ])),
        h("polyline", {
          points: polyline,
          fill: "none",
          stroke: props.lineColor,
          "stroke-width": 4,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        }),
        ...linePoints.map((point) => h("g", { key: point.date }, [
          h("circle", {
            cx: point.x,
            cy: point.y,
            r: 5,
            fill: "#ffffff",
            stroke: props.lineColor,
            "stroke-width": 3,
          }),
          h("text", {
            x: point.x,
            y: height - 16,
            class: "axis-label",
            "text-anchor": "middle",
          }, point.label),
        ])),
      ]);
    };
  },
});

onMounted(() => {
  getAdminInfo();
  getTrendData();
});
</script>

<style scoped>
.home-page {
  min-height: calc(100dvh - 136px);
}

.welcome-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 28px;
  align-items: center;
  min-height: 280px;
  padding: 34px;
  border: 1px solid rgba(143, 191, 227, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(143, 191, 227, 0.2), transparent 42%),
    linear-gradient(90deg, #ffffff, #eff7fc);
}

.trend-section {
  margin-top: 20px;
}

.section-heading {
  margin: 0 0 14px;
}

.section-heading h2 {
  margin: 6px 0 0;
  color: var(--library-primary-deep);
  font-size: 22px;
}

.trend-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.chart-card {
  min-width: 0;
  padding: 18px;
  border: 1px solid rgba(143, 191, 227, 0.26);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 16px 32px rgba(58, 93, 118, 0.08);
}

.chart-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.chart-head h3 {
  margin: 0;
  color: #2d485a;
  font-size: 17px;
}

.chart-head p {
  margin: 6px 0 0;
  color: var(--library-muted);
  font-size: 13px;
}

.chart-head strong {
  color: var(--library-primary-deep);
  font-size: 28px;
  line-height: 1;
}

.trend-chart {
  width: 100%;
  display: block;
}

.grid-line {
  stroke: rgba(111, 130, 145, 0.18);
  stroke-width: 1;
}

.axis-label {
  fill: var(--library-muted);
  font-size: 12px;
}

.chart-empty {
  display: grid;
  place-items: center;
  min-height: 260px;
  color: var(--library-muted);
}

.skeleton-card {
  min-height: 330px;
  background:
    linear-gradient(90deg, rgba(232, 244, 251, 0.42), rgba(255, 255, 255, 0.92), rgba(232, 244, 251, 0.42));
  background-size: 220% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--library-muted);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

h1 {
  margin: 0;
  color: var(--library-primary-deep);
  font-size: 34px;
  line-height: 1.24;
}

.welcome-copy {
  max-width: 58ch;
  margin: 16px 0 0;
  color: #52655c;
  font-size: 16px;
  line-height: 1.8;
}

.catalog-card {
  height: 184px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(143, 191, 227, 0.18), rgba(237, 244, 248, 0.72));
}

.catalog-card span {
  width: 42px;
  border-radius: 4px 4px 2px 2px;
  box-shadow: inset 0 0 0 1px rgba(255, 250, 241, 0.35);
}

.catalog-card span:nth-child(1) {
  height: 124px;
  background: var(--library-primary-deep);
}

.catalog-card span:nth-child(2) {
  height: 150px;
  background: var(--library-primary);
}

.catalog-card span:nth-child(3) {
  height: 106px;
  background: var(--library-muted);
}

.loading-state {
  display: grid;
  place-items: center;
  min-height: 260px;
  color: #52655c;
}

@media (max-width: 760px) {
  .welcome-panel {
    grid-template-columns: 1fr;
    padding: 24px;
  }

  h1 {
    font-size: 26px;
  }

  .trend-grid {
    grid-template-columns: 1fr;
  }
}
</style>
