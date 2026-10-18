import { createRouter, createWebHistory } from "vue-router";
import AnalysisView from "./views/AnalysisView.vue";
import HomeView from "./views/HomeView.vue";
import NotFoundView from "./views/NotFoundView.vue";
import UploadView from "./views/UploadView.vue";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/upload", name: "upload", component: UploadView },
    { path: "/analysis", name: "analysis", component: AnalysisView },
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundView },
  ],
});
