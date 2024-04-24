<script setup lang="ts">
  import {ref} from "vue";
  import {useRouter} from "vue-router";
  import {Axios} from "@/services";

  const router = useRouter();

  if (localStorage.getItem("PTToken")) router.push('/app');

  const email = ref('');
  const password = ref('');

  function loginForm() {

    const formData = new FormData();
    formData.append('email', email.value);
    formData.append('password', password.value);

    Axios.post('/api/v1/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then((response) => {

      localStorage.setItem("PTToken", response.data.token);
      Axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

      router.push('/app');

    }).catch(error => {
      //TODO: Gestion d'erreur
    });

  }
</script>

<template>
  <form @submit.prevent="loginForm">
    <div>
      <label for="email">Email :</label>
      <input type="email" v-model="email" id="email" name="email" required>
    </div>
    <div>
      <label for="password">Mot de passe :</label>
      <input type="password" v-model="password" id="password" name="password" required>
    </div>
    <button type="submit">Se connecter</button>
  </form>
</template>

<style scoped>

</style>