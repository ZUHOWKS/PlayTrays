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

  const registerFormContainer: Ref<HTMLElement | null> = ref(null)
  const loginFormContainer: Ref<HTMLElement | null> = ref(null)

  const loginEmail = ref('');
  const loginPassword = ref('');
  const registerEmail = ref("");
  const registerUsername = ref("");
  const registerPassword = ref("");
  const registerConfirmPassword = ref("");


function loginForm() {

    const formData: FormData = new FormData();
    formData.append('email', loginEmail.value);
    formData.append('password', loginPassword.value);

    AccountServices.login(formData).then((response) => {
      AccountServices.registerToken(response.data.token);
      router.push('/app');

    }).catch(error => {
      //TODO: Gestion d'erreur
    });

  }
  onMounted(() => {
    addEventListener("resize", (event) => {
      const width = window.innerWidth;
      if (signUpMode.value && loginMode.value && signFiller.value && loginFormContainer.value && registerFormContainer.value) {

        signUpMode.value.style.visibility = "hidden"
        loginMode.value.style.visibility = "hidden"


        if (width > 800) {
          signUpMode.value.style.transform = "translateY(0)"
          registerFormContainer.value.style.transform = "translateY(0)"

          loginMode.value.style.transform = "translateY(0)"
          loginFormContainer.value.style.transform = "translateY(0)"
          signFiller.value.style.top = "unset"


          if (!isLoginMode.value) {
            signUpMode.value.style.transform = "translateX(0)"
            registerFormContainer.value.style.transform = "translateX(0)"


            loginMode.value.style.transform = "translateX(200%)"
            loginFormContainer.value.style.transform = "translateX(-200%)"

            signFiller.value.style.left = "20%"

          } else {
            signUpMode.value.style.transform = "translateX(-200%)"
            registerFormContainer.value.style.transform = "translateX(200%)"

            loginMode.value.style.transform = "translateX(0)"
            loginFormContainer.value.style.transform = "translateX(0)"

            signFiller.value.style.left = "50%"
          }
        } else {
          signUpMode.value.style.transform = "translateX(0)"
          registerFormContainer.value.style.transform = "translateX(0)"

          loginMode.value.style.transform = "translateX(0)"
          loginFormContainer.value.style.transform = "translateX(0)"

          signFiller.value.style.left = "unset"

          if (!isLoginMode.value) {
            signUpMode.value.style.transform = "translateY(0)"
            registerFormContainer.value.style.transform = "translateY(0)"

            loginMode.value.style.transform = "translateY(300%)"
            loginFormContainer.value.style.transform = "translateY(-200%)"

            signFiller.value.style.top = "15%"

          } else {
            signUpMode.value.style.transform = "translateY(-300%)"
            registerFormContainer.value.style.transform = "translateY(200%)"

            loginMode.value.style.transform = "translateY(0)"
            loginFormContainer.value.style.transform = "translateY(0)"

            signFiller.value.style.top = "50%"
          }
        }

        setTimeout(() => {
          //@ts-ignore
          signUpMode.value.style.visibility = "visible"
        }, 750)

        setTimeout(() => {
          //@ts-ignore
          loginMode.value.style.visibility = "visible"
        }, 750)
      }
    })
  })


  function switchSignMode() {

    const width = window.innerWidth;
    if (signUpMode.value && loginMode.value && signFiller.value && loginFormContainer.value && registerFormContainer.value) {
      if (width > 800) {

        isLoginMode.value = !isLoginMode.value
        if (!isLoginMode.value) {
          signUpMode.value.style.transform = "translateX(0)"
          registerFormContainer.value.style.transform = "translateX(0)"

          loginMode.value.style.transform = "translateX(200%)"
          loginFormContainer.value.style.transform = "translateX(-200%)"

          signFiller.value.style.left = "20%"

        } else {
          signUpMode.value.style.transform = "translateX(-200%)"
          registerFormContainer.value.style.transform = "translateX(200%)"

          loginMode.value.style.transform = "translateX(0)"
          loginFormContainer.value.style.transform = "translateX(0)"

          signFiller.value.style.left = "50%"
        }
      } else {
        isLoginMode.value = !isLoginMode.value
        if (!isLoginMode.value) {
          signUpMode.value.style.transform = "translateY(0)"
          registerFormContainer.value.style.transform = "translateY(0)"

          loginMode.value.style.transform = "translateY(300%)"
          loginFormContainer.value.style.transform = "translateY(-200%)"

          signFiller.value.style.top = "15%"

        } else {
          signUpMode.value.style.transform = "translateY(-300%)"
          registerFormContainer.value.style.transform = "translateY(200%)"

          loginMode.value.style.transform = "translateY(0)"
          loginFormContainer.value.style.transform = "translateY(0)"

          signFiller.value.style.top = "50%"
        }
      }
    }
  }

  function registerForm() {
    const formData = new FormData();
    formData.append("email", registerEmail.value);
    formData.append("username", registerUsername.value);
    formData.append("password", registerPassword.value);
    formData.append("passwordConfirmed", registerConfirmPassword.value);

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

  onMounted(() => {
    if (router.currentRoute.value.path === '/register') {
      switchSignMode()
    }
  })
</script>

<template>
  <header>
    <div class="header-content" @click="() => router.push('/')">
      <img src="@/assets/image/logoPT(1).png" alt="PlayTrays Logo" class="logo">
      <h1>PlayTrays</h1>
    </div>
  </header>
  <main>
    <div class="row forms">
      <form @submit.prevent="loginForm" class="login-form" ref="loginFormContainer">
        <h2>Login</h2>
        <div class="inputs">
          <input type="email" v-model="loginEmail" id="email" name="email" required placeholder="Email">
          <input type="password" v-model="loginPassword" id="password" name="password" required placeholder="Password">
        </div>
        <button type="submit" class="login-button">Let's Play</button>
      </form>
      <form @submit.prevent="registerForm" class="register-form" ref="registerFormContainer">
        <h2>Register</h2>
        <div class="inputs">
          <input type="email" v-model="registerEmail" id="email" name="email" required placeholder="Email">
          <input type="text" v-model="registerUsername" id="username" name="username" required placeholder="Username">
          <input type="password" v-model="registerPassword" id="password" name="password" required placeholder="Password">
          <input type="password" v-model="registerConfirmPassword" id="confirmPassword" name="confirmPassword" required placeholder="Confirm Password">
        </div>
        <button type="submit" class="login-button">Enter in the App</button>
      </form>
    </div>
    <div class="sign-mode-filler" ref="signFiller">
      <div class="login-mode sign-mode-content" ref="loginMode">
        <h2>Welcome Back !</h2>
        <button @click="switchSignMode" class="switch-button">You are not register ?</button>
      </div>
      <div class="sign-up-mode sign-mode-content" ref="signUpMode">
        <h2>Join PlayTrays !</h2>
        <button @click="switchSignMode" class="switch-button">You got an account ?</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
header {
  position: relative;
  margin : 1% 5%;
  display : flex;
  justify-content: center;
  z-index: 1;
}

h1 {
  font-size : 5vw;
}

h2 {
  font-size: 3.5vw;
}

.logo {
  height: 5.5vw;
  margin: 0 0.5%;
  transition: transform 0.6s ease-in-out;
}

.header-content {
  cursor : pointer;
  display : flex;
  flex-direction : row;
  align-items: center;
  justify-content: center;
  width: max-content;
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
  position: absolute;
  top: 10vh;
  left: 0;
}

.forms {
  border-radius: 1.5vw;
  align-items: center;
  width: 60%;
  height: 30vw;
  box-shadow: 0 8px 20px rgba(0,0,0, 0.15);
  overflow: hidden;
}

.forms>form {
  width: 100%;
  margin: 2% 4%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 1s ease-in-out;
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
  height: 2vw;
  font-size: 1vw;
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
  top : unset;
  height: 30vw;
  border-radius: 1.5vw;
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
  justify-content: space-evenly;
  height: 30%;
  position: absolute;
  transition: transform 1s ease-in-out;
}

.sign-up-mode {
  transform: translateX(-200%);
}

.register-form {
  transform: translateX(200%);
}

@media screen and (max-width: 800px) {
  .logo {
    height: 8vw;
    margin: 3% 0.5%;
  }
  
  h1{
    font-size: 8vw;
  }

  main {
    flex-direction: column;
    height: 100vh;
    top:0;
  }

  .forms {
    display: flex;
    flex-direction: column;
    width: 70%;
    height: 70%;
  }

  .forms>form {
    width: 75%;
    height: 50%;
  }
  
  h2{
    font-size: max(2.5vh,5.5vw);
  }

  .inputs>input {
    height: max(1.7vh,3vw);
    font-size: max(1.3vh,2.5vw);
  }
  
  .sign-mode-filler {
    width: 70%;
    height: 35%;
    left: 15%;
    top: 50%;
    transition: top 1s ease-in-out;
  }

  .sign-up-mode {
    transform: translateY(-200%);
  }

  .register-form {
    transform: translateY(200%);
  }

  .sign-up-mode {
    transform: translateY(-250%);
  }

  button {
    font-size: 2.7vw;
    margin: 2% 0;
  }

}

</style>