
<template>
  <section class="sticky">
    <v-app>
      <Header></Header>
      <v-main class="main">
        <router-view />
      </v-main>
    </v-app>
  </section>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  
  import store from "@/store";

  import Header from "@/components/Header.vue";
  
  // defineComponent enables type inference inside component
  export default defineComponent({ 
    name: "App",
    components: {
      Header,
    },

    data: () => ({
      store: store
    })
  })
  
</script>

<style scoped>
  .main {
    background-color: #ADD8E6;
    
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
  }
</style>
