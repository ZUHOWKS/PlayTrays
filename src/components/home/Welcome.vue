<script setup lang="ts">

</script>

<template>
  <section class="welcome-section">
    <img src="C:\Users\mathi\OneDrive\Documents\dev\PlayTrays\src\assets\image\logoPT(1).png" alt="PlayTrays Logo" class="logo">
    <div class="welcome-text">
      <h1>Welcome on</h1>
      <h1>PlayTrays</h1>
    </div>
  </section>
</template>

<style scoped>
.welcome-section {
    display: flex;
    align-items: center;
    justify-content: flex-start; 
    padding: 40px; 
    width: 100vw;
    height: 80vh;
}

.logo {
    width: 100%; 
    max-width: 500px; 
    height: auto;
    transition: transform 0.6s ease-in-out; 
}

.logo:hover {
    transform: rotate(360deg); 
}

.welcome-text h1 {
    font-size: 8vw; 
    color: #333;
    margin: 0;
    text-align: center;
    font-weight: bold;
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    height: auto; 
  }

  .logo {
    margin-bottom: 20px; 
    transition: transform 0.5s ease-in-out; /*ajuster animation pour mobile*/
  }

  .logo:hover {
    transform: rotate(360deg);
  }

  .welcome-text h1 {
    font-size: 12vw;
  }
}
</style>