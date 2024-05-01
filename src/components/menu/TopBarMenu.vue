<script setup lang="ts">

import AccountServices from "@/services/account_services";
import {useRouter} from "vue-router";
const router = useRouter();

</script>

<template>
  <button class="logout" @click="AccountServices.logout(router)">
    Logout
  </button>
</template>

<style scoped>

</style>