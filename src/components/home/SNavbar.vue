<script setup>
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
        <!-- TODO: Mettre le logo -->
        <h3>PlayTrays</h3>
      </div>

      <!-- hypertextes -->
      <a>About</a>
      <a>Games</a>
      <a>Contact</a>

    </div>

    <!-- Deuxième ranger contenant les boutons pour entrer dans l'application -->
    <div class="row">

      <!-- bouton pour aller au menu -->
      <button class="play-button">
        Play on a Tray!
      </button>

      <!-- bouton pour se connecter ou s'enregistrer -->
      <button class="sign-up-button">
        Sign up
      </button>
    </div>
  </nav>
</template>

<style scoped>
  .s-navbar {
    width: 100%;
    height: 200px;
    align-items: center;
    justify-content: space-between;
  }



  /* style de la première rangé du logo et des hypertextes */
  .s-navbar>div:nth-child(1) {
    margin-left: 6%;
    width: 47.5%;
    align-items: center;
    justify-items: center;
    justify-content: space-between;
  }

  /* style des hypertextes */
  .s-navbar>div:nth-child(1)>a {
    font-size: 32px;
    font-weight: 300;
    color:rgb(var(--link-color));
  }

  /* style du logo */
  #logo {
    padding-bottom: 1%;
  }

  /* style de la police du logo */
  #logo>h3 {
    font-size: 48px;
    font-weight: 800;
  }

  /* style de la seconde rangé  */
  .s-navbar>div:nth-child(2) {
    width: 30%;
    margin-right: 6%;
    align-items: center;
    justify-items: center;
    justify-content: space-evenly;
  }

  /* style du bouton pour entrer dans le menu */
  .play-button {
    width: 300px;
    height: 60px;
    border-color: rgb(var(--primary-color));
  }


  /* style du bouton pour se connecter ou s'enregistrer */
  .sign-up-button {
    width: 200px;
    height: 60px;
    border-color: rgb(var(--text-color));
    background-color: transparent;
  }
</style>