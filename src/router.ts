import {createRouter, createWebHistory} from "vue-router";

import Home from "./views/Home.vue";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import Menu from "@/views/Menu.vue";
import Game from "@/views/Game.vue";

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/app', component: Menu },
    { path: '/game', component: Game },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router