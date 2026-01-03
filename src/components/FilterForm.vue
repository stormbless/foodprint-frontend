<template>
  <v-card class="pa-0" tile outlined>
    <v-form ref="filterForm">
      <h2>Filter Impact Data</h2>
      <v-row justify="center" class="pa-2">
        
        <v-col cols="2">
          <v-text-field
            type="date"
            v-model="startDate"
            :rules="startDateRules"
            label="Start Date"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            type="date"
            v-model="endDate"
            :rules="endDateRules"
            label="End Date"
          ></v-text-field>
        </v-col>
          
      </v-row>

      <v-row class="pa-4">

        <v-btn @click="processFilterForm" class="refreshButton">
          Refresh Data
        </v-btn>

      </v-row>

    </v-form>

  </v-card>
</template>

<script lang="ts">

  import type { PropType } from "vue";
  import { defineComponent } from "vue"

  type GetData = (startDate: string, endDate: string) => any;

  export default defineComponent({
    components: {},

    // getData is a method passed to form that is called after the form is submitted
    props: {
      getData: { 
        type: Function as PropType<GetData>, 
        required: true 
      },
    },

    data() {
      return {
        startDate: "2025-12-03", 
        startDateRules: [
          (v: string) => !!v || "Required"
        ], 
        endDate: "2025-12-03",
        // endDateRules in computed (can't access this.startDate if here)
        
      };
    },

    mounted() {
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);

      this.startDate = this.dateToString(lastWeek);
      this.endDate = this.dateToString(today);
    },
    
    methods: {
      // YYYY-MM-DD format
      dateToString(date: Date): string {
        const yearString = String(date.getFullYear()).padStart(2, "0");
        const monthString = String(date.getMonth() + 1).padStart(2, "0");
        const dayString = String(date.getDate()).padStart(2, "0");

        const dateString = `${yearString}-${monthString}-${dayString}`;

        return dateString;
      },
      

      processFilterForm(): void {
        const filterForm = this.$refs.filterForm as HTMLFormElement;
        filterForm.validate();

        if (filterForm.isValid) {
          this.getData(this.startDate, this.endDate);
        }
      },
      
    },

    computed: {
      endDateRules() {
        return [
          (v: string) => !!v || "Required", 
          (v: string) => new Date(v) >= new Date(this.startDate) || "End date must not be before start date"
        ];
      }
    }
  });

</script>

<style scoped>
  h2 {
    padding-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .refreshButton {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem auto;
    color: white !important;
    background-color: rgb(0, 92, 128) !important;
  }

</style>