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
    padding: 2.5% 2.5% 15% 2.5%;
    width: 100vw;
    height: 50vh;
}

.container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.logo {
    width: 100%; 
    max-width: 500px; 
    height: auto;
    transition: transform 0.6s ease-in-out; 
}

.container:hover>.logo {
    transform: rotate(360deg); 
}

.welcome-text h1 {
    color: rgb(var(--text-color));
    text-align: left;
    font-weight: bold;
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
  background: rgb(var(--secondary-color));
  z-index: -1;
  opacity: 0.95;
  animation: nameAfter .5s .5s both ease-in-out;
}

@keyframes nameAfter {
  0% {
    transform: scaleX(0) rotate(0deg);
  }

  100% {
    transform: scaleX(0.8) rotate(-0.25deg);
  }
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
  }

  .logo {
    margin-bottom: 20px; 
    transition: transform 0.5s ease-in-out; /*ajuster animation pour mobile*/
  }

  .welcome-text h1 {
    font-size: 12vw;
  }
}
</style>