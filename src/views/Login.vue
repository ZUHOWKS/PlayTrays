<script setup lang="ts">
import {onMounted, type Ref, ref} from "vue";
  import {useRouter} from "vue-router";
  import AccountServices from "@/services/account_services";

  const router = useRouter();

  if (AccountServices.isLogged()) router.push('/app');

  const isLoginMode: Ref<boolean> = ref(true);
  const signUpMode: Ref<HTMLElement | null> = ref(null)
  const loginMode: Ref<HTMLElement | null> = ref(null)
  const signFiller: Ref<HTMLElement | null> = ref(null)

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

  function switchSignMode() {
    if (signUpMode.value && loginMode.value && signFiller.value) {
      isLoginMode.value = !isLoginMode.value
      if (!isLoginMode.value) {
        signUpMode.value.style.transform = "translateX(0)"
        loginMode.value.style.transform = "translateX(200%)"
      } else {
        signUpMode.value.style.transform = "translateX(-200%)"
        loginMode.value.style.transform = "translateX(0)"
      }
    }
  }
</script>

<template>
  <header @click="() => router.push('/')">
    <div class="header-content">
      <img src="@/assets/image/logoPT(1).png" alt="PlayTrays Logo" class="logo">
      <h1>PlayTrays</h1>
    </div>
  </header>
  <main>
    <div class="row forms">
      <form @submit.prevent="loginForm" class="test">
        <h2>Login</h2>
        <div class="inputs">
          <input type="email" v-model="email" id="email" name="email" required placeholder="Email">
          <input type="password" v-model="password" id="password" name="password" required placeholder="Password">
        </div>
        <button type="submit" class="login-button">Login</button>
      </form>
      <form @submit.prevent="loginForm" class="test">
        <div>
          <input type="email" v-model="email" id="email" name="email" required>
        </div>
        <div>
          <input type="password" v-model="password" id="password" name="password" required>
        </div>
        <button type="submit" class="login-button">Login</button>
      </form>
    </div>
    <div class="sign-mode-filler" ref="signFiller">
      <div class="login-mode sign-mode-content" ref="loginMode">
        <h2>Welcome Back !</h2>
        <button @click="switchSignMode" class="switch-button">You are not register ?</button>
      </div>
      <div class="sign-up-mode sign-mode-content" ref="signUpMode">
        <h2>Welcome !</h2>
        <button @click="switchSignMode" class="switch-button">You have an account ?</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
header {
  height: 10vh;
  position: relative;
  margin : 1% 5%;
  display : flex;
  justify-content: center;
}

h1 {
  font-size : 2.62vw;
}

.logo {

  height: 5vh;
  transition: transform 0.6s ease-in-out;
}

.header-content {
  cursor : pointer;
  display : flex;
  flex-direction : row;
  align-items: center;
  justify-content: center;
  width: max-content;
  margin: 0 50%;
}

.header-content:hover>.logo {
    transform: rotate(360deg);
}

main {
  width: 100vw;
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 10vh;
  left: 0;
}

.forms {
  border-radius: 20px;
  align-items: center;
  width: 60%;
  height: 70%;
  box-shadow: 0px 8px 20px rgba(0,0,0, 0.15);
}

.forms>form {
  width: 100%;
  margin: 2% 4%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

form>.inputs {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  margin: 5% 0;
}

.inputs>input {
  width: 95%;
  height: 4vh;
  font-size: 2vh;
  margin: 2.5% 2.5%;
  padding: 0.25% 1%;
  background: rgba(var(--link-color), 0.25);
  border: none;
}

.sign-mode-filler {
  position: absolute;
  background: linear-gradient(120deg, rgb(var(--primary-color)) -175%, rgb(var(--secondary-color)) 100%);
  width: 30%;
  left: 50%;
  height: 70%;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: left 1s ease-in-out;
}

.sign-mode-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  transition: transform 1s 0.5s ease-in-out;
}

.sign-up-mode {
  transform: translateX(-200%);
}

</style>