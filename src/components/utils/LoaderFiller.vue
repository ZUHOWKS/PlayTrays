<script setup lang="ts">
const props = defineProps(['showLoader']);
</script>

<template>
  <div :class="['loader-filler', !showLoader ? 'mask' : '']">
    <div class="container">
      <span class="dots"></span>
      <span class="dots"></span>
      <span class="dots"></span>
    </div>
  </div>

</template>

<style scoped>

  .loader-filler {
    position: fixed;
    opacity: 1;
    z-index: 5;
    animation: maskAnimation .5s both ease-in-out paused;
  }

  .mask {
    animation-play-state: running;
  }

  @keyframes maskAnimation {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      visibility: hidden;
    }
  }

  .container {

    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;

    background: linear-gradient(150deg, rgb(var(--primary-color)) 0%, rgb(var(--secondary-color)) 100%);
    background-size: 400% 400%;
    animation: backgroundAnimation 7.5s ease-in-out infinite;
  }

  @keyframes backgroundAnimation {
    0% {
      background-position: 5% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 5% 50%;
    }
  }

  .container>span {
    scale: 0.75;
    width: 5vh;
    height: 5vh;
    margin: 1vh;
    background: rgb(var(--selector-color));
    animation: dotsAnimation 2.5s linear infinite;
  }

  .container>span:nth-child(2) {
    animation-delay: 1.7s;
  }

  .container>span:nth-child(3) {
    animation-delay: 3s;
  }


  @keyframes dotsAnimation {
    0% {
      border-radius: 0;
      width: 5vh;
      height: 5vh;
    }
    10% {
      border-radius: 5vh;
      height: 5vh;
    }
    20% {
      border-radius: 5vh;
      height: 5vh;
    }
    30% {
      border-radius: 5vh;
      height: 10vh;
    }
    40% {
      border-radius: 5vh;
      height: 7.5vh;
    }
    50% {
      border-radius: 2.5vh;
      height: 7.5vh;
    }
    60% {
      border-radius: 2.5vh;
      height: 7.5vh;
    }
    70% {
      border-radius: 2.5vh;
      height: 5vh;
    }
    80% {
      border-radius: 2.5vh;
      height: 5vh;
      width: 5vh;
    }
    90% {
      border-radius: 2.5vh;
      height: 5vh;
      width: 7.5vh;
    }
    95% {
      border-radius: 2.5vh;
      height: 5vh;
      width: 7.5vh;
    }
    100% {
      border-radius: 0;
      width: 5vh;
      height: 5vh;
    }
  }

</style>