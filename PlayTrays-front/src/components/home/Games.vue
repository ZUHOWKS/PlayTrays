<script setup lang="ts">
  import {useRouter} from "vue-router";

  const router = useRouter();
</script>


<template>
  <section class="games-section" id="games">
    <h2 class="game-title">GAMES</h2>
    <div class="container">
      <div class="game-images">
        <div class="flip-card">
          <div class="flip-card-inner" @click="() => router.push('/login')">
            <div class="flip-card-front">
              <img src="@/assets/image/jeu1recto.png" alt="Front Image 1" style="width:100%;height:100%;">
            </div>
            <div class="flip-card-back">
              <img src="@/assets/image/jeu1verso.png" alt="Back Image 1" style="width:100%;height:100%;">
            </div>
          </div>
        </div>
        <div class="flip-card">
          <div class="flip-card-inner" @click="() => router.push('/login')">
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
  </section>
</template>

<style scoped>
.games-section {
  overflow: hidden;
  background-color: rgb(var(--primary-color));
  padding: 2% 5%;
  height: max-content;
}

.game-title {
  align-self: flex-end;
  font-size: min(5vw, 5vh);
  margin: 3% 0;
  text-align: right;
}

.container {
  display: flex;
  justify-content: center;
  margin-bottom: 7%;
}

.flip-card {
  width: min(25vw, 25vh);
  height: min(36vw, 36vh);
  perspective: default;
  margin: 3%;
  cursor: pointer;
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

.game-images{
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 70%;
  height: 70%;
  background-color: white;
  border-radius: 1.5vw;
  box-shadow: 0 8px 20px rgba(0,0,0, 0.40);
}

@media screen and (max-width: 800px) {

  .game-title{
    font-size: min(6vw, 6vh);
  }
  
  .flip-card {
    width: min(42vw, 25vh);
    height: min(58vw, 58vh);
  }

  .game-images{
    flex-direction: column;
    height:65vh;
    width:54vw;
    margin: 2% 0;
  }

}

</style>




