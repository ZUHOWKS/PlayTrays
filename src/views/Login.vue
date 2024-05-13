<script setup lang="ts">
  import {ref} from "vue";
  import {useRouter} from "vue-router";
  import AccountServices from "@/services/account_services";

  const router = useRouter();

  if (AccountServices.isLogged()) router.push('/app');

  const email = ref('');
  const password = ref('');

  function loginForm() {

    const formData: FormData = new FormData();
    formData.append('email', email.value);
    formData.append('password', password.value);

    AccountServices.login(formData).then((response) => {
      AccountServices.registerToken(response.data.token);
      router.push('/app');

    }).catch(error => {
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
    <form @submit.prevent="loginForm" class="test">
      <div>
        <label for="email">Email :</label>
        <input type="email" v-model="email" id="email" name="email" required>
      </div>
      <div>
        <label for="password">Password :</label>
        <input type="password" v-model="password" id="password" name="password" required>
      </div>
      <button type="submit" class="r_button">Login</button>
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
  /* background-image: url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLK28gM_Wd78MjaifMEzGLphnCyKnXgpjfHA&s);
  background-position: center;
  background-size: cover; */
  background : linear-gradient(#edf065, #d077e2c7);
  height : 92.5vh;
  width : 100vw;
}

.test {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  margin: 10%;
  padding: 7%;
  border: 1px solid #000;
  border-radius: 3vw;
  background-color: #f3f7d5;
}

.test>div {
  display : grid;
  grid-template-columns : 55% 85%;
  font-size: 1.5vw;
  font-style: italic;
  font-weight: 600;
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