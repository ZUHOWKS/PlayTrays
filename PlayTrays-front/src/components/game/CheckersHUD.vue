<script setup lang="ts">

</script>

<template>
  <div class="timer">
    <p>00:00</p>
  </div>
</template>

<style scoped>
  .timer {
    width: max(75px, 8.5vw);
    height: max(20px, 2.25vw);
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
    font-size: max(1.5vh, 1.5vw);
    margin-bottom: 2.75%;
    color: rgba(var(--background-color));
  }

  @media screen and (max-width: 850px) {
    .timer {
      left: calc(50% - 35px);
    }
  }
</style>