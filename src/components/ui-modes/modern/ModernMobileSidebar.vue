<script>
export default {
  name: "ModernMobileSidebar",
  data() {
    return {
      hasSeenIntro: false,
      tabVisibilities: [],
      subtabVisibilities: [],
      hasNotification: false
    };
  },
  computed: {
    tabs() {
      return Tabs.newUI;
    },
    activeTab() {
      return Tabs.current;
    }
  },
  methods: {
    update() {
      this.hasSeenIntro = player.hasSeenIntro;
      this.tabVisibilities = Tabs.newUI.map(x => x.isAvailable);
      if (this.activeTab) {
        this.hasNotification = this.activeTab.hasNotification;
        this.subtabVisibilities = this.activeTab.subtabs.map(x => x.isAvailable);
      }
    },
    isCurrentTab(tab) {
      return tab.isOpen;
    },
    isCurrentSubtab(id) {
      return this.activeTab && player.options.lastOpenSubtab[this.activeTab.id] === id;
    },
    showTab(tab) {
      tab.show(true);
    },
    showSubtab(subtab) {
      subtab.show(true);
    },
    tabUiClass(tab) {
      if (typeof tab.config.UIClass === "function") return tab.config.UIClass();
      return tab.config.UIClass;
    }
  }
};
</script>

<template>
  <div
    v-if="hasSeenIntro"
    class="c-mobile-sidebar"
  >
    <div class="c-mobile-sidebar__subtabs">
      <template v-if="activeTab">
        <div
          v-for="(subtab, index) in activeTab.subtabs"
          v-show="subtabVisibilities[index]"
          :key="activeTab.id + '-' + index"
          class="c-mobile-sidebar__subtab o-tab-btn"
          :class="[tabUiClass(activeTab), { 'o-subtab-btn--active': isCurrentSubtab(subtab.id) }]"
          @click="showSubtab(subtab)"
        >
          <span v-html="subtab.symbol" />
          <div
            v-if="subtab.hasNotification"
            class="fas fa-circle-exclamation l-notification-icon"
          />
        </div>
      </template>
    </div>
    <div class="c-mobile-sidebar__tabs">
      <div
        v-for="(tab, tabPosition) in tabs"
        v-show="tabVisibilities[tabPosition]"
        :key="tab.name"
        class="c-mobile-sidebar__tab o-tab-btn"
        :class="[tabUiClass(tab), { 'o-tab-btn--active': isCurrentTab(tab) }]"
        @click="showTab(tab)"
      >
        {{ tab.name }}
        <div
          v-if="tab.hasNotification"
          class="fas fa-circle-exclamation l-notification-icon"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-mobile-sidebar {
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  pointer-events: auto;
  background: var(--color-base);
  border-top: 0.1rem solid var(--color-accent);
  padding-bottom: env(safe-area-inset-bottom, 0);
  box-shadow: 0 -0.2rem 0.8rem rgba(0, 0, 0, 0.4);
}

.c-mobile-sidebar__tabs {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  background: var(--color-base);
  border-top: 0.1rem solid rgba(255, 255, 255, 0.15);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.c-mobile-sidebar__tabs::-webkit-scrollbar {
  display: none;
}

.c-mobile-sidebar__subtabs {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  background: var(--color-base);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.c-mobile-sidebar__subtabs::-webkit-scrollbar {
  display: none;
}

.c-mobile-sidebar__tab {
  flex: 1 0 auto;
  min-width: 5.6rem;
  height: 3.6rem;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  border-width: 0 0.1rem 0 0;
  margin: 0;
  padding: 0 0.6rem;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}

.c-mobile-sidebar__subtab {
  flex: 1 0 auto;
  min-width: 4.4rem;
  height: 3.6rem;
  font-size: 1.8rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  border-width: 0 0.1rem 0 0;
  margin: 0;
  padding: 0 0.5rem;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
</style>