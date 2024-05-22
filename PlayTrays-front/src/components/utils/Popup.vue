<script setup lang="ts">

const props = defineProps(['popup'])

function closePopup() {
  props.popup.isVisible = !props.popup.isVisible;
}

</script>

<template>
  <div v-if="props.popup.isVisible" class="filler">
    <div class="container">
      <div class="bloc-message">
        <h2>{{ props.popup.title }}</h2>
        <span>{{ props.popup.textContent }}</span>
      </div>
      <button class="close" @click="closePopup">
        Close
      </button>
    </div>
  </div>



</template>

<style scoped>
.filler {
  background: rgba(0, 0, 0, 0.25);
  position: fixed;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
}

.container {
  height: 40%;
  width: 42.5%;
  padding: 2.5% 2.5%;
  background: white;
  border: 5px solid rgb(var(--secondary-color));
  border-radius: 5px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  justify-items: center;
}

.container::after {
  content: '';
  transform-origin: -2.5% 0;
  transform: scaleX(0);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2em;
  background: rgb(var(--primary-color));
  z-index: 4;
  opacity: 0.8;
  animation: underlineAnimation .75s 0.15s  ease-in both running;
}

@keyframes underlineAnimation {
  0% {
    transform: scaleX(0);
  }
  100%{
    transform: scaleX(1.05);
  }
}

.bloc-message {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  justify-items: center;
  height: 70%;
  max-height: 90%;
}

.bloc-message>h2 {
  font-size: max(2.75vh, 3vw);
  margin: 2.5% 1% 0 1%;
  position: relative;
}

.bloc-message>h2::after {
  content: '';
  transform-origin: center;
  transform: scaleX(0);
  position: absolute;
  bottom: -.35em;
  left: 0;
  right: 0;
  height: .2em;
  background: rgb(var(--secondary-color));
  z-index: 3;
  opacity: 0.8;
  animation: underlineDynamicAnimation 2s 0.15s ease-in-out infinite running;
}

@keyframes underlineDynamicAnimation {
  0% {
    transform: scaleX(0.01);
  }
  17.5%{
    transform: scaleX(1.05);
  }
  25%{
    transform: scaleX(0);
  }
  32.5% {
    transform: scaleX(1.05);
  }
  100% {
    transform: scaleX(0.01);
  }
}

.bloc-message>span {
  font-size: 40px;
  font-weight: 500;
  justify-self: start;
}

.container>button {
  margin-top: 5%;
  font-size: 42px;
  font-weight: 500;
  width: 22.5%;
  justify-self: end;
}
</style>