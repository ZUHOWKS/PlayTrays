<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AccountServices from "@/services/account_services";

const router = useRouter();

if (AccountServices.isLogged()) router.push("/app");

const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");

function registerForm() {
  const formData = new FormData();
  formData.append("email", email.value);
  formData.append("username", username.value);
  formData.append("password", password.value);
  formData.append("passwordConfirmed", confirmPassword.value);

  AccountServices.register(formData)
    .then((response) => {
      formData.delete("username");
      formData.delete("passwordConfirmed");

      AccountServices.login(formData)
        .then((response) => {
          AccountServices.registerToken(response.data.token);
          router.push("/app");
        })
        .catch((error) => {
          router.push("/login");
        });
    })
    .catch((error) => {
      //TODO: Gestion d'erreur
    });
}
</script>

<template>
  <header @click="() => router.push('/')">
    <img src="@/assets/image/logoPT(1).png" alt="PlayTrays Logo" class="logo">
    <h1>PlayTrays</h1>
  </header>
  <main>
    <form @submit.prevent="registerForm" class="test">
      <div class="r_email">
        <label for="email">Email :</label>
        <input type="email" v-model="email" id="email" name="email" required />
      </div>
      <div class="r_nom-user">
        <label for="username">User name :</label>
        <input type="text" v-model="username" id="username" name="username" required />
      </div>
      <div class="r_mdp">
        <label for="password">Password :</label>
        <input type="password" v-model="password" id="password" name="password" required />
      </div>
      <div class="r_confirmation">
        <label for="confirmPassword">Confirm password :</label>
        <input
          type="password"
          v-model="confirmPassword"
          id="confirmPassword"
          name="confirmPassword"
          required
        />
      </div>
      <button type="submit" class="r_button">Sign up</button>
    </form>
  </main>
</template>

<style scoped>

header {
  width: 4vw;
  display : flex;
  flex-direction : row;
  cursor : pointer;
}

h1 {
  width : 1vw;
  height : 1vh;
  font-size : 2.62vw;
}

.logo {
  margin : 5%;
  width: 95%;
  height: 5%;
  transition: transform 0.6s ease-in-out; 
}

.logo:hover {
    transform: rotate(360deg); 
}

main {
  display: flex;
  justify-content : center;
  border-top: 2px solid black;
  background : linear-gradient(#edf065, #d077e2c7);
  height : 92.5vh;
  width : 100vw;
}

.test {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  margin: 5%;
  padding: 7%;
  border: 1px solid #000;
  border-radius: 3vw;
  background-color: #f3f7d5;
}

.test>div {
  display : grid;
  grid-template-columns : 55% 70%;
  font-size: 1.5vw;
  font-style: italic;
  font-weight: 600;
  font-style: italic;
  justify-content: center;
  margin-bottom : 10%;
}

input {
  font-size : 0.7em;
  color:#5e5e56;
}

.r_button {
  width : 12vw;
  height : 5vh;
  font-size : 1.6vw;
  font-family: "Poetsen One", sans-serif;
  background-color : rgba(255, 255, 255, 0.6);
  box-shadow : 0.7vw 0.7vh 1.5em rgba(0, 0, 0, 0.5);
  margin-top: 7vh;
  align-self: center;
}

</style>
