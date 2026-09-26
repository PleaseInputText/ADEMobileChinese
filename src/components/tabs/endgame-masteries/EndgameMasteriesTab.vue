<script>
import { MASTERY_TREE_LAYOUT_TYPE, EndgameMasteryTreeLayout } from "./endgame-mastery-tree-layout";

import PermanentEndgameMastery from "./PermanentEndgameMastery";
import NormalEndgameMastery from "./NormalEndgameMastery";
import PrimaryButton from "@/components/PrimaryButton";
import EndgameMasteryConnection from "./EndgameMasteryConnection";
import EndgameSkillShop from "./es-shop/EndgameSkillShop";

export default {
  name: "EndgameMasteryTab",
  components: {
    PrimaryButton,
    NormalEndgameMastery,
    PermanentEndgameMastery,
    EndgameMasteryConnection,
    EndgameSkillShop
  },
  data() {
    return {
      respec: player.endgame.respec,
      layoutType: MASTERY_TREE_LAYOUT_TYPE.NORMAL,
      renderedMasteryCount: 0,
      renderedConnectionCount: 0,
      zoom: 1.0,
      minZoom: 0.25,
      maxZoom: 1.0
    };
  },
  computed: {
    layout() {
      return EndgameMasteryTreeLayout.create(this.layoutType);
    },
    allMasteries() {
      return this.layout.masteries;
    },
    masteries() {
      return this.allMasteries.slice(0, this.renderedMasteryCount);
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
        "o-primary-btn--endgame-respec-active": this.respec
      };
    }
  },
  watch: {
    respec(newValue) {
      player.endgame.respec = newValue;
    },
    zoom(newVal) {
      localStorage.setItem("ade-endgame-mastery-zoom", newVal);
    }
  },
  created() {
    const incrementRenderedCount = () => {
      let shouldRequestNextFrame = false;
      if (this.renderedMasteryCount < this.allMasteries.length) {
        this.renderedMasteryCount += 2;
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

    document.body.scrollTop = 0;
  },
  mounted() {
    const saved = localStorage.getItem("ade-endgame-mastery-zoom");
    if (saved && !isNaN(Number(saved))) {
      const parsed = Number(saved);
      if (parsed >= this.minZoom && parsed <= this.maxZoom) {
        this.zoom = parsed;
      }
    } else if (window.innerWidth <= 768) {
      this.fitWidth();
    }

    const container = this.$refs.treeContainer;
    if (container) {
      let initialDist = 0;
      let initialZoom = 1.0;
      let isPinching = false;

      const getDistance = (t1, t2) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

      this.onTouchStart = (e) => {
        if (e.touches.length === 2) {
          isPinching = true;
          initialDist = getDistance(e.touches[0], e.touches[1]);
          initialZoom = this.zoom;
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
      this.respec = player.endgame.respec;
      this.layoutType = MASTERY_TREE_LAYOUT_TYPE.current;
    },
    masteryComponent(mastery) {
      switch (mastery.type) {
        case ENDGAME_MASTERY_TYPE.NORMAL: return NormalEndgameMastery;
        case ENDGAME_MASTERY_TYPE.PERMANENT: return PermanentEndgameMastery;
      }
      throw "Unknown Endgame Mastery type";
    },
    exportMasteryTree() {
      if (player.endgameMasteries.masteries.length === 0) {
        GameUI.notify.error("你不能导出空的终局专精树。");
      } else {
        copyToClipboard(GameCache.currentMasteryTree.value.exportString);
        GameUI.notify.info("当前终局专精树已导出到剪贴板");
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
      this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, Number(val.toFixed(2))));
      this.adjustScrollCenter(oldZoom, this.zoom);
    },
    handleWheel(e) {
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      this.setZoom(this.zoom + delta);
    }
  }
};
</script>

<template>
  <div class="l-endgame-masteries-tab">
    <EndgameSkillShop class="l-endgame-masteries-tab__es-shop" />

    <div class="c-subtab-option-container">
      <PrimaryButton
        class="o-primary-btn--subtab-option"
        @click="exportMasteryTree"
      >
        导出终局专精树
      </PrimaryButton>
      <PrimaryButton
        :class="respecClassObject"
        @click="respec = !respec"
      >
        下次终局时重置终局专精树
      </PrimaryButton>
      <PrimaryButton
        class="o-primary-btn--subtab-option"
        onclick="Modal.masteryString.show({ id: -1 })"
      >
        导入终局专精树
      </PrimaryButton>
      <PrimaryButton
        class="o-primary-btn--subtab-option"
        onclick="Modal.preferredMasteryTree.show()"
      >
        路径偏好
      </PrimaryButton>
    </div>
    <div class="l-time-study-zoom-controls">
      <button
        class="o-primary-btn l-zoom-btn"
        @click="fitWidth"
      >
        自适应
      </button>
      <button
        class="o-primary-btn l-zoom-btn"
        @click="setZoom(0.5)"
      >
        50%
      </button>
      <button
        class="o-primary-btn l-zoom-btn"
        @click="setZoom(1.0)"
      >
        100%
      </button>
      <input
        v-model.number="zoom"
        type="range"
        :min="minZoom"
        :max="maxZoom"
        step="0.05"
        class="l-zoom-slider"
      >
      <span class="l-zoom-label">{{ Math.round(zoom * 100) }}%</span>
    </div>
    <div
      ref="treeContainer"
      class="l-endgame-mastery-tree-container l-time-study-tree-container"
      @wheel.ctrl.prevent="handleWheel"
    >
      <div
        :style="scalerWrapperStyle"
        class="l-endgame-mastery-tree-scaler"
      >
        <div
          class="l-endgame-mastery-tree l-endgame-masteries-tab__tree"
          :style="treeStyleObject"
        >
          <component
            :is="masteryComponent(setup.mastery)"
            v-for="(setup) in masteries"
            :key="setup.mastery.type.toString() + setup.mastery.id.toString()"
            :setup="setup"
          />
          <svg
            :style="treeStyleObject"
            class="l-endgame-mastery-connection"
          >
            <EndgameMasteryConnection
              v-for="(setup, index) in connections"
              :key="'connection' + index"
              :setup="setup"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.l-endgame-mastery-tree-scaler {
  position: relative;
  overflow: hidden;
}
</style>

