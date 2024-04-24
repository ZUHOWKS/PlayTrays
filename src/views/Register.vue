<script setup lang="ts">
import { ref } from 'vue';
import {useRouter} from "vue-router";
import {Axios} from "@/services";

const router = useRouter();

if (localStorage.getItem("PTToken")) router.push('/app');

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');

function registerForm() {

  const formData = new FormData();
  formData.append('email', email.value);
  formData.append('username', username.value);
  formData.append('password', password.value);
  formData.append('passwordConfirmed', confirmPassword.value);

  Axios.post('/api/v1/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then((response) => {
    router.push('/login');

  }).catch(error => {
    //TODO: Gestion d'erreur
  });

}
</script>

<template>
  <form @submit.prevent="registerForm">
    <div>
      <label for="email">Email :</label>
      <input type="email" v-model="email" id="email" name="email" required>
    </div>
    <div>
      <label for="username">Nom d'utilisateur :</label>
      <input type="text" v-model="username" id="username" name="username" required>
    </div>
    <div>
      <label for="password">Mot de passe :</label>
      <input type="password" v-model="password" id="password" name="password" required>
    </div>
    <div>
      <label for="confirmPassword">Confirmer le mot de passe :</label>
      <input type="password" v-model="confirmPassword" id="confirmPassword" name="confirmPassword" required>
    </div>
    <button type="submit">S'enregistrer</button>
  </form>
</template>

<style scoped>

</style>