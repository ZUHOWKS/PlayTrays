<script setup lang="ts">

import {type Router, useRouter} from "vue-router";
import {reactive, type Ref, ref} from "vue";
import type User from "@/modules/utils/User";
import AccountServices from "@/services/account_services";
import MainMenu from "@/components/menu/MainMenu.vue";
import TopBarMenu from "@/components/menu/TopBarMenu.vue";

const router: Router = useRouter();
if (!AccountServices.isLogged()) AccountServices.logout(router);

// permet de stocker de manière dynamique des variables utiles pour les composants
const menuInfo = reactive({
  page: "main"
});

const user: Ref<User> = ref({
  id: -1,
  username: '',
  points: -1,
  updatedAt: '',
  createdAt: ''
})

function init() {
  AccountServices.getUserInfos().then((response) => {
    user.value.id = response.data.id;
    user.value.username = response.data.username;
    user.value.points = response.data.points;
    user.value.updatedAt = response.data.updatedAt;
    user.value.createdAt = response.data.createdAt;
  }).catch(error => {
    AccountServices.logout(router);
  })
}

init();

</script>

<template>
  <!-- Bar de navigation -->
  <nav class="side-nav">

  </nav>

  <!-- Contenue de la page ainsi que la top bar -->
  <main>
    <section class="top-section">
      <TopBarMenu></TopBarMenu>
    </section>

    <!-- Contenue de la page -->
    <section class="container-section">
      <!--
        Le contenue de la catégorie sélectionné via la barre de navigation
        sera placé dans cette section

        Ainsi ce qui reste affiché de manière permanente dans le menu sera
        la Side Nav & la Barre Top
      -->

      <!-- Affiche de manière conditionnel un des composants -->
      <MainMenu v-if="menuInfo.page == 'main'"></MainMenu>

    </section>
  </main>
</template>

<style scoped>

</style>