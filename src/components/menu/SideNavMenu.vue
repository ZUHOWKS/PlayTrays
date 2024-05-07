<script setup lang="ts">
const props = defineProps(['menuInfo', 'sideNavAccessAction']);

</script>

<template>
  <div class="container">
    <div class="title">
      <h2>Menu</h2>
      <svg @click="sideNavAccessAction" xmlns="http://www.w3.org/2000/svg" class="side-nav-button" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M328 112L184 256l144 144"/></svg>
    </div>
    <div class="nav-content">
      <a>Statistiques</a>
      <a>Compte</a>
    </div>
  </div>


</template>

<style scoped>
.container {
  padding: 0 5%;
}

.title {
  font-size: 60px;
  height: 12.5vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
}

.side-nav-button {
  top: 3vh;
  left: 70%;
  height: 7.5vh;
  width: 7.5vh;
  position: absolute;
  cursor: pointer;
  color: white;
}

.nav-content {
  display: flex;
  flex-direction: column;
  padding: 0 1%;
}

.nav-content>a {
  font-size: 32px;
  color: rgba(var(--background-color), 0.8);
  transition: transform .125s;
  transform-origin: left;
}

.nav-content>a:hover {
  color: rgba(var(--background-color), 1);
  transform: translateX(1%);

}
</style>