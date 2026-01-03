<template>
  <h2>Summary</h2>
  <p class="bigText">Eco Grade: 
    <strong style="margin-left: 0.25em;"> {{ (impactSummary.grades.overallGrade) }} </strong>
  </p>
  <p class="bigText">Total Impact: 
    <strong style="margin-left: 0.25em;"> {{ (impactSummary.percentageOfAvg.total) }} </strong>
    % of Average Diet
  </p>

  <GChart
    class="summaryChart"
    type="ColumnChart"
    :data="summaryChartData"
    :options="summaryChartOptions"
  />

  <!-- Table -->
  <h3>Total Impact</h3>
  <v-table class="summaryTable" density="compact">
    <thead>
      <tr>
        <th v-for= "header in summaryHeaders">
          {{ header }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="metric in metrics"
        :key="metric.key"
      >
      
        <td>{{ metric.name }}</td>
        <td>{{ impactSummary.grades[metric.key + "Grade" as keyof Grades] }}</td>
        <td>{{ (impactSummary.totalImpact[metric.key as keyof Impact]).toFixed(2) }} {{ metric.unit }}
          ({{ (impactSummary.percentageOfAvg[metric.key as keyof Impact]) }}% of avg)
        </td>
        <td>{{ (impactSummary.avgImpact[metric.key as keyof Impact]).toFixed(2) }} {{ metric.unit }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script lang="ts">

  import { defineComponent } from "vue"
  import type { PropType } from "vue"

  import { GChart } from "vue-google-charts";

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

  interface Metric {
    name: string;
    key: string;
    unit: string;
    color: string;
  }

  export default defineComponent({
    components: {
      GChart
    },

    props: {
      impactSummary:  {
        type: Object as PropType<ImpactSummary>,
        required: true,
      },
      metrics: {
        type: Object as PropType<Metric[]>,
        required: true,
      }
    },

    data() {
      return {
        summaryHeaders: ["Metric", "Grade", "Impact", "Average"],
        summaryChartOptions: {
          title: 'Diet Impact (Relative to Average)',
          subtitle: 'as % of average',
          bar: { groupWidth: "35%" },
          height: 400,
          width: 800,
          legend: { position: "none" },
          vAxis: {
            title: 'Percentage Of Average Diet (%)',
            ticks: [0, 100]
          }
        },

      }
    },

    computed: {
      summaryChartData() {
        //console.log(JSON.stringify(impactSummary));
        const emissionsPercentage: number = this.impactSummary.percentageOfAvg.emissions;
        const waterPercentage: number = this.impactSummary.percentageOfAvg.waterUse;
        const landPercentage: number = this.impactSummary.percentageOfAvg.landUse;
        const eutrophicationPercentage: number = this.impactSummary.percentageOfAvg.eutrophication;

        const summaryChartData = [
          ['Metric', '% of Avg', { role: 'annotation' }, { role: 'style' }],
          ['Emissions', emissionsPercentage, emissionsPercentage, 'red'], 
          ['Water Use', waterPercentage, waterPercentage, 'blue'],
          ['Land Use', landPercentage, landPercentage, 'green'],
          ['Eutrophication', eutrophicationPercentage, eutrophicationPercentage, 'purple']
        ];

        return summaryChartData;
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
  .bigText {
    font-size: larger;
    font-weight: normal;
  }
  .summaryChart {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem;
  }
  .summaryTable {
    max-width: 39rem;
    margin:auto
  }
</style>