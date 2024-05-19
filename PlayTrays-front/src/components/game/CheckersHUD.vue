<script setup lang="ts">

</script>

<template>
  <div class="timer">
    <p>01:30</p>
  </div>
</template>

<style scoped>
  .timer {
    width: 8.5vw;
    height: 2.25vw;
    position: fixed;
    top: 0;
    left: 45.75vw;
    background: rgba(var(--text-color), 0.65);

    display: flex;
    align-items: center;
    justify-content: center;

    border-bottom-left-radius: 25% 65%;
    border-bottom-right-radius: 25% 65%;
  }

  .timer>p {
    font-size: 1.5vw;
    margin-bottom: 2.75%;
    color: rgba(var(--background-color));
  }
</style>