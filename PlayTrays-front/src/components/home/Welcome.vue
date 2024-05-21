<script setup lang="ts">

</script>

<template>
  <section class="welcome-section">
    <div class="container">
      <img src="@/assets/image/logoPT(1).png" alt="PlayTrays Logo" class="logo">
      <div class="welcome-text">
        <h1>Welcome on</h1>
        <h1 id="name">PlayTrays</h1>
      </div>
    </div>
  </section>
</template>

<style scoped>
.welcome-section {
  display : flex;
  padding: 10% 2.5% 13% 2.5%;
  width: 95vw;
  height: 38.7vh;
}

.container {
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.logo {
  width: 30vw;
  height: auto;
  transition: transform 0.6s ease-in-out;
}

.container:hover>.logo {
  transform: rotate(360deg); 
}

h1 {
  color: rgb(var(--text-color));
  text-align: left;
  font-weight: bold;
  font-size: 9vw;
}

.welcome-text>#name {
  color: rgb(var(--primary-color));
  margin-left: 1%;
  position: relative;
}

.welcome-text>#name::after {
  content: '';
  transform-origin: -2.5% 0;
  transform: scaleX(0) rotate(0deg);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.1em;
  background: rgba(var(--secondary-color), 0.95);
  z-index: -1;
  animation: nameAfter .5s .5s both ease-in-out;
}

@keyframes nameAfter {
  0% {
    transform: scaleX(0) rotate(0deg);
  }

  100% {
    transform: scaleX(0.8) rotate(-2deg);
  }
}

@media (max-width: 800px) {
  .welcome-section {
    height: 30vh;
  }

  h1 {
    font-size: min(10vw, 10vh);
  }

  .logo {
    width: min(33vw, 33vh);
  }

}
</style>