<template>
  <v-progress-linear 
    :model-value="metricBarLength"
    :color="color"
    height="20"
    >
    <p>{{ amount }} {{ unit }}</p>
  </v-progress-linear>
</template>

<script lang="ts">
  import { defineComponent } from "vue";

  export default defineComponent({
    props: {
      amount:  { type: Number, required: true },
      unit:  { type: String, required: true },
      average:  { type: Number, required: true },
      color:  { type: String, required: true },
      barMultiplier:  { type: Number, required: true },
    },

    computed: {
      metricBarLength(): number {
        return this.barMultiplier * this.amount/this.average;
      }
    },
  });
</script>

<style scoped>

p{
  font-size: small;
  /* color: white; */
  padding-bottom:0.1rem;
}

</style>
