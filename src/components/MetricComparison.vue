<template>
  <div class="metricComparison"> 
    
    <div class="metricName">
      <p>{{ metricName }}</p>
    </div>
    <MetricBar 
      :amount="subAmount" 
      :unit="unit"
      :average="average" 
      :color="color" 
      :barMultiplier="barMultiplier"
      style="width:15em; margin-right: 1em"
    />
    <div v-if="!candidateLoaded" class="spacer"></div>
    <MetricBar v-if="candidateLoaded"
      :amount="candidateAmount" 
      :unit="unit"
      :average="average" 
      :color="color" 
      :barMultiplier="barMultiplier"
      style="width:15em"
    />
    <div v-if="candidateLoaded" class="metricDiffContainer">
      <v-icon :icon="arrowType" :color=arrowColor></v-icon>
      <div class="metricDiff">
        <p>{{ (Math.abs(subAmount - candidateAmount)).toFixed(2) }} {{ unit }}</p>
      </div>
    </div>


  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue";
  import type { PropType } from "vue";

  import MetricBar from "./MetricBar.vue";

  export default defineComponent({
    components: {
      MetricBar
    },

    props: {
      metricName:  { type: String, required: true },
      subAmount:  { type: Number, required: true },
      candidateAmount:  { type: Number, required: true },
      unit:  { type: String, required: true },
      average:  { type: Number, required: true },
      color:  { type: String, required: true },
      barMultiplier:  { type: Number, required: true },
      candidateLoaded: { type: Boolean, required: true }
    },

    computed: {
      arrowColor(): string {
        return this.candidateAmount < this.subAmount ? "green" : "red";
      },
      arrowType(): string {
        return this.candidateAmount < this.subAmount ? "mdi-arrow-down" : "mdi-arrow-up";
      }
    },
  });
</script>

<style scoped>

p{
  font-size: small;
  padding-bottom:0.1rem;
}

.metricDiffContainer {
  display: flex;
}

.metricComparison {
  display: flex; 
  align-self: baseline;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}


.metricName {
  width: 6em;
}

.spacer {
  margin-bottom: 1.5rem;
}

.metricDiff {
  width: 4em;
}

/* css adjustments for mobile */
@media (max-width: 600px) {
  /* stack metric comparisons vertically to fit on mobile */
  .metricComparison {
    flex-direction: column;
    /* margin-bottom: 1rem; */
    margin: 0.5rem auto;
  }
  .metricDiffContainer {
    margin-top: 0.5rem;
    justify-content: center;
  }
  /* spacer shows up when subCandidate not loaded (without negative margin, metrics too far apart) */
  .spacer {
    margin-bottom: -0.5rem;
  }
}


</style>
