<template>
  <!-- maybe change formatting so bars are vertically aligned? -->
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
    <v-icon v-if="candidateLoaded" :icon="arrowType" :color=arrowColor></v-icon>
    <div class="metricDiff">
      <p v-if="candidateLoaded">{{ (Math.abs(subAmount - candidateAmount)).toFixed(2) }} {{ unit }}</p>
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

.metricComparison {
  display:flex; 
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



</style>
