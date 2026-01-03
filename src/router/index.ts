import { createRouter, createWebHistory } from "vue-router";

import backend from "@/services/backend";
import store from "@/store";

import Login from "@/views/Login.vue";
import Dashboard from "@/views/Dashboard.vue";
import type { AxiosError } from "axios";

async function isLoggedIn(): Promise<boolean> {
  try {
    const res = await backend.post("/api/authenticate-access-token");
    console.log(res.status);
    return (res.status === 200);
  } catch (error) { // status 401 normally sent when cookie token missing or invalid
    const axiosError = error as AxiosError;
    console.log(axiosError.message);

    return false;
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "Login",
      component: Login
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: Dashboard,
      meta: { requiresAuth: true } // protected route
    }
  ],
})

// global before guard
router.beforeEach(async (to, _from, next) => {
  // if route requires auth and user is not logged in
  if (to.meta.requiresAuth && !( await isLoggedIn() )) {
    // clear store
    store.commit("SET_USER_EMAIL", null);
    store.commit("SET_FOODS", []);
    store.commit("SET_LOGGED_IN", false);
    
    // redirect to login
    next("/login");
  } else {
    // continue to route
    next();
  }
});

export default router;