<script setup lang="ts">

  import {useRouter} from "vue-router";
  import {type Ref, ref} from "vue";
  import type User from "@/modules/utils/User";
  import {Axios} from "@/services";

  const router = useRouter();
  if (!localStorage.getItem("PTToken")) router.push('/login');

  Axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("PTToken")}`;

  const user: Ref<User> = ref({
    id: -1,
    username: '',
    points: -1,
    updatedAt: '',
    createdAt: ''
  })

  function init() {
    Axios.get('/api/v1/user/info').then((response) => {
      user.value.id = response.data.id;
      user.value.username = response.data.username;
      user.value.points = response.data.points;
      user.value.updatedAt = response.data.updatedAt;
      user.value.createdAt = response.data.createdAt;
    })
  }

  init();

  function logout() {
    localStorage.removeItem("PTToken");
    router.push('/');
  }
</script>

<template>
  <p>{{user.username}}</p>
  <p>{{user.points}} points</p>

  <button class="logout" @click="logout">
    Logout
  </button>
</template>

<style scoped>

</style>