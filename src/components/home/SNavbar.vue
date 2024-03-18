<script setup>
</script>

<template>
  <nav class="row s-navbar">
    <div class="row">
      <div class="row" id="logo">
        <h3>PlayTrays</h3>
      </div>
      <a>About</a>
      <a>Games</a>
      <a>Contact</a>
    </div>
  </nav>
</template>

<style scoped>
  .s-navbar {
    width: 100%;
    height: 200px;
    align-items: center;
  }

  /* style de la rangé du logo et des hypertextes */
  .s-navbar>div:nth-child(1) {
    margin-left: 5%;
    width: 47.5%;
    align-items: center;
    justify-items: center;
    justify-content: space-between;
  }

  /* style des hypertextes de la SNavbar */
  .s-navbar a {
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
</style>