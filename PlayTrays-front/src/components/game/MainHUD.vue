<script setup lang="ts">
import {onMounted, ref, type Ref} from "vue";

const endParty: Ref<HTMLElement | null> = ref(null)

onMounted(() => {
  endParty.value?.style.setProperty('visibility', 'hidden')
})

</script>

<template>
  <div class="starter-annonce annonce">
    <h2 class="starter-user" id="user1">_</h2>
    <h2 class="starter-user" id="user2">_</h2>
  </div>
  <div class="end-annonce annonce" ref="endParty">
    <h2 id="userCongregated">_</h2>
    <h2>Win!</h2>
  </div>
</template>

<style scoped>
h2 {
  text-transform: capitalize;
}

.annonce {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  opacity: 1;
  background: rgba(0,0,0, 0.25);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.starter-annonce {
  animation: starterAnim 5s ease-in-out both;
}

@keyframes starterAnim {
  0% {
    opacity: 0;
    visibility: visible;
  }

  10% {
    opacity: 1;
    visibility: visible;
  }

  75% {
    opacity: 1;
    visibility: visible;
  }

  99% {
    opacity: 0;
    visibility: visible;
  }
  100% {
    opacity: 0;
    visibility: hidden;
  }
}

.annonce>h2 {
  color: white;
  font-size: max(10vh, 7.5vw);
  position: relative;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
}

.annonce>h2:nth-child(2n+1) {
  animation: wishUserTextAnimation1 1s 1s both ease-in-out;
}

.annonce>h2:nth-child(2n) {
  animation: wishUserTextAnimation2 1s 1s both ease-in-out;
}

@keyframes wishUserTextAnimation1 {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-8vw);
  }
}

@keyframes wishUserTextAnimation2 {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(8vw);
  }
}

.annonce>h2::after {
  content: '';
  transform-origin: -2.5% 0;
  transform: scaleX(0);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.1em;
    z-index: -1;
  opacity: 0.95;
}

.annonce>h2:nth-child(2n+1)::after {
  background: rgb(var(--secondary-color));
  animation: wishUserAnimation 3.5s ease-in-out infinite;
}

.annonce>h2:nth-child(2n)::after {
  background: rgb(var(--primary-color));
  animation: wishUserAnimation2 3.5s ease-in-out infinite;
}

@keyframes wishUserAnimation {
  0% {
    transform: scaleX(0);
    transform-origin: -5% 0;
  }
  10% {
    transform: scaleX(1.25);
    transform-origin: -5% 0;
  }

  40% {
    transform: scaleX(1.1);
    transform-origin: 102.5% 0;
  }

  50% {
    transform: scaleX(0);
    transform-origin: 102.5% 0;
  }
  50.01% {
    transform: scaleX(0);
    transform-origin: -5% 0;
  }
  65% {
    transform: scaleX(1);
    transform-origin: -2.5% 0;
  }
  65.01% {
    transform: scaleX(1);
    transform-origin: 102.5% 0;
  }
  70% {
    transform: scaleX(0);
    transform-origin: 102.5% 0;
  }

  70.01% {
    transform: scaleX(0);
    transform-origin: -2.5% 0;
  }
  75% {
    transform: scaleX(1);
    transform-origin: -2.5% 0;
  }
  75.01% {
    transform: scaleX(1);
    transform-origin: 102.5% 0;
  }
  80% {
    transform: scaleX(0);
    transform-origin: 102.5% 0;
  }
}

@keyframes wishUserAnimation2 {
  0% {
    transform: scaleX(0);
    transform-origin: 102.5% 0;
  }
  10% {
    transform: scaleX(1.25);
    transform-origin: 102.5% 0;
  }

  40% {
    transform: scaleX(1.1);
    transform-origin: -5% 0;
  }

  50% {
    transform: scaleX(0);
    transform-origin: -2.5% 0;
  }
  50.01% {
    transform: scaleX(0);
    transform-origin: 102.5% 0;
  }
  65% {
    transform: scaleX(1);
    transform-origin: 102.5% 0;
  }
  65.01% {
    transform: scaleX(1);
    transform-origin: -2.5% 0;
  }
  70% {
    transform: scaleX(0);
    transform-origin: -2.5% 0;
  }

  70.01% {
    transform: scaleX(0);
    transform-origin: 102.5% 0;
  }
  75% {
    transform: scaleX(1);
    transform-origin: 102.5% 0;
  }
  75.01% {
    transform: scaleX(1);
    transform-origin: -2.5% 0;
  }
  80% {
    transform: scaleX(0);
    transform-origin: -2.5% 0;
  }
}

.end-annonce {
  visibility: hidden;
}

</style>