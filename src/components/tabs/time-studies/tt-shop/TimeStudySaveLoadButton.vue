<script>
export default {
  name: "TimeStudySaveLoadButton",
  props: {
    saveslot: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      name: "",
      displayName: "",
      canEternity: false
    };
  },
  computed: {
    preset() {
      return player.timestudy.presets[this.saveslot - 1];
    },
  },
  methods: {
    update() {
      this.name = player.timestudy.presets[this.saveslot - 1].name;
      this.displayName = this.name === "" ? this.saveslot : this.name;
      this.canEternity = Player.canEternity;
    },
    save() {
      this.preset.studies = GameCache.currentStudyTree.value.exportString;
      const presetName = this.name ? `时间研究树以"${this.name}"的名称"` : "时间研究树";
      GameUI.notify.eternity(`${presetName}保存到槽位 ${this.saveslot}`);
    },
    load() {
      if (this.preset.studies) {
        // We need to use a combined tree for committing to the game state, or else it won't buy studies in the imported
        // tree are only reachable if the current tree is already bought
        const combinedTree = new TimeStudyTree();
        combinedTree.attemptBuyArray(TimeStudyTree.currentStudies, false);
        combinedTree.attemptBuyArray(combinedTree.parseStudyImport(this.preset.studies), true);
        TimeStudyTree.commitToGameState(combinedTree.purchasedStudies, false, combinedTree.startEC);

        const presetName = this.name ? `预设时间研究树“${this.name}”` : "预设时间研究树";
        GameUI.notify.eternity(`已从槽位 ${presetName} 加载${presetName}`);
      } else {
        Modal.message.show("该预设时间研究树目前没有时间研究");
      }
    }
  },
};
</script>

<template>
  <button
    class="l-tt-save-load-btn c-tt-buy-button c-tt-buy-button--unlocked"
    @click.shift.exact="save"
    @click.exact="load"
  >
    {{ displayName }}
  </button>
</template>

<style scoped>
.l-tt-save-load-btn {
  min-width: 2.8rem;
  height: 2.8rem;
  padding: 0.2rem 0.6rem;
  margin: 0.2rem;
  font-size: 1.25rem;
  font-weight: bold;
}
</style>
