<template>
  <v-app-bar app>
    <div class="appbar">
      <h1>FoodPrint</h1> 

      <v-spacer></v-spacer>

      <h2 v-if="store.state.isLoggedIn" >Account: {{ store.state.userEmail }}</h2>

      <v-spacer></v-spacer>

      <v-btn v-if="store.state.isLoggedIn"
        class="button"
        @click="logOut"
      >
        Log Out
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script lang="ts">
  import { defineComponent } from "vue";

  import backend from "@/services/backend";
  import store from "@/store";

  export default defineComponent({

    data: () => ({
      store: store,
      userEmail: store.state.userEmail
    }),
    methods: {
      async logOut() {
        // clear cookies
        try {
          await backend.post("/api/logout");
        } catch (error) {
          console.log(error);
        }
        
        // clear store
        store.commit("SET_USER_EMAIL", null);
        store.commit("SET_FOODS", []);
        store.commit("SET_LOGGED_IN", false);

        // go to login
        this.$router.push({ path: "/login" });
      },
    },
  });
</script>

<style scoped>
h1 {
  margin-left: 0.5em;
}

h2 {
  font-size: large;
}

.appbar {
  display: flex;
  align-items: center;
  width: 100%;
}

.button {
  margin: 2rem auto;
  margin-right: 1rem;
  color: white !important;
  background-color: rgb(0, 92, 128) !important;
}

p{
  font-size: small;
  padding-bottom:0.1rem;
}

</style>
