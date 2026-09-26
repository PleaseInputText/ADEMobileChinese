<script>
import AwayProgressEntry from "@/components/modals/AwayProgressEntry";
import ModalWrapper from "@/components/modals/ModalWrapper";

export default {
  name: "AwayProgressModal",
  components: {
    AwayProgressEntry,
    ModalWrapper,
  },
  props: {
    playerBefore: {
      type: Object,
      required: true,
    },
    playerAfter: {
      type: Object,
      required: true,
    },
    seconds: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      somethingHappened: false,
    };
  },
  computed: {
    nothingHappened() {
      return Theme.current().name === "S9";
    },
    offlineStats() {
      return AwayProgressTypes.appearsInAwayModal;
    },
    headerText() {
      const timeDisplay = TimeSpan.fromSeconds(new Decimal(this.seconds)).toString();
      if (this.nothingHappened || !this.somethingHappened) {
        return `在你离开的 ${timeDisplay} 里...什么事都没有发生。`;
      }
      return `在你离开的 ${timeDisplay} 里：`;
    },
  },
  mounted() {
    this.$nextTick(() => {
      // After all the children have been loaded, check if somethingHappened - if not, give them the achievement!
      if (this.nothingHappened || !this.somethingHappened) SecretAchievement(36).unlock();
    });
  },
};
</script>

<template>
  <ModalWrapper class="c-modal-away-progress">
    <div class="c-modal-away-progress__header">
      {{ headerText }}
    </div>
    <div
      v-if="!nothingHappened"
      class="c-modal-away-progress__resources c-modal--short"
    >
      <AwayProgressEntry
        v-for="name of offlineStats"
        :key="name"
        :name="name"
        :player-before="playerBefore"
        :player-after="playerAfter"
        @something-happened="somethingHappened = true"
      />
    </div>
    <span v-if="!nothingHappened && somethingHappened">注：点击条目可将其永久隐藏。</span>
  </ModalWrapper>
</template>

<style scoped>
.c-modal-away-progress__resources div {
  min-width: 55rem;
  border-bottom: 0.1rem solid var(--color-text);
  margin-bottom: 0.2rem;
  padding-bottom: 0.2rem;
  cursor: pointer;
}

.c-modal-away-progress__resources div:last-child {
  border: none;
}

@media (max-width: 768px) {
  .c-modal-away-progress {
    width: 92vw !important;
    max-width: 92vw !important;
  }

  .c-modal-away-progress__resources {
    width: 100% !important;
    max-width: 100% !important;
    max-height: 50vh !important;
  }

  .c-modal-away-progress__resources div {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    text-align: center !important;
    word-break: break-word !important;
    font-size: 1.2rem !important;
    line-height: 1.35 !important;
    margin: 0 auto 0.3rem auto !important;
    padding: 0.4rem 0.2rem !important;
  }
}
</style>
