<template>
  <h2>Food Breakdown</h2>

  <h3>Impact / kg</h3>
  <v-data-table
    class="foodTable"
    :headers="foodImpactPerKgHeaders"
    :sort-by="[{ key: 'totalImpactPerKg', order: 'desc' }]"
    :items="foodImpactsPerKg"
    density="compact"
  >
    <template v-slot:item="{ item }">
      <tr>
        <td>{{item.name}}</td>
        <td>
          <v-btn 
            @click="showSubAnalysis(item.name)"
            size="small"
          >sub</v-btn></td>
        <td :style="getTotalImpactPerKgStyle(item.totalImpactPerKg)">{{item.totalImpactPerKg}}</td>
        <td :style="getMetricPerKgStyle(item.emissionsPerKg, 'emissions')">{{item.emissionsPerKg}}</td>
        <td :style="getMetricPerKgStyle(item.waterUsePerKg, 'waterUse')">{{item.waterUsePerKg}}</td>
        <td :style="getMetricPerKgStyle(item.landUsePerKg, 'landUse')">{{item.landUsePerKg}}</td>
        <td :style="getMetricPerKgStyle(item.eutrophicationPerKg, 'eutrophication')">{{item.eutrophicationPerKg}}</td>
      </tr>
    </template>
  </v-data-table>

  <h3>Total Impact</h3>
  <v-data-table
    class="foodTable"
    :headers="foodImpactsHeaders"
    :sort-by="[{ key: 'totalImpact', order: 'desc' }]"
    :items="foodImpactsPercentage"
    density="compact"
  >
    <template v-slot:item="{ item }">
      <tr>
        <td>{{item.food}}</td>
        <td>
          <v-btn 
            @click="showSubAnalysis(item.food)"
            size="small"
          >sub</v-btn></td>
        <td>{{item.amount}}</td>
        <td :style="getImpactCellStyle(item.totalImpact)">{{item.totalImpact}}</td>
        <td :style="getImpactCellStyle(item.emissions)">{{item.emissions}}</td>
        <td :style="getImpactCellStyle(item.waterUse)">{{item.waterUse}}</td>
        <td :style="getImpactCellStyle(item.landUse)">{{item.landUse}}</td>
        <td :style="getImpactCellStyle(item.eutrophication)">{{item.eutrophication}}</td>
      </tr>
    </template>
  </v-data-table>
</template>

<script lang="ts">

  import { defineComponent } from "vue";
  import type { PropType } from "vue";
  import type { Food } from "@/store";

  import AVERAGE_DIET_IMPACT from "@/constants/average-diet-impact";
  import MAX_METRIC_PER_KG_STANDARDIZED from "@/constants/max-metric";
  import MAX_TOTAL_PER_KG from "@/constants/max-total-impact";

  interface FoodImpact {
    food: string,
    amount: number,
    emissions: number,
    waterUse: number,
    landUse: number,
    eutrophication: number,
    totalImpact: number,
  }

  type showSubAnalysis = (foodName: string) => void; 

  export default defineComponent({
    components: {},

    props: {
      foodImpactsPerKg:  { type: Object as PropType<Food[]>, required: true },
      foodImpacts:  { type: Object as PropType<FoodImpact[]>, required: true },
      foodImpactsPercentage:  { type: Object as PropType<FoodImpact[]>, required: true },
      showSubAnalysis: { type: Function as PropType<showSubAnalysis>, required: true },
      totalImpact: { type: Number, required: true }
    },

    data() {
      return {
        foodImpactPerKgHeaders: [
          { title: "Food", align: "start", key: "name"},
          { title: "Sub", align: "start", key: "sub"},
          { title: "Total Impact / kg (%)", align: "end", key: "totalImpactPerKg" },
          { title: "Emissions / kg (kg)", align: "end", key: "emissionsPerKg" },
          { title: "Water Use / kg (L)", align: "end", key: "waterUsePerKg" },
          { title: "Land Use / kg (m2)", align: "end", key: "landUsePerKg" },
          { title: "Eutrophication / kg (g)", align: "end", key: "eutrophicationPerKg" },
        ] as const,
        foodImpactsHeaders: [
          { title: "Food", align: "start", key: "food"},
          { title: "Sub", align: "start", key: "sub"},
          { title: "Amount (g)", align: "end", key: "amount" },
          { title: "Total Impact (%)", align: "end", key: "totalImpact" },
          { title: "Emissions (%)", align: "end", key: "emissions" },
          { title: "Water Use (%)", align: "end", key: "waterUse" },
          { title: "Land Use (%)", align: "end", key: "landUse" },
          { title: "Eutrophication (%)", align: "end", key: "eutrophication" },
        ] as const,
      }
    },

    methods: {
      // used for highlight table styling (returns varying intensity of blue depending on value)
      // also changes text to white on darker blues for readability and aligns text right
      // maxing out blue at max
      getCellStyle(value: number, max: number) {
        const multiplier = 255 / max; // ensure that red and green values are 00 at max value

        // ff (when value is 0) -> 00 (when value is max)
        const redHex = (255 - Math.round(value * multiplier)).toString(16);
        const blueHex = "ff"; 
        // ff (when value is 0) -> 00 (when value is max)
        const greenHex = (255 - Math.round(value * multiplier)).toString(16); 

        const backgroundColor: string = `#${redHex}${greenHex}${blueHex}`;

        const textColor: string = (value / max < .3) ? "black" : "white"; // text white on darker blues for readability

        const style: string = "background-color: " + backgroundColor + ";" + 
        " color: " + textColor + ";" + "text-align: right;";

        return style;
      },

      getImpactCellStyle(percentage: number): string {
        const style = this.getCellStyle(percentage, 100);

        return style;
      },

      getMetricPerKgStyle(impact: number, metric: string): string {
        const standardizedImpact = impact / AVERAGE_DIET_IMPACT[metric + "PerDay" as keyof typeof AVERAGE_DIET_IMPACT];

        const style = this.getCellStyle(standardizedImpact, MAX_METRIC_PER_KG_STANDARDIZED);

        return style;
      },

      getTotalImpactPerKgStyle(foodPercentage: number): string {
        const foodTotalImpact = (foodPercentage / 100) * this.totalImpact;

        const style = this.getCellStyle(foodTotalImpact, MAX_TOTAL_PER_KG);

        return style;
      },
    },

  });

</script>

<style scoped>
  h2, h3 {
    padding-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .foodTable {
    max-width: 52.5rem;
    margin:auto
  }
</style>