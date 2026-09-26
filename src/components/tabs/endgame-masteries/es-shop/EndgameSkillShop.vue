<script>
import PrimaryToggleButton from "@/components/PrimaryToggleButton";
import EndgameMasterySaveLoadButton from "./EndgameMasterySaveLoadButton";
import EndgameSkillBuyButton from "./EndgameSkillBuyButton";

export default {
  name: "EndgameSkillShop",
  components: {
    PrimaryToggleButton,
    EndgameSkillBuyButton,
    EndgameMasterySaveLoadButton
  },
  data() {
    return {
      skillAmount: new Decimal(0),
      skillGeneration: new Decimal(0),
      totalEndgameSkills: new Decimal(0),
      shopMinimized: false,
      minimizeAvailable: false,
      budget: {
        gg: new Decimal(0),
        cp: new Decimal(0),
        dp: new Decimal(0)
      },
      costs: {
        gg: new Decimal(0),
        cp: new Decimal(0),
        dp: new Decimal(0)
      },
    };
  },
  computed: {
    minimized() {
      return this.minimizeAvailable && this.shopMinimized;
    },
    formatEndgameSkillType() {
      if (this.skillAmount.gte(1e6)) {
        return format;
      }
      return formatInt;
    },
    totalEndgameSkillText() {
      return `${quantify("终局能力", this.totalEndgameSkills, 2, 2, this.formatEndgameSkillType)}`;
    },
    minimizeArrowStyle() {
      return {
        transform: this.minimized ? "rotate(-180deg)" : "",
        transition: "all 0.25s ease-out"
      };
    },
    saveLoadText() {
      return this.$viewModel.shiftDown ? "保存：" : "加载：";
    },
    shopBottomRowHeightStyle() {
      return {
        height: this.hasTTAutobuyer ? "6.7rem" : "4.4rem",
      };
    }
  },
  methods: {
    minimize() {
      player.endgameMasteries.shopMinimized = !player.endgameMasteries.shopMinimized;
    },
    formatGG(gg) {
      return `${format(gg, 2, 0)} 星系`;
    },
    buyWithGG() {
      EndgameSkills.buyOne(false, "gg");
    },
    formatCP(cp) {
      return `${format(cp, 2, 0)} 天界点数`;
    },
    buyWithCP() {
      EndgameSkills.buyOne(false, "cp");
    },
    formatDP(dp) {
      return `${format(dp, 2, 0)} 毁灭粒子`;
    },
    buyWithDP() {
      EndgameSkills.buyOne(false, "dp");
    },
    buyMaxSkills() {
      EndgameSkills.buyMax(false);
    },
    update() {
      this.skillAmount.copyFrom(Currency.endgameSkills);
      this.totalEndgameSkills.copyFrom(Currency.endgameSkills.max);
      this.shopMinimized = player.endgameMasteries.shopMinimized;
      this.minimizeAvailable = Currency.doomedParticles.gte(1e100);
      const budget = this.budget;
      budget.gg.copyFrom(EndgameSkillPurchaseType.gg.currency);
      budget.cp.copyFrom(EndgameSkillPurchaseType.cp.currency);
      budget.dp.copyFrom(EndgameSkillPurchaseType.dp.currency);
      const costs = this.costs;
      costs.gg.copyFrom(EndgameSkillPurchaseType.gg.cost);
      costs.cp.copyFrom(EndgameSkillPurchaseType.cp.cost);
      costs.dp.copyFrom(EndgameSkillPurchaseType.dp.cost);
    },
    showPreferredMasteryTreeModal() {
      Modal.preferredMasteryTree.show();
    }
  },
};
</script>

<template>
  <div class="endgame-skill-buttons">
    <div class="esshop-container esshop-background">
      <!-- 1. ES Amount header on TOP -->
      <div class="esshop-header">
        <div class="endgameskills">
          你拥有
          <span class="c-es-amount">
            {{ quantify("终局能力", skillAmount, 2, 0, formatEndgameSkillType) }}
          </span>
        </div>
        <div class="es-gen-container">
          <span>
            你拥有 {{ totalEndgameSkillText }}。
          </span>
        </div>
      </div>

      <!-- 2. Controls Row: Preferred Mastery Tree Button + Load Presets 1-6 -->
      <div class="esshop-preset-row">
        <button
          class="l-es-pref-btn c-es-buy-button c-es-buy-button--unlocked"
          @click="showPreferredMasteryTreeModal"
        >
          <i class="fas fa-cog" /> 路径偏好
        </button>
        <div class="l-tree-load-button-wrapper">
          <span class="c-esshop__save-load-text">{{ saveLoadText }}</span>
          <EndgameMasterySaveLoadButton
            v-for="saveslot in 6"
            :key="saveslot"
            :saveslot="saveslot"
          />
        </div>
      </div>

      <!-- 3. Purchase Buttons -->
      <div
        v-if="!minimized"
        class="esbuttons-row esbuttons-buy-row"
        :style="shopBottomRowHeightStyle"
      >
        <EndgameSkillBuyButton
          :budget="budget.gg"
          :cost="costs.gg"
          :format-cost="formatGG"
          :action="buyWithGG"
        />
        <EndgameSkillBuyButton
          :budget="budget.cp"
          :cost="costs.cp"
          :format-cost="formatCP"
          :action="buyWithCP"
        />
        <EndgameSkillBuyButton
          :budget="budget.dp"
          :cost="costs.dp"
          :format-cost="formatDP"
          :action="buyWithDP"
        />
        <div class="l-es-buy-max-vbox">
          <button
            class="o-es-top-row-button c-es-buy-button c-es-buy-button--unlocked"
            @click="buyMaxSkills"
          >
            购买最大数量
          </button>
        </div>
      </div>
      <div
        v-else
        class="esbuttons-row esbuttons-bottom-row-hide"
      />
    </div>
    <button
      v-if="minimizeAvailable"
      class="esshop-minimize-btn esshop-background"
      @click="minimize"
    >
      <span
        class="minimize-arrow"
        :style="minimizeArrowStyle"
      >▼</span>
    </button>
  </div>
</template>

<style scoped>
.endgame-skill-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 100%;
  max-width: 68rem;
  margin: 0.5rem auto;
  pointer-events: auto;
}

.esshop-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 0.6rem 0.8rem;
  border-radius: var(--var-border-radius, 6px);
  border: var(--var-border-width, 0.2rem) solid black;
  gap: 0.5rem;
}

.esshop-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 0.2rem;
}

.endgameskills {
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
  margin: 0;
}

.c-es-amount {
  color: var(--color-endgame);
}

.esshop-preset-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  width: 100%;
}

.l-es-pref-btn {
  font-size: 1.2rem;
  padding: 0.3rem 0.8rem;
  min-height: 2.8rem;
}

.l-tree-load-button-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.c-esshop__save-load-text {
  font-size: 1.1rem;
  font-weight: bold;
}

.esbuttons-buy-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 0.4rem;
  width: 100%;
}

.esbuttons-bottom-row-hide {
  height: 0;
}

.es-gen-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem;
}

.checkbox-margin {
  margin: 0 0.4rem;
}
</style>
