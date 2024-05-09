<script setup lang="ts">
import {ref, type Ref} from "vue";

const props = defineProps(['menuInfo', 'startMatchmaking']);
const modeChoose: Ref<string> = ref('Choose')

</script>

<template>
  <!--
      Conteneur pour la page principale du menu:
      Fonctionnalité principale => Sélection du Mode de jeu et
      lancement du matchmaking
   -->

  <div class="column game-modes">
    <div class="row">
      <div class="mode-card" @click="() => {modeChoose = 'Checkers'}">
        <h3>Checkers</h3>
      </div>
    </div>
  </div>

  <button class="play-button" @click="props.startMatchmaking(modeChoose.toLowerCase())" :disabled="modeChoose.toLowerCase() ==='choose' || !props.menuInfo.matchmaking.canStart">
    Play : {{modeChoose.length > 10 ? modeChoose.substring(0, 7) + "..." : modeChoose}}
  </button>

</template>

<style scoped>
  .game-modes {
    position: absolute;
    top: 14vh;
    width: 100vw;
    align-items: center;
  }

  .mode-card {
    height: 40vh;
    width: 15vw;
    background: white;
    border: solid 2px rgb(var(--primary-color));
    border-radius: 10px;
    transition: all .15s;
    cursor: pointer;
    text-align: center;
  }

  .mode-card:hover {
    border-color: rgb(var(--secondary-color));
    scale: 1.025;
  }

  .mode-card>h3 {
    font-size: 43px;
  }

  .play-button {
    position: fixed;
    right: 2.5%;
    bottom: 5%;
    width: 28.5%;
    font-size: 50px;
    font-weight: 600;
  }

  .play-button:disabled {
    background-color: #b7b7b7;
    border-color: darkgrey;
  }
</style>