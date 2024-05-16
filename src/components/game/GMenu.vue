<script setup lang="ts">
  const props=defineProps(['leaveParty'])
</script>

<template>
  <div class="game-menu">
    <button @click="leaveParty">Leave the party</button>
  </div>
</template>

<style scoped>
.game-menu {
  position: fixed;
  width: 22.5vw;
  height: 35vw;
  top: 15%;
  left: 39.75vw;
  z-index: 3;
  background: rgb(var(--background-color));
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.15);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>