<script>
import ModernMobileSidebar from "./ModernMobileSidebar";
import ModernSidebarCurrency from "./ModernSidebarCurrency";
import ModernTabButton from "./ModernTabButton";

export default {
  name: "ModernSidebar",
  components: {
    ModernMobileSidebar,
    ModernSidebarCurrency,
    ModernTabButton
  },
  data() {
    return {
      isHidden: false,
      tabVisibilities: [],
      isMobile: false,
      mobileQuery: null
    };
  },
  computed: {
    tabs: () => Tabs.newUI
  },
  mounted() {
    this.mobileQuery = window.matchMedia("(max-width: 700px)");
    this.isMobile = this.mobileQuery.matches;
    this.mobileQuery.addListener(this.updateMobile);
  },
  beforeDestroy() {
    if (this.mobileQuery) this.mobileQuery.removeListener(this.updateMobile);
  },
  methods: {
    update() {
      this.isHidden = AutomatorData.isEditorFullscreen || !player.hasSeenIntro;
      this.tabVisibilities = Tabs.newUI.map(x => x.isAvailable);
      this.updateMobile();
    },
    updateMobile() {
      const matches = this.mobileQuery.matches ||
        (typeof window !== "undefined" && window.innerWidth <= 700);
      if (matches !== this.isMobile) {
        this.isMobile = matches;
      }
    }
  }
};
</script>

<template>
  <ModernMobileSidebar
    v-if="!isHidden && isMobile"
  />
  <div
    v-else-if="!isHidden"
    class="c-modern-sidebar"
  >
    <ModernSidebarCurrency />
    <template
      v-for="(tab, tabPosition) in tabs"
    >
      <ModernTabButton
        v-if="tabVisibilities[tabPosition]"
        :key="tab.name"
        :tab="tab"
        :tab-position="tabPosition"
      />
    </template>
  </div>
</template>

<style scoped>

</style>
