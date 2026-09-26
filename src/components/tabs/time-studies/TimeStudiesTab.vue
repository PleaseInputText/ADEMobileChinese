<script>
import { STUDY_TREE_LAYOUT_TYPE, TimeStudyTreeLayout } from "./time-study-tree-layout";

import DilationTimeStudy from "./DilationTimeStudy";
import ECTimeStudy from "./ECTimeStudy";
import EnslavedTimeStudy from "./EnslavedTimeStudy";
import HiddenTimeStudyConnection from "./HiddenTimeStudyConnection";
import NormalTimeStudy from "./NormalTimeStudy";
import PrimaryButton from "@/components/PrimaryButton";
import SecretTimeStudy from "./SecretTimeStudy";
import TimeStudyConnection from "./TimeStudyConnection";
import TimeTheoremShop from "./tt-shop/TimeTheoremShop";
import TriadTimeStudy from "./TriadTimeStudy";

export default {
  name: "TimeStudiesTab",
  components: {
    PrimaryButton,
    NormalTimeStudy,
    ECTimeStudy,
    EnslavedTimeStudy,
    DilationTimeStudy,
    TriadTimeStudy,
    SecretTimeStudy,
    TimeStudyConnection,
    HiddenTimeStudyConnection,
    TimeTheoremShop
  },
  data() {
    return {
      respec: player.respec,
      layoutType: STUDY_TREE_LAYOUT_TYPE.NORMAL,
      vLevel: 0,
      renderedStudyCount: 0,
      renderedConnectionCount: 0,
      isEnslaved: false,
      delayTimer: 0,
      zoom: 1.0,
      minZoom: 0.25,
      maxZoom: 1.0
    };
  },
  computed: {
    layout() {
      return TimeStudyTreeLayout.create(this.layoutType);
    },
    allStudies() {
      return this.layout.studies;
    },
    studies() {
      return this.allStudies.slice(0, this.renderedStudyCount);
    },
    allConnections() {
      return this.layout.connections;
    },
    connections() {
      return this.allConnections.slice(0, this.renderedConnectionCount);
    },
    scalerWrapperStyle() {
      const isWider = (this.layout.width * this.zoom * 10) > (window.innerWidth || 800);
      return {
        width: `${this.layout.width * this.zoom}rem`,
        height: `${this.layout.height * this.zoom}rem`,
        margin: isWider ? "0" : "0 auto",
        position: "relative",
        overflow: "hidden"
      };
    },
    treeStyleObject() {
      return {
        width: `${this.layout.width}rem`,
        height: `${this.layout.height}rem`,
        transform: `scale(${this.zoom})`,
        transformOrigin: "top left",
        position: "absolute",
        top: "0",
        left: "0"
      };
    },
    respecClassObject() {
      return {
        "o-primary-btn--subtab-option": true,
        "o-primary-btn--respec-active": this.respec
      };
    }
  },
  watch: {
    respec(newValue) {
      player.respec = newValue;
    },
    vLevel() {
      // When vLevel changes, we recompute the study tree because of triad studies
      this.$recompute("layout");
    },
    zoom(newVal) {
      localStorage.setItem("ade-time-study-zoom", newVal);
    }
  },
  created() {
    const incrementRenderedCount = () => {
      let shouldRequestNextFrame = false;
      if (this.renderedStudyCount < this.allStudies.length) {
        this.renderedStudyCount += 2;
        shouldRequestNextFrame = true;
      }
      if (this.renderedConnectionCount < this.allConnections.length) {
        this.renderedConnectionCount += 2;
        shouldRequestNextFrame = true;
      }
      if (shouldRequestNextFrame) {
        this.renderAnimationId = requestAnimationFrame(incrementRenderedCount);
      }
    };
    incrementRenderedCount();

    // CSS controlling the fade in/out for the Enslaved study is an animation happening over the course of 1 second.
    // Removing it normally via key-switching ends up getting rid of it immediately without animating, which we do if it
    // wasn't purchased - otherwise it animates to the unbought state and then remove it after the animation finishes.
    this.on$(GAME_EVENT.REALITY_RESET_AFTER, () => {
      this.delayTimer = player.celestials.enslaved.hasSecretStudy
        ? Date.now()
        : 0;
    });

    // Scroll to top because time studies tab is rendered progressively
    // and we don't want the player to see empty space while it's loading.
    document.body.scrollTop = 0;
  },
  mounted() {
    const saved = localStorage.getItem("ade-time-study-zoom");
    if (saved && !isNaN(Number(saved))) {
      const parsed = Number(saved);
      if (parsed >= this.minZoom && parsed <= this.maxZoom) {
        this.zoom = parsed;
      }
    } else if (window.innerWidth <= 768) {
      this.fitWidth();
    }

    // Touch gesture pinch-to-zoom exclusively within the tree container
    const container = this.$refs.treeContainer;
    if (container) {
      let initialDist = 0;
      let initialZoom = 1.0;
      let isPinching = false;

      const getDistance = (t1, t2) => {
        return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      };

      this.onTouchStart = (e) => {
        if (e.touches.length === 2) {
          isPinching = true;
          initialDist = getDistance(e.touches[0], e.touches[1]);
          initialZoom = this.zoom;
          // Crucial: prevent browser default page zoom
          e.preventDefault();
        }
      };

      this.onTouchMove = (e) => {
        if (e.touches.length === 2 && isPinching) {
          e.preventDefault();
          const currentDist = getDistance(e.touches[0], e.touches[1]);
          if (initialDist > 0) {
            const scaleRatio = currentDist / initialDist;
            const targetZoom = Math.min(
              this.maxZoom,
              Math.max(this.minZoom, Number((initialZoom * scaleRatio).toFixed(2)))
            );
            if (targetZoom !== this.zoom) {
              this.adjustScrollCenter(this.zoom, targetZoom);
              this.zoom = targetZoom;
            }
          }
        }
      };

      this.onTouchEnd = (e) => {
        if (e.touches.length < 2) {
          isPinching = false;
        }
      };

      container.addEventListener("touchstart", this.onTouchStart, { passive: false });
      container.addEventListener("touchmove", this.onTouchMove, { passive: false });
      container.addEventListener("touchend", this.onTouchEnd);
      container.addEventListener("touchcancel", this.onTouchEnd);
    }
  },
  beforeDestroy() {
    cancelAnimationFrame(this.renderAnimationId);
    const container = this.$refs.treeContainer;
    if (container && this.onTouchStart) {
      container.removeEventListener("touchstart", this.onTouchStart);
      container.removeEventListener("touchmove", this.onTouchMove);
      container.removeEventListener("touchend", this.onTouchEnd);
      container.removeEventListener("touchcancel", this.onTouchEnd);
    }
  },
  methods: {
    update() {
      this.respec = player.respec;
      this.layoutType = STUDY_TREE_LAYOUT_TYPE.current;
      this.vLevel = Ra.pets.v.level;
      this.isEnslaved = Enslaved.isRunning || Date.now() - this.delayTimer < 1000;
    },
    studyComponent(study) {
      switch (study.type) {
        case TIME_STUDY_TYPE.NORMAL: return NormalTimeStudy;
        case TIME_STUDY_TYPE.ETERNITY_CHALLENGE: return ECTimeStudy;
        case TIME_STUDY_TYPE.DILATION: return DilationTimeStudy;
        case TIME_STUDY_TYPE.TRIAD: return TriadTimeStudy;
      }
      throw "Unknown Time Study type";
    },
    exportStudyTree() {
      if (player.timestudy.studies.length === 0) {
        GameUI.notify.error("你不能导出空的时间研究树。");
      } else {
        copyToClipboard(GameCache.currentStudyTree.value.exportString);
        GameUI.notify.info("当前时间研究树已导出到剪贴板");
      }
    },
    fitWidth() {
      const containerWidth = window.innerWidth - 12;
      const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
      const treePxWidth = this.layout.width * remInPx;
      const targetZoom = Math.min(1.0, Math.max(this.minZoom, Number((containerWidth / treePxWidth).toFixed(2))));
      this.setZoom(targetZoom);
    },
    adjustScrollCenter(oldZoom, newZoom) {
      const container = this.$refs.treeContainer;
      if (!container || oldZoom <= 0) return;
      const ratio = newZoom / oldZoom;
      container.scrollLeft = (container.scrollLeft + container.clientWidth / 2) * ratio - container.clientWidth / 2;
      container.scrollTop = (container.scrollTop + container.clientHeight / 2) * ratio - container.clientHeight / 2;
    },
    setZoom(val) {
      const oldZoom = this.zoom;
      const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, Number(val.toFixed(2))));
      if (oldZoom === newZoom) return;
      this.adjustScrollCenter(oldZoom, newZoom);
      this.zoom = newZoom;
    },
    onWheel(e) {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        this.setZoom(this.zoom + delta);
      }
    }
  }
};
</script>

<template>
  <div class="l-time-studies-tab">
    <TimeTheoremShop class="l-time-studies-tab__tt-shop" />

    <div class="c-subtab-option-container">
      <PrimaryButton
        class="o-primary-btn--subtab-option"
        @click="exportStudyTree"
      >
        导出时间研究树
      </PrimaryButton>
      <PrimaryButton
        :class="respecClassObject"
        @click="respec = !respec"
      >
        下次永恒后重置时间研究树
      </PrimaryButton>
      <PrimaryButton
        class="o-primary-btn--subtab-option"
        onclick="Modal.studyString.show({ id: -1 })"
      >
        导入时间研究树
      </PrimaryButton>
    </div>

    <!-- 缩放条 (Interactive Zoom Bar) -->
    <div class="c-time-study-zoom-bar">
      <span class="c-time-study-zoom-label">
        <i class="fas fa-search-plus" />
        研究树缩放: <b>{{ Math.round(zoom * 100) }}%</b>
      </span>
      <input
        v-model.number="zoom"
        type="range"
        :min="minZoom"
        :max="maxZoom"
        step="0.05"
        class="o-zoom-slider"
      >
      <div class="c-time-study-zoom-presets">
        <PrimaryButton
          class="o-primary-btn--subtab-option c-zoom-btn"
          @click="fitWidth"
        >
          自适应
        </PrimaryButton>
        <PrimaryButton
          class="o-primary-btn--subtab-option c-zoom-btn"
          @click="setZoom(0.5)"
        >
          50%
        </PrimaryButton>
        <PrimaryButton
          class="o-primary-btn--subtab-option c-zoom-btn"
          @click="setZoom(1.0)"
        >
          100%
        </PrimaryButton>
      </div>
    </div>

    <!-- 包含时间研究树的自包含滚动视口 (仅在容器内平移/缩放) -->
    <div
      ref="treeContainer"
      class="l-time-study-tree-container"
      @wheel="onWheel"
    >
      <div
        class="time-study-tree-scaler-wrapper"
        :style="scalerWrapperStyle"
      >
        <div
          class="l-time-study-tree l-time-studies-tab__tree"
          :style="treeStyleObject"
        >
          <component
            :is="studyComponent(setup.study)"
            v-for="(setup) in studies"
            :key="setup.study.type.toString() + setup.study.id.toString()"
            :setup="setup"
          />
          <SecretTimeStudy :setup="layout.secretStudy" />
          <EnslavedTimeStudy
            v-if="isEnslaved"
            :setup="layout.enslavedStudy"
          />
          <svg
            :style="{ width: `${layout.width}rem`, height: `${layout.height}rem` }"
            class="l-time-study-connection"
          >
            <TimeStudyConnection
              v-for="(setup, index) in connections"
              :key="'connection' + index"
              :setup="setup"
            />
            <HiddenTimeStudyConnection :setup="layout.secretStudyConnection" />
            <HiddenTimeStudyConnection
              v-if="isEnslaved"
              :setup="layout.enslavedStudyConnection"
              :is-enslaved="isEnslaved"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-time-study-zoom-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin: 0.4rem auto;
  padding: 0.4rem 0.8rem;
  width: 95%;
  max-width: 60rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: var(--var-border-radius, 4px);
  border: 0.1rem solid var(--color-text);
  box-sizing: border-box;
}

.c-time-study-zoom-label {
  font-size: 1.2rem;
  white-space: nowrap;
}

.o-zoom-slider {
  flex: 1 1 auto;
  min-width: 8rem;
  max-width: 25rem;
  height: 2rem;
  cursor: pointer;
}

.c-time-study-zoom-presets {
  display: flex;
  flex-direction: row;
  gap: 0.4rem;
}

.c-zoom-btn {
  padding: 0.2rem 0.6rem !important;
  font-size: 1.1rem !important;
  min-height: 2.4rem !important;
  margin: 0 !important;
}

.l-time-study-tree-container {
  width: 100%;
  max-width: 100vw;
  height: 64vh;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-x pan-y;
  margin: 0.5rem auto;
  border: 0.1rem solid rgba(255, 255, 255, 0.15);
  border-radius: var(--var-border-radius, 4px);
  box-sizing: border-box;
}
</style>
