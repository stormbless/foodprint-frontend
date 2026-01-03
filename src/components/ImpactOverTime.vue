<template>
  <h2>Impact Over Time</h2>
  <GChart
    class="lineChart"
    type="LineChart"
    :data="totalImpactOverTime"
    :options="getChartLineOptions('All metrics', 'Total Impact\n (Avg Diet Days)', 'black')"
  />
  <v-row class="mb-6" no-gutters>
    <v-col sm="5" md="6">
      <v-card class="pa-2" outlined tile>
        <GChart
          type="LineChart"
          :data="emissionsOverTime"
          :options="getChartLineOptions('Emissions', 'Emissions, CO2 eq (kg)', 'red')"
        />
      </v-card>
    </v-col>
    <v-col sm="5" md="6">
      <v-card class="pa-2" outlined tile>
          <GChart
          type="LineChart"
          :data="waterUseOverTime"
          :options="getChartLineOptions('Water Use', 'Water Use (L)', 'blue')"
        />
      </v-card>
    </v-col>
  </v-row>
  <v-row no-gutters>
    <v-col sm="5" md="6">
      <v-card class="pa-2" outlined tile>
        <GChart
          type="LineChart"
          :data="landUseOverTime"
          :options="getChartLineOptions('Land Use', 'Land Use (m2)', 'green')"
        />
      </v-card>
    </v-col>
    <v-col sm="5" md="6">
      <v-card class="pa-2" outlined tile>
        <GChart
          type="LineChart"
          :data="eutrophicationOverTime"
          :options="getChartLineOptions('Eutrophication', 'Eutrophication, PO4 eq (g)', 'purple')"
        />
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">

  import { defineComponent } from "vue";
  import type { PropType } from "vue";
  import { GChart } from "vue-google-charts";

  export default defineComponent({
    components: {
      GChart
    },

    props: {
      totalImpactOverTime:  { type: Array as PropType<(string | number | Date)[][]>, required: true },
      emissionsOverTime:  { type: Array as PropType<(string | number | Date)[][]>, required: true },
      waterUseOverTime:  { type: Array as PropType<(string | number | Date)[][]>, required: true },
      landUseOverTime: { type: Array as PropType<(string | number | Date)[][]>, required: true },
      eutrophicationOverTime: { type: Array as PropType<(string | number | Date)[][]>, required: true }
    },

    methods: {
      getChartLineOptions(title: string, vAxisTitle: string, color: string) {
        return {
          legend: "right",
          series: {
            0: { lineWidth: 2 },
            1: { lineWidth: 2, color: "grey" },
          },
          colors: [color],
          //trendlines: { 0: {} },
          title: title,
          resizeDebounce: "500", // waits 500 ms after resizing window to redraw chart (improves performance)
          // subtitle: "",
          chart: {},
          width: 600,
          height: 200,
          hAxis: {
            title: "Date",
            format: "dd/MM/YY"
          },
          vAxis: {
            title: vAxisTitle,
          },
          
        };
      },
    },

  });

</script>

<style scoped>
  h2 {
    padding-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .lineChart {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem;
  }
</style>