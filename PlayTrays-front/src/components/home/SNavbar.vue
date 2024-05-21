<script setup lang="ts">
  import {useRouter} from "vue-router";

  const router = useRouter();
</script>

<template>
  <!--
      Barre de navigation pour la landing page.
   -->
  <nav class="row s-navbar">

    <!-- Première ranger contenant le logo & les hypertextes -->
    <div class="row">

      <!-- div pour le logo -->
      <div class="row" id="logo">
        <img src="@/assets/image/logoPT(1).png" alt="PlayTrays Logo" class="logo">
        <h3>PlayTrays</h3>
      </div>

      <!-- hypertextes -->
      <a href="#games">Games</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </div>

    <!-- Deuxième ranger contenant les boutons pour entrer dans l'application -->
    <div class="row">

      <!-- bouton pour aller au menu -->
      <button class="play-button buttons" @click="() => router.push('/login')">
        Play on a Tray!
      </button>

      <!-- bouton pour se connecter ou s'enregistrer -->
      <button class="sign-up-button buttons" @click="() => router.push('/register')">
        Sign up
      </button>
    </div>
  </nav>
</template>

<style scoped>
  .s-navbar {
    width: 100%;
    height: 15vh;
    align-items: center;
    justify-content: space-between;
  }

  /* style de la première rangé du logo et des hypertextes */
  .s-navbar>div:nth-child(1) {
    margin-left: 4%;
    width: 47.5%;
    align-items: center;
    justify-items: center;
    justify-content: space-between;
  }

  /* style des hypertextes */
  .s-navbar>div:nth-child(1)>a {
    font-size: 1.6vw;
    font-weight: 300;
    position: relative;
  }

  .s-navbar>div:nth-child(1)>a::after {
    content: '';
    transform-origin: -2.5% 0;
    transform: scaleX(0);
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: .4em;
    background: rgb(var(--primary-color));
    z-index: -1;
    opacity: 0.8;
    transition: transform .2s ease-in;
  }

  .s-navbar>div:nth-child(1)>a:hover::after {
    transform: scaleX(1.05);
  }

    /* style du logo */
  #logo {
    padding-bottom: 1%;
    cursor: pointer;
  }

    /* style de l'icone du logo */
  .logo {
    height: 3.5vw;
    transition: transform 0.6s ease-in-out;
    align-self: center;
    padding-right: 2%;
  }

  /* style de la police du logo */
  #logo>h3 {
    font-size: 2.5vw;
    font-weight: 800;
  }

  /* mouvement de l'icone du logo lorsque le curseur est sur le logo */
  #logo:hover>.logo {
    transform: rotate(360deg);
  }

  /* style de la seconde rangé  */
  .s-navbar>div:nth-child(2) {
    width: 30%;
    margin-right: 4%;
    align-items: center;
    justify-items: center;
    justify-content: space-evenly;
  }

  /* style du bouton pour entrer dans le menu */
  .play-button {
    width: 15vw;
    height: 5vh;
    border-color: rgb(var(--primary-color));
  }


  /* style du bouton pour se connecter ou s'enregistrer */
  .sign-up-button {
    width: 10vw;
    height: 5vh;
    border-color: rgb(var(--text-color));
    background-color: transparent;
  }

  .sign-up-button:hover {
    border-color: rgb(var(--primary-color));
  }

  @media screen and (max-width: 800px) {
    
    a {
      position: absolute;
      visibility: hidden;
    }

    .s-navbar {
      margin: none;
      height: 10vh;
    }

    .logo {
      height: 7.5vw;
    }

    #logo>h3 {
      font-size: 6vw;
      font-weight: 800;
    }

    .s-navbar>div:nth-child(2) {
      width: 50%;
    }

    .buttons{
      width : 50%;
      margin: 0 2%;
      font-size: min(2.7vw, 1.9vh);
    }

  }

</style>