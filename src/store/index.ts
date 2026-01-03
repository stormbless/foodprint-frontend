import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

import type { Store } from "vuex/types/index.js";

export interface Food {
  name: string,
  category: string,
  emissionsPerKg: number,
  waterUsePerKg: number,
  landUsePerKg: number,
  eutrophicationPerKg: number,
  totalImpactPerKg: number
}

interface State {
  userEmail: string,
  isLoggedIn: boolean,
  foods: Food[]
}

const store: Store<State> = createStore({
  state: {
    userEmail: {},
    isLoggedIn: {},
    foods: {}
  },

  mutations: {
    SET_LOGGED_IN(state: State, isLoggedIn: boolean) {
      state.isLoggedIn = isLoggedIn;
    },
    SET_USER_EMAIL(state: State, userEmail: string) {
      state.userEmail = userEmail;
    },
    SET_FOODS(state: State, foods: Food[]) {
      state.foods = foods;
    }
  },

  plugins: [createPersistedState()],
});

export default store;