<script setup lang="ts">
const props = defineProps(['notification'])
</script>

<template>

  <div v-if="props.notification.showNotification" class="container">
    <span class="loader"></span>
    <p>{{ props.notification.message }}</p>
    <div class="actions">
      <svg v-if="props.notification.action != null" @click="props.notification.action()" xmlns="http://www.w3.org/2000/svg" class="action-icon" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M352 176L217.6 336 160 272"/></svg>
      <svg @click="() => props.notification.showNotification = false" xmlns="http://www.w3.org/2000/svg" class="close-icon" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M320 320L192 192M192 320l128-128"/></svg>
    </div>
  </div>
</template>

<style scoped>
  .container {
    position: fixed;
    min-height: 7.5vh;
    padding: 0.75% 1.25%;

    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;

    background: rgb(var(--secondary-color));
    border: solid 4px rgb(var(--background-color));
    border-radius: 5px;
    box-shadow: 0 0 8px rgba(0,0,0, 0.2);

    z-index: 4;

    left: 3%;
    bottom: 2%;
  }

  .container>p {
    position: relative;
    font-size: 25px;
    width: 110%;
  }

  .loader {
    position: absolute;
    transform-origin: left;
    height: .5em;
    bottom: 0;
    background: rgba(var(--primary-color), 0.95);
    width: 100%;
    animation: underlineAnimation 6s 0.15s ease-in-out both running;
  }

  @keyframes underlineAnimation {
    0% {
      transform: scaleX(0);
    }
    100%{
      transform: scaleX(1);
    }
  }


  .actions {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }

  .action-icon {
    height: 1.5vw;
    color: #009600;
    cursor: pointer;
    margin: 0 0.1% 0 0.5%;
  }

  .close-icon {
    height: 1.5vw;
    color: #c80000;
    cursor: pointer;
    margin: 0 0.1%;
  }
</style>