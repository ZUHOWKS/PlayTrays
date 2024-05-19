import {createRouter, createWebHistory} from "vue-router";

import Home from "./views/Home.vue";
import SignInUp from "./views/SignInUp.vue";
import Menu from "@/views/Menu.vue";
import Game from "@/views/Game.vue";

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: SignInUp },
    { path: '/register', component: SignInUp },
    { path: '/app', component: Menu },
    { path: '/game', component: Game },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router