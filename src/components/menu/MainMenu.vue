<script setup lang="ts">
import {onMounted, ref, type Ref} from "vue";
import checkersBanner from '@/assets/image/checkers_game_view.png';

const props = defineProps(['menuInfo', 'startMatchmaking']);
const modeChoose: Ref<string> = ref('Choose')
const selectedModeBanner: Ref<HTMLImageElement | null> = ref(null)

const showModeSelection: Ref<boolean> = ref(false)

function setBannerMode(path_src: any) {
  if (selectedModeBanner.value) {
    selectedModeBanner.value.src = path_src;
    selectedModeBanner.value.style.visibility = 'visible'
  }
}

onMounted(() => {
  if (selectedModeBanner.value) {
    selectedModeBanner.value.src = '';
    selectedModeBanner.value.style.visibility = 'hidden'
  }

})

</script>

<template>
  <slot></slot>
  <!--
      Conteneur pour la page principale du menu:
      Fonctionnalité principale => Sélection du Mode de jeu et
      lancement du matchmaking
   -->

  <div v-if="showModeSelection" class="column game-modes">
    <h2>Mode Selection</h2>
    <svg @click="() => {showModeSelection = !showModeSelection}" xmlns="http://www.w3.org/2000/svg" class="close-button b" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144M368 144L144 368"/></svg>
    <div class="row">
      <div class="mode-card" @click="() => {modeChoose = 'Checkers'; showModeSelection = false; setBannerMode(checkersBanner);}">
        <h3>Checkers</h3>
        <img src="@/assets/image/checkers_game_view.png" alt="PlayTrays Checkers Game">
      </div>
    </div>
  </div>

  <div class="play-container column">
    <div class="mode-select" @click="() => {showModeSelection = !showModeSelection; }">
      <h2 class="title-selected">{{modeChoose.length > 10 ? modeChoose.substring(0, 7) + "..." : modeChoose}}</h2>
      <img src="" alt="PlayTrays mode selected banner" ref="selectedModeBanner">
    </div>
    <button class="play-button" @click="props.startMatchmaking(modeChoose.toLowerCase())" :disabled="modeChoose.toLowerCase() ==='choose' || !props.menuInfo.matchmaking.canStart">
      Play : {{modeChoose.length > 10 ? modeChoose.substring(0, 7) + "..." : modeChoose}}
    </button>
  </div>



</template>

<style scoped>
  .game-modes {
    position: fixed;
    top: 12vh;
    width: 75vw;
    left: 12.5vw;
    height: 80vh;
    background-color: white;
    align-items: center;
    border-radius: 15px;
    z-index: 2;
    transform: scaleY(0);
    animation: showGameModeSelection .125s ease-in-out both;
  }

  @keyframes showGameModeSelection {
    0% {
      transform: scaleY(0);
    }
    100% {
      transform: scaleY(1);
    }
  }

  .game-modes>.close-button {
    position: fixed;
    height: 5vw;
    min-height: 50px;
    width: 5vw;
    min-width: 50px;
    margin: 0.75%;
    align-self: end;
    cursor: pointer;
    z-index: 2;
    color: black;
  }

  .game-modes>h2 {
    margin: 3vh 1.5vh;
    font-size: max(37px, 5vw);
  }

  .game-modes>.row {
    width: 70vw;
    height: 80%;
    padding: 0 2.5vw;
    overflow-y: scroll;
    align-items: center;
    justify-content: center;
  }

  .mode-card {
    height: 42.5vh;
    width: 30vh;
    margin: 0 2.5%;
    background: linear-gradient(0deg, rgba(var(--background-color), 0.75) 5%, rgba(var(--background-color),0) 40%);
    border: solid 2px rgb(var(--primary-color));
    border-radius: 10px;
    transition: border-color .15s, transform .15s;
    cursor: pointer;
    text-align: center;

    overflow: hidden;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
  }

  .mode-card:hover {
    background: linear-gradient(0deg, rgba(var(--background-color), 0.75) 5%, rgba(var(--background-color),0) 40%) !important;
    border-color: rgb(var(--secondary-color));
    transform: scale(1.025);
  }

  .mode-card>h3 {
    position: absolute;
    font-size: max(34px, 2.5vw);
  }

  .mode-card>img {
    height: 100%;
    z-index: -1;
  }

  .play-container {
    position: fixed;
    right: 2.5%;
    bottom: 2.5vh;
    width: 25vw;
    min-width: 225px;
    overflow: hidden;
  }

  .play-container>.mode-select {
    cursor: pointer;
    height: 15vw;
    width: 100%;
    min-height: 125px;
    background: linear-gradient(0deg, rgba(var(--background-color), 0.75) 5%, rgba(var(--background-color),0) 40%);
    margin: 5% 0;
    border-radius: 15px;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
  }

  .mode-select>.title-selected {
    font-size: 3vw;
  }

  .mode-select>img {
    z-index: -1;
    position: absolute;
    width: 100%;
    border-radius: 15px;
  }

  .play-button {

    font-size: 2.5vw;
    font-weight: 600;
  }

  .play-button:disabled {
    background-color: #b7b7b7;
    border-color: darkgrey;
  }

</style>