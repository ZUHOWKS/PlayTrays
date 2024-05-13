<script setup lang="ts">

import {useRouter} from "vue-router";
import AccountServices from "@/services/account_services";

const props = defineProps(['menuInfo', 'showSocialWidget', 'leaveGroup']);
const router = useRouter();

</script>

<template>

  <div class="top-bar-content">
    <div class="left-content">
      <svg xmlns="http://www.w3.org/2000/svg" @click="() => {leaveGroup(); AccountServices.logout(router);}" class="disconnect-button" viewBox="0 0 512 512"><path d="M304 336v40a40 40 0 01-40 40H104a40 40 0 01-40-40V136a40 40 0 0140-40h152c22.09 0 48 17.91 48 40v40M368 336l80-80-80-80M176 256h256" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>
    </div>
    <div class="center-nav"></div>
    <div class="right-content">
      <svg @click="showSocialWidget" xmlns="http://www.w3.org/2000/svg" class="social-button" viewBox="0 0 512 512"><path d="M402 168c-2.93 40.67-33.1 72-66 72s-63.12-31.32-66-72c-3-42.31 26.37-72 66-72s69 30.46 66 72z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="40"/><path d="M336 304c-65.17 0-127.84 32.37-143.54 95.41-2.08 8.34 3.15 16.59 11.72 16.59h263.65c8.57 0 13.77-8.25 11.72-16.59C463.85 335.36 401.18 304 336 304z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="35"/><path d="M200 185.94c-2.34 32.48-26.72 58.06-53 58.06s-50.7-25.57-53-58.06C91.61 152.15 115.34 128 147 128s55.39 24.77 53 57.94z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M206 306c-18.05-8.27-37.93-11.45-59-11.45-52 0-102.1 25.85-114.65 76.2-1.65 6.66 2.53 13.25 9.37 13.25H154" fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32"/></svg>
      <div v-if="menuInfo.group != undefined" class="group-container">
        <div class="group-players">
          <div v-for="player in menuInfo.group.players" class="group-player">
            <p>{{ player.username?.charAt(0).toUpperCase() }}</p>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="button-leave" @click="() => leaveGroup()" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M320 320L192 192M192 320l128-128"/></svg>
      </div>
    </div>
  </div>


</template>

<style scoped>

  .top-bar-content {
    top: 1.5vh;
    height: 10vh;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    justify-items: center;
    position: absolute;
  }

  .center-nav {
    width: 65vw;
  }

  .right-content {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    padding: 0.5% 1.5%;
  }

  .right-content>.social-button {
    height: 6vh;
    width: 10vh;
    cursor: pointer;
  }

  .group-container {
    padding: 0.5% 0.45vh;
    margin: 5%;
    min-width: 0;
    height: 6vh;
    background-color: rgba(var(--secondary-color));
    display: flex;
    border-radius: 5vh;
    align-items: center;
    justify-content: space-between;
    transform-origin: 100% 50%;
    animation: groupContainerAppear .5s .05s both ease-in-out;
  }

  @keyframes groupContainerAppear {
    0% {
      min-width: 0;
    }
    100% {
      min-width: 29.5vh;
    }
  }

  .group-players {
    display: flex;
    align-items: center;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .group-players>.group-player {
    width: 5vh;
    height: 5vh;
    margin: 0 0.3vh;
    border-radius: 5vh;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 0px 10px rgba(0,0,0,0.075);
    background-color: rgb(var(--primary-color));
    cursor: pointer;
  }

  .group-players>.group-player:nth-child(n+5) {
    width: 0;
    height: 0;
    visibility: hidden;
  }

  .group-player>p {
    font-weight: 500;
    font-size: 2.5vh;
    color: rgb(var(--text-color));
  }

  .group-container>.button-leave {
    width: 7vh;
    height: 5.5vh;
    cursor: pointer;
    color: rgb(var(--link-color));
    transition: color .095s ease-in-out;
    z-index: 5;
  }

  .group-container>.button-leave:hover {
    color: rgb(var(--selector-color));
  }

  .left-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5% 1.5%;
  }

  .left-content>svg {
    width: 6vh;
    height: 6vh;
    cursor: pointer;
  }

</style>