// max metric (after standardising) in foods table has been calculated to be beef's eutrophication (428.69 g / kg)
// standardized by dividing each metric value by avg per day (found in src/constants/average-diet-impact.ts)

// needed for highlighting table (max highlight color intensity is for max metric (when standardized))

const MAX_METRIC_PER_KG_STANDARDIZED = 13.61;

export default MAX_METRIC_PER_KG_STANDARDIZED;

// should dataset need checking in the future, the following method can be used

/*
  findMaxMetric(): void {
    // standardise foods according to avg metric per day so metrics can be comparwd
    const standardisedFoodImpactsPerKg: Food[] = store.state.foods.map((foodImpact) => {
      return {
        ...foodImpact,
        emissionsPerKg: foodImpact.emissionsPerKg / AVERAGE_DIET_IMPACT.emissionsPerDay,
        waterUsePerKg: foodImpact.waterUsePerKg / AVERAGE_DIET_IMPACT.waterUsePerDay,
        landUsePerKg: foodImpact.landUsePerKg / AVERAGE_DIET_IMPACT.landUsePerDay,
        eutrophicationPerKg: foodImpact.eutrophicationPerKg / AVERAGE_DIET_IMPACT.eutrophicationPerDay
      };
    });
    
    // get max metric impact from standardised food impacts (checking each metric)
    let maxMetricImpact = 0;

    for (let foodImpact of standardisedFoodImpactsPerKg) {
      for (let metric of this.metrics) {
        const impact = foodImpact[metric.key + "PerKg" as keyof Food] as number;

        if (impact > maxMetricImpact) {
          maxMetricImpact = impact;
          console.log(foodImpact.name);
          console.log(metric.key);
          console.log(foodImpact[metric.key + "PerKg" as keyof Food]);
        }
      }
    }

    console.log(maxMetricImpact);
  },
*/
