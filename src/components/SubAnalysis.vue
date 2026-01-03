<template>
  <v-card
    class="subCard"
    max-width="800"
    title="Substitution Analysis"
  >
    <v-container>
      <v-row dense style="margin-left: 6rem;">
        <v-col cols="4">
          <p>{{ subFoodImpact.food }}</p>
        </v-col>
        <v-col cols="2">
          <p class="subText">-></p>
        </v-col>
        <v-col cols="6">
          <v-select 
            style="width: 17em; font-weight: bold"
            :items="subCandidates"
            v-model="subCandidateName"
            density="compact"
            @click="loadSubCandidates(subFoodImpact.food)"
            @update:model-value="loadSubImpact(subCandidateName)"
            label="Substitute for"
            solo
          ></v-select>
        </v-col>
      </v-row>
      
      <v-row dense class="mt-n10">
        <v-col cols="5" offset="1">
          <p class="subText"> {{ subFoodImpact.amount }} g</p>
        </v-col>
        <v-col cols="5" v-if="subCandidateName.length > 0">
          <p class="subText"> {{ subCandidateImpact.amount }} g</p>
        </v-col>
      </v-row>
    </v-container>
      
    <MetricComparison v-for="metric in metrics" 
      :metricName="metric.name"
      :subAmount="(subFoodImpact[metric.key as keyof FoodImpact] as number)"
      :candidateAmount="(subCandidateImpact[metric.key as keyof FoodImpact] as number)"
      :unit="metric.unit"
      :average="AVERAGE_DIET_IMPACT[metric.key + 'PerDay' as keyof typeof AVERAGE_DIET_IMPACT]"
      :color="metric.color"
      :candidateLoaded="(subCandidateName.length > 0)"
      :barMultiplier="subBarMultiplier"
    />

    <div v-if="subCandidateName.length > 0">
      <h2>Total Impact Change</h2>
      <h3>Metrics Over {{ numberOfDays }} Days</h3>

      <p v-for="metric in metrics">
        {{ metric.name }}: {{ (totalImpact[metric.key as keyof Impact]).toFixed(2) }} {{ metric.unit }} -> 
        <span :style="'margin-right: 0.25em;' + 'margin-left: 0.25em;' + 'color:' + 
          (subDiff[metric.key as keyof Impact] < 0 ? 'green' : 'red')">
            {{ (impactAfterSub[metric.key as keyof Impact]).toFixed(2) }}
        </span> 
        {{ metric.unit }}
        <v-icon 
          :icon="subDiff[metric.key as keyof Impact] < 0 ? 'mdi-arrow-down' : 'mdi-arrow-up'"
          :color="subDiff[metric.key as keyof Impact] < 0 ? 'green' : 'red'">
        </v-icon>
        {{ ( 100 * Math.abs( subDiff[metric.key as keyof Impact] / 
        totalImpact[metric.key as keyof Impact] ) ).toFixed(1) }}%
      </p>
      <p>
        Total Impact: 
        <v-icon 
          :icon="subDiff.total < 0 ? 'mdi-arrow-down' : 'mdi-arrow-up'"
          :color="subDiff.total < 0 ? 'green' : 'red'">
        </v-icon>
        {{ ( 100 * Math.abs( subDiff.total / 
        totalImpact.total ) ).toFixed(1) }}%
      </p>
      
    </div>
  </v-card>
</template>

<script lang="ts">

  import { defineComponent } from "vue";
  import type { PropType } from "vue";

  import store from "@/store";
  import type { Food } from "@/store";

  import AVERAGE_DIET_IMPACT from "@/constants/average-diet-impact";

  import MetricComparison from "./MetricComparison.vue";

  interface Impact {
    emissions: number,
    waterUse: number,
    landUse: number,
    eutrophication: number,
    total: number
  }

  interface FoodImpact {
    food: string,
    amount: number,
    emissions: number,
    waterUse: number,
    landUse: number,
    eutrophication: number,
    totalImpact: number,
  }

  interface SelectItemFood {
    title: string,
    value: string
  }

  interface SelectItem {
    type?: string,
    title?: string,
    value?: string
  }

  interface Metric {
    name: string;
    key: string;
    unit: string;
    color: string;
  }

  export default defineComponent({
    components: {
      MetricComparison
    },

    props: {
      subFoodImpact: { type: Object as PropType<FoodImpact>, required: true },
      subBarMultiplier: { type: Number, required: true },

      metrics: { type: Object as PropType<Metric[]>, required: true },
      totalImpact: { type: Object as PropType<Impact>, required: true },
      numberOfDays: { type: Number, required: true},
    },

    data() {
      return {
        subCandidateName: "",
        subCandidateImpact: { 
          food: "", 
          amount: 0, 
          emissions: 0, 
          waterUse: 0, 
          landUse: 0, 
          eutrophication: 0, 
          totalImpact: 0 
        } as FoodImpact,
        subCandidates: [] as SelectItem[],
        subDiff: {} as Impact,
        impactAfterSub: {} as Impact,

        AVERAGE_DIET_IMPACT: AVERAGE_DIET_IMPACT
      }
    },

    methods: {
      loadSubCandidates(subFoodName: string) {
        const subFood = store.state.foods.find(food => food.name === subFoodName) as Food

        const suggestedFoods = this.getSuggestedFoods(subFood);
        const diffCategoryFoods = this.getDiffCategoryFoods(subFood);
        
        if (suggestedFoods.length > 0 || diffCategoryFoods.length > 0) {
          const orderedSuggestedFoods = this.getOrderedFoods(suggestedFoods);
          const orderedDiffCategoryFoods = this.getOrderedFoods(diffCategoryFoods);
          
          this.subCandidates = [{ type: "subheader", title: "Suggested" }, ...orderedSuggestedFoods, 
          { type: 'divider' }, { type: "subheader", title: "All Foods" }, ...orderedDiffCategoryFoods];
        }
      },

      getSuggestedFoods(subFood: Food): SelectItemFood[] {
        const sameCategoryFoods = store.state.foods.filter(food => food.category === subFood.category && food.name !== subFood.name);

        const suggestedFoods = sameCategoryFoods.flatMap((suggestedFood) => {
          const foodImpactDiff = 100 * ((suggestedFood.totalImpactPerKg - subFood.totalImpactPerKg) / subFood.totalImpactPerKg);

          // don't include if total impact isn't reduced
          if (foodImpactDiff >= 0) {
            return []; // flatMap so [] removes element
          }
          return { title: suggestedFood.name + ` (${Math.round(foodImpactDiff)}%)`, value: suggestedFood.name };
        })

        return suggestedFoods;
      },

      getDiffCategoryFoods(subFood: Food): SelectItemFood[] {
        const diffCategoryFoodObjs = store.state.foods.filter(food => food.category !== subFood.category)
        const diffCategoryFoods = diffCategoryFoodObjs.flatMap((food) => {
          const foodImpactDiff = 100 * ((food.totalImpactPerKg - subFood.totalImpactPerKg) / subFood.totalImpactPerKg);

          // don't include if total impact isn't reduced
          if (foodImpactDiff >= 0) {
            return [];
          }
          return { title: food.name + ` (${Math.round(foodImpactDiff)}%)`, value: food.name };
        });

        return diffCategoryFoods;
      },

      getOrderedFoods(foods: SelectItemFood[]): SelectItemFood[] {
        // sort by food impact difference (first remove all chars that are not number or -, and remove extra - chars)
        const orderedFoods = (foods).sort(function(a, b) { 
          return Number(a.title?.replace(/[^0-9-]/g, "").replace(/-{2,}/, "-")) -
                 Number(b.title?.replace(/[^0-9-]/g, "").replace(/-{2,}/, "-"));
        });

        return orderedFoods;
      },

      loadSubImpact(subCandidateName: string) {
        this.loadSubCandidateImpact(subCandidateName);
        this.loadSubDiff();
        this.loadImpactAfterSub(this.subDiff);
      },

      loadSubCandidateImpact(subCandidateName: string) {
        const subCandidate: Food = store.state.foods.find(food => food.name === subCandidateName) as Food;

        const amount = this.subFoodImpact.amount; // amount same as food being substituted

        const subCandidateImpact: FoodImpact = { 
          food: subCandidateName,
          amount: amount,
          emissions: +((amount / 1000) * subCandidate.emissionsPerKg).toFixed(2), 
          waterUse: +((amount / 1000) * subCandidate.waterUsePerKg).toFixed(2), 
          landUse: +((amount / 1000) * subCandidate.landUsePerKg).toFixed(2), 
          eutrophication: +((amount / 1000) * subCandidate.eutrophicationPerKg).toFixed(2),
          totalImpact: (amount / 1000) * subCandidate.totalImpactPerKg
        };

        this.subCandidateImpact = subCandidateImpact;
      },

      loadSubDiff() {
        const subDiff: Impact = { emissions: 0, waterUse: 0, landUse: 0, eutrophication: 0, total: 0 };
        for (let metric of this.metrics) {
          const subFoodImpact = this.subFoodImpact[metric.key as keyof FoodImpact] as number;
          const subCandidateImpact = this.subCandidateImpact[metric.key as keyof FoodImpact] as number;

          subDiff[metric.key as keyof Impact] = subCandidateImpact - subFoodImpact;
        }
        subDiff.total = this.subCandidateImpact.totalImpact - this.subFoodImpact.totalImpact;

        this.subDiff = subDiff;
      },

      loadImpactAfterSub(subDiff: Impact) {
        const impactAfterSub: Impact = { emissions: 0, waterUse: 0, landUse: 0, eutrophication: 0, total: 0 };
        
        for (let metric of this.metrics) {
          const totalImpact = this.totalImpact[metric.key as keyof Impact];

          impactAfterSub[metric.key as keyof Impact] = totalImpact + subDiff[metric.key as keyof Impact]
        }
        impactAfterSub.total = this.totalImpact.total + subDiff.total;

        this.impactAfterSub = impactAfterSub;
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
  p {
    padding-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
  }
  .subCard {
    display: flex;
    align-items: center;
    margin: 1rem;
  }
  .subText {
    padding-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: normal;
  }
</style>