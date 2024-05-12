<script setup lang="ts">
</script>


<template>
  <div class="about" id="about">
    <h1>ABOUT US</h1>
    <p>We are a group of 4 students from the Polytech Annecy-Chambéry school, attached to the University of Savoie Mont-Blanc. As part of our school career, we created this video game website. This project aims to make us learn a computer language while also taking care of the project management part. To create this website, we used javascript with come framework Vue.js.</p>
    <div class="logos">
      <img src="@/assets/image/logo-polytech-annecy-chambery-blanc.png" alt="Polytech Annecy-Chambéry Logo" class="image">
      <img src="@/assets/image/1200px-Logo_Université_Savoie_Mont_Blanc_2015.svg.png" alt="Université Savoie Mont Blanc Logo" class="image">
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutUs',
  props: ['description'] 
}
</script>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  background-color: #FFE66D;
  padding: 2.5rem;
  font-family: 'Segoe UI', Arial, sans-serif;
  color: #333;
  min-height: 400px;
}

.about h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: left; 
}

.about p {
  font-size: 1.5rem;
  line-height: 1.8;
  margin-bottom: 2rem; 
  text-align: justify; 
}

.logos {
  display: flex;
  justify-content:center; 
  width: 100%;
  align-items: center;
}

.image {
  width: 100%;
  max-width: 20%; /*taille max logo*/
  height: auto;
  margin-right: 200px;
}

.image:last-child {
  margin-right: 0;
}

/* Requêtes média pour petits écrans */
@media (max-width: 768px) {
  .about h1 {
    font-size: 2rem; /*taille de police plus petite pour petits écran*/
  }

  .about p {
    font-size: 1.2rem; 
    margin-bottom: 1rem; 
  }

  .image {
    max-width: 40%; /*augmente taille logos pour petits écrans*/
    margin-right: 20px; 
  }
}
</style>