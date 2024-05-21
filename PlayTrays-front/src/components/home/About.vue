<script setup lang="ts">
</script>


<template>
  <div class="about" id="about">
    <h1>ABOUT US</h1>
    <p>We are a group of four students from Polytech Annecy-Chambéry, affiliated with the University of Savoie Mont-Blanc. As part of our academic program, we created this video game website. This project aims to help us improve in the different areas of computer science needed for this project and to enhance our management skills. To develop this website, we used TypeScript, HTML and CSS along with the Vue.js framework.</p>
    <div class="logos">
      <img src="@/assets/image/logo-polytech-annecy-chambery-blanc.png" alt="Polytech Annecy-Chambéry Logo" class="image">
      <img src="@/assets/image/1200px-Logo_Université_Savoie_Mont_Blanc_2015.svg.png" alt="Université Savoie Mont Blanc Logo" class="image">
    </div>
  </div>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  background-color: rgba(var(--secondary-color),0.80);
  padding: 2% 3%;
}

h1 {
  font-size: min(3.4vw, 3.4vh);
  margin: 2% 0;
  text-align: left; 
}

p {
  font-size: min(2vw, 2vh);
  line-height: 1.6;
  margin-bottom: min(3vw, 3vh); 
  text-align: justify; 
}

.logos {
  display: flex;
  flex-wrap: wrap;
  justify-content:center; 
  width: 100%;
  align-items: center;
}

.image {
  width: 20%;
  height: auto;
  margin: 2% 6%;
}

@media screen and (max-width :800px) {

  h1 {
    font-size: min(4.5vw, 4.5vh);
    margin: 3% 2%;
  }

  p {
    font-size: min(4vw, 4vh);
    line-height: 1.4;
    margin: 2%;
  }

  .image {
    width: 30%;
  }
}

</style>