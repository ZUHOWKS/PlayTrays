<script setup lang="ts">

</script>


<template>
  <div class="games" id="games">
    <h2 class="game-title">GAMES</h2>
    <div class="game-images">
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <img src="@/assets/image/jeu1recto.png" alt="Front Image 1" style="width:100%;height:100%;">
          </div>
          <div class="flip-card-back">
            <img src="@/assets/image/jeu1verso.png" alt="Back Image 1" style="width:100%;height:100%;">
          </div>
        </div>
      </div>
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <img src="@/assets/image/Jeu2recto.png" alt="Front Image 2" style="width:100%;height:100%;">
          </div>
          <div class="flip-card-back">
            <img src="@/assets/image/Jeu2verso.png" alt="Back Image 2" style="width:100%;height:100%;">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 20px;
  margin-top: 10px;
}

.game-title {
  align-self: flex-end; 
  font-size: 2.6rem;
  font-family: 'Arial', sans-serif;
  color: #333;
  margin: 50px 70px 10px 0; 
  text-align: right; 
}

.game-images {
  display: flex;
  justify-content: center; 
  gap: 150px; /*espace entre cartes*/
  width: 100%;
  padding: 20px;
  margin-bottom: 40px;
}

.flip-card {
  background-color: transparent;
  width: 250px; 
  height: 350px;
  perspective: 1500px;
  margin: 10px; 
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}
</style>




