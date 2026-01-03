
<template>
  <div style="justify-content: center; align-items: center; align-self: center;">
    <v-row justify="center">
      <v-card class="loginFormCard" elevation="2">
        <v-form
          ref="loginForm"
          v-on:keyup.enter="processLoginForm"
          class="loginForm"
          v-model="loginFormValid"
        >
          <v-container>
            <h2 class="loginTitle">Login</h2>

            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="Email"
              required
            ></v-text-field>

            <v-text-field
              :type="'password'"
              v-model="password"
              :rules="passwordRules"
              label="Password"
              required
            ></v-text-field>

            <v-btn @click="processLoginForm" class="loginButton">
              Login
            </v-btn>
          </v-container>
        </v-form>
      </v-card>
  </v-row>
  </div>
</template>

<script lang="ts">

  import { defineComponent } from "vue"

  import backend from "@/services/backend";
  import store from "@/store";


  import type { Food } from "@/store";

  export default defineComponent({
    data: () => ({
      loginFormValid: false,
      email: "",
      emailRules: [
        (v: string) => !!v || "Email is required",
        (v: string) => /^\S+@\S+\.\S+$/.test(v) || "Email must be valid",
        (v: string) => v.length <= 100 || "Email must be 100 characters or less",
      ],
      password: "",
      passwordRules: [
        (v: string) => !!v || "Password is required",
        (v: string) => v.length >= 12 || "Password must be at least 12 characters long",
      ]
    }),
    
    methods: {
      processLoginForm(): void {
        const loginForm = this.$refs.loginForm as HTMLFormElement;

        loginForm.validate();

        if (loginForm.isValid) {
          this.postLogin();
        }
      },

      async postLogin(): Promise<void> {
        this.$toast.clear();

        try {
          this.$toast.open({
            message: "Logging In...",
            type: "info",
            position: "bottom",
          });

          const res = await backend.post("/api/login", { userEmail: this.email, userPassword: this.password })
          console.log(res.status);
          console.log('backend Url: ' + import.meta.env.VITE_BACKEND_URL);

          // commit user email, list of foods with total impact / kg and set logged in to true in store
          store.commit("SET_USER_EMAIL", res.data.userEmail);
          store.commit("SET_FOODS", res.data.foodImpactsPerKg as Food[]);
          store.commit("SET_LOGGED_IN", true);
          
          this.login(); 
        } catch (err) {
          this.$toast.open({
            message: "Incorrect Email or Password",
            position: "bottom",
            type: "error",
          });
          console.log(err);
        }
      },

      login(): void {
        //this.$toast.clear();
        this.$router.push({ path: "/dashboard" });
      }
    },
  });

</script>

<style scoped>
.loginTitle {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5em;
}
.loginFormCard {
  /* display: flex; */
  justify-content: center;
  /* align-items: center; */
  padding-top: 3rem;
  height: 22rem;
  margin: 4rem;
  width: 40%;
}
.loginForm {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 0rem;
  height: 200px;
}
.loginButton {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  margin: 1rem auto;
  color: white !important;
  background-color: rgb(0, 92, 128) !important;
}
</style>
