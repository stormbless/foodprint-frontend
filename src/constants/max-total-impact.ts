// max total impact in foods table has been calculated to be 8.57 (AVG diet days) (Beef)

// needed for highlighting impact / kg table (max highlight color intensity is for max total impact)

const MAX_TOTAL_PER_KG = 8.57;

export default MAX_TOTAL_PER_KG;

// should dataset need checking in the future, the following method can be used

/*
  findMaxMetric(): void {
    const totalImpacts: number[] = store.state.foods.map((foodImpact) => {
      return foodImpact.totalImpactPerKg;
    });

    console.log(Math.max(...totalImpacts));
  },
*/
