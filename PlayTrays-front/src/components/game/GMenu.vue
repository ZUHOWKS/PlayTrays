<script setup lang="ts">
  const props=defineProps(['leaveParty', 'showGMenuOnPress'])
</script>

<template>
  <div class="game-menu-container">
    <div class="game-menu">
      <h2>Menu</h2>
      <button @click="leaveParty" id="leave-party">Leave the party</button>
      <button @click="showGMenuOnPress(null)">Close</button>
    </div>
  </div>

</template>

<style scoped>

.game-menu-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: rgba(0,0,0, 0.5);

  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  opacity: 0;
  animation: showAnimation .105s both ease-in-out;
}

@keyframes showAnimation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.game-menu {
  width: max(30vh, 30vw);
  padding: 5% 3vw;
  z-index: 3;
  background: rgb(var(--background-color));
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.35);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  margin-bottom: 5%;
  border-radius: 15px;

  transform: scaleY(0);
  animation: scaleUpAnim .155s both ease-in-out;
}

@keyframes scaleUpAnim {
  0% {
    transform: scaleY(0);
  }
  100% {
    transform: scaleY(1);
  }
}

.game-menu>h2 {
  font-size: max(7vh, 7vw);
  margin-bottom: 5%;
}

.game-menu>button {
  width: 100%;
  margin: 2.5% 0;
  font-size: max(2vh, 2vw);
}

button#leave-party {
  background-color: #ff1414;
  border-color: #ff1414;
  color: white;
}

button#leave-party:hover {
  background-color: rgb(var(--background-color));
  border-color: #c80000;
  color: #c80000;
}


</style>