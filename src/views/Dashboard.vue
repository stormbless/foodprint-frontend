<template>
  <div>
    <h1>Environmental Impact Dashboard</h1>
    <FilterForm :getData="getDashboardData" />

    <v-card v-if="impactSummary.grades.overallGrade !== ''" class="pa-0" tile outlined>
      
      <Summary :impactSummary="impactSummary" :metrics="metrics" />

      <FoodBreakdown 
        :foodImpacts="foodImpacts" 
        :foodImpactsPercentage="foodImpactsPercentage" 
        :foodImpactsPerKg="foodImpactsPerKg"  
        :showSubAnalysis="showSubAnalysis"
        :totalImpact="impactSummary.totalImpact.total"
      />

      <v-dialog
        v-model="subActive"
        width="45.5rem"
        height="85%"
      >
        <SubAnalysis 
          :subActive="subActive"
          :subFoodImpact="subFoodImpact"
          :subBarMultiplier="subBarMultiplier"

          :metrics="metrics" 
          :totalImpact="impactSummary.totalImpact" 
          :numberOfDays="numberOfDays"
        />
      </v-dialog>

      <ImpactOverTime 
        :totalImpactOverTime="totalImpactOverTime"
        :emissionsOverTime="emissionsOverTime"
        :waterUseOverTime="waterUseOverTime"
        :landUseOverTime="landUseOverTime"
        :eutrophicationOverTime="eutrophicationOverTime"
      />

    </v-card>
  </div>
</template>

<script lang="ts">

  import { defineComponent } from "vue"

  import backend from "../services/backend";
  import store from "@/store";

  import type { Food } from "@/store";

  import AVERAGE_DIET_IMPACT from "@/constants/average-diet-impact";
  
  import FilterForm from "@/components/FilterForm.vue";
  import Summary from "@/components/Summary.vue";
  import FoodBreakdown from "@/components/FoodBreakdown.vue";
  import SubAnalysis from "@/components/SubAnalysis.vue";
  import ImpactOverTime from "@/components/ImpactOverTime.vue";

  interface ImpactSummary {
    totalImpact: Impact,
    avgImpact: Impact,
    percentageOfAvg: Impact,
    grades: Grades,
  }

  interface Impact {
    emissions: number,
    waterUse: number,
    landUse: number,
    eutrophication: number,
    total: number
  }

  interface Grades {
    emissionsGrade: string,
    waterUseGrade: string,
    landUseGrade: string,
    eutrophicationGrade: string,
    overallGrade: string
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

  interface DateImpact {
    date: Date,
    emissions: number,
    waterUse: number,
    landUse: number,
    eutrophication: number,
    total: number
  }
  

  export default defineComponent({
    components: {
      FilterForm,
      Summary,
      FoodBreakdown,
      SubAnalysis,
      ImpactOverTime,
    },

    data() {
      return {
        store: store,
        
        numberOfDays: 0, // number of days the date range for incoming impact data covers
        metrics: [ // used for summary table and substitution analysis
          { name: "Emissions", key: "emissions", unit: "kg", color: "red-lighten-4"}, 
          { name: "Water Use", key: "waterUse", unit: "L", color: "blue-lighten-4"}, 
          { name: "Land Use", key: "landUse", unit: "m2", color: "green-lighten-4"}, 
          { name: "Eutrophication", key: "eutrophication", unit: "g", color: "deep-purple-lighten-4"}
        ],

        impactSummary: {
          totalImpact: { emissions: 0, waterUse: 0, landUse: 0, eutrophication: 0, total: 0 }, 
          avgImpact: { emissions: 0, waterUse: 0, landUse: 0, eutrophication: 0, total: 0 },
          percentageOfAvg: { emissions: 0, waterUse: 0, landUse: 0, eutrophication: 0, total: 0 },
          grades: { emissionsGrade: "", waterUseGrade: "", landUseGrade: "", eutrophicationGrade: "", overallGrade: "" }
        } as ImpactSummary,

        foodImpactsPerKg: [] as Food[],
        foodImpacts: [] as FoodImpact[],
        foodImpactsPercentage: [] as FoodImpact[],

        subActive: false,
        subFoodImpact: {} as FoodImpact,
        subBarMultiplier: 0,

        totalImpactOverTime: [] as (string | number | Date)[][],
        emissionsOverTime: [] as (string | number | Date)[][],
        waterUseOverTime: [] as (string | number | Date)[][],
        landUseOverTime: [] as (string | number | Date)[][],
        eutrophicationOverTime: [] as (string | number | Date)[][],
      };
    },

    mounted() {},
    
    methods: {
      async getDashboardData(startDate: string, endDate: string): Promise<void> {
        this.$toast.open({
          message: "Loading...",
          type: "info",
          position: "bottom",
        });
        try {
          this.impactSummary = await this.getImpactSummary(startDate, endDate);

          const foodImpacts: FoodImpact[] = await this.getFoodImpacts(startDate, endDate);
          this.setFoodImpacts(foodImpacts);
          this.setFoodImpactsPercentage(foodImpacts);
          this.setFoodImpactsPerKg(foodImpacts, store.state.foods);
          this.setSubBarMultiplier(this.foodImpacts);

          const impactOverTime = await this.getImpactOverTime(startDate, endDate);
          this.resetOverTimeData();
          this.setImpactOverTime(impactOverTime);
          this.numberOfDays = impactOverTime.length;

          this.$toast.clear();
        } catch (err: unknown) {
          this.$toast.clear();

          let msg = "Dashboard data failed to load";
          if (err instanceof Error && err.message === 'No Entries Available') {
            msg = err.message;
          }

          this.$toast.open({
            message: msg,
            position: "bottom",
            type: "error",
          });

          console.log(err);
        }
      },

      async getImpactSummary(startDate: string, endDate: string): Promise<ImpactSummary> {
        const res = await backend.get("/api/impact-summary", { 
          userEmail: store.state.userEmail, 
          startDate: startDate, 
          endDate: endDate 
        })
        console.log(res.status);

        if (res.status === 204) { throw Error('No Entries Available') }

        return res.data as ImpactSummary;
      },

      async getFoodImpacts(startDate: string, endDate: string): Promise<FoodImpact[]> {
        const res = await backend.get("/api/food-impacts", { 
          userEmail: store.state.userEmail, 
          startDate: startDate, 
          endDate: endDate 
        })
        console.log(res.status);

        return res.data as FoodImpact[];
      },

      setFoodImpacts(foodImpacts: FoodImpact[]): void {
        this.foodImpacts = foodImpacts.map(foodImpact => {
          return {
            ...foodImpact,
            emissions: +foodImpact.emissions.toFixed(2),
            waterUse: +foodImpact.waterUse.toFixed(2),
            landUse: +foodImpact.landUse.toFixed(2),
            eutrophication: +foodImpact.eutrophication.toFixed(2),
          }
        });
      },

      setFoodImpactsPercentage(foodImpacts: FoodImpact[]): void {
        this.foodImpactsPercentage = foodImpacts.map((foodImpact) => {
          const totalImpactPercentage = 100 * (foodImpact.totalImpact / this.impactSummary.totalImpact.total);

          const emissionsPercentage = 100 * foodImpact.emissions / this.impactSummary.totalImpact.emissions;
          const waterPercentage = 100 * foodImpact.waterUse / this.impactSummary.totalImpact.waterUse;
          const landPercentage = 100 * foodImpact.landUse / this.impactSummary.totalImpact.landUse;
          const eutrophicationPercentage = 100 * foodImpact.eutrophication / this.impactSummary.totalImpact.eutrophication;

          return { ...foodImpact,
            amount: +(foodImpact.amount).toFixed(2),
            emissions: +emissionsPercentage.toFixed(1),
            waterUse: +waterPercentage.toFixed(1),
            landUse: +landPercentage.toFixed(1),
            eutrophication: +eutrophicationPercentage.toFixed(1),
            totalImpact: +totalImpactPercentage.toFixed(1) };
        });
      },

      setFoodImpactsPerKg(foodImpacts: FoodImpact[], foods: Food[]): void {
        // filter foodimpact/kg data according to whether food present in user's food impacts
        const impactFoodNames = foodImpacts.map(foodImpact => foodImpact.food);
        const filteredFoods = foods.filter(food => impactFoodNames.includes(food.name));

        this.foodImpactsPerKg = filteredFoods.map((foodImpact) => {
          const totalImpactPercentage = 100 * (foodImpact.totalImpactPerKg / this.impactSummary.totalImpact.total);

          return { ...foodImpact,
            emissionsPerKg: +(foodImpact.emissionsPerKg).toFixed(2),
            waterUsePerKg: +(foodImpact.waterUsePerKg).toFixed(2),
            landUsePerKg: +(foodImpact.landUsePerKg).toFixed(2),
            eutrophicationPerKg: +(foodImpact.eutrophicationPerKg).toFixed(2),
            totalImpactPerKg: +(totalImpactPercentage).toFixed(1) };
        });
      },

      async getImpactOverTime(startDate: string, endDate: string): Promise<DateImpact[]> {
        const res = await backend.get("/api/impact-over-time", { 
          userEmail: store.state.userEmail, 
          startDate: startDate, 
          endDate: endDate 
        })
        console.log(res.status);

        return res.data as DateImpact[];
      },

      setSubBarMultiplier(foodImpacts: FoodImpact[]): void {
        // standardise food impacts according to avg metric per day so metrics can be comparwd
        const standardisedFoodImpacts: FoodImpact[] = foodImpacts.map((foodImpact) => {
          return {
            ...foodImpact,
            emissions: foodImpact.emissions / AVERAGE_DIET_IMPACT.emissionsPerDay,
            waterUse: foodImpact.waterUse / AVERAGE_DIET_IMPACT.waterUsePerDay,
            landUse: foodImpact.landUse / AVERAGE_DIET_IMPACT.landUsePerDay,
            eutrophication: foodImpact.eutrophication / AVERAGE_DIET_IMPACT.eutrophicationPerDay
          };
        });
        
        // get max metric impact from standardised food impacts (checking each metric)
        let maxMetricImpact = 0;
  
        for (let foodImpact of standardisedFoodImpacts) {
          for (let metric of this.metrics) {
            const impact = foodImpact[metric.key as keyof FoodImpact] as number;
  
            if (impact > maxMetricImpact) {
              maxMetricImpact = impact;
            }
          }
        }

        // bar Length multiplier is such that maxMetricImpact is a full bar (100) and everything else is standardised to that scale
        this.subBarMultiplier = 100 / maxMetricImpact;
      },

      resetOverTimeData(): void {
        this.totalImpactOverTime = [];
        this.emissionsOverTime = [];
        this.waterUseOverTime = [];
        this.landUseOverTime = [];
        this.eutrophicationOverTime = [];
      },

      setImpactOverTime(impactOverTime: DateImpact[]): void {
        // x-axis, series 1, series 2
        this.totalImpactOverTime.push([ "Date", "You", "Avg" ]);
        this.emissionsOverTime.push([ "Date", "You", "Avg" ]);
        this.waterUseOverTime.push([ "Date", "You", "Avg"  ]);
        this.landUseOverTime.push([ "Date", "You", "Avg"  ]);
        this.eutrophicationOverTime.push([ "Date", "You", "Avg"  ]);
        
        // map impact over time data into formats appropriate for line graphs
        for (let impact of impactOverTime) {
          const date = new Date(impact.date);
          
          this.totalImpactOverTime.push([date, impact.total, AVERAGE_DIET_IMPACT.totalPerDay]);
          this.emissionsOverTime.push([date, impact.emissions, AVERAGE_DIET_IMPACT.emissionsPerDay]);
          this.waterUseOverTime.push([date, impact.waterUse, AVERAGE_DIET_IMPACT.waterUsePerDay]);
          this.landUseOverTime.push([date, impact.landUse, AVERAGE_DIET_IMPACT.landUsePerDay]);
          this.eutrophicationOverTime.push([date, impact.eutrophication, AVERAGE_DIET_IMPACT.eutrophicationPerDay]);
        }
      },

      showSubAnalysis(foodName: string): void {
        this.subFoodImpact = this.foodImpacts.find(foodImpact => foodImpact.food === foodName) as FoodImpact;
        this.subActive = true;
      },
    },
  });

</script>

<style scoped>
  h1, h2, h3 {
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
</style>