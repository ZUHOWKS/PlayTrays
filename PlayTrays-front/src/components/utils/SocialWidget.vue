<script setup lang="ts">


import {reactive, ref, type Ref} from "vue";
import AccountServices from "@/services/account_services";
import type {FriendInterface} from "@/modules/utils/UserInterface";

const props = defineProps(['menuInfo', 'showSocialWidget', 'inviteInGroup', 'getFriendList', 'showNotification'])
const email = ref('');

const fInvitations = reactive({
  own: ([] as FriendInterface[]),
  ask: ([] as FriendInterface[])
})

const section: Ref<string> = ref('list');

function searchFriend() {
  AccountServices.inviteFriend(email.value).then(() => {
    getAllFriendInvitations().then(() => {
      props.showNotification('Invite send to ' + fInvitations.own[fInvitations.own.length - 1].username + '!', null, true)
    })
  });
}

async function getAllFriendInvitations(): Promise<void> {
  AccountServices.getOwnFriendInvitations().then((response) => {
    console.log(response)
    fInvitations.own = response.data
  })

  return AccountServices.getFriendInvitations().then((response) => {
    console.log(response)
    fInvitations.ask = response.data
  })
}

</script>

<template>
  <div class="container">
    <div class="column">
      <div class="title">
        <h2>Social</h2>
        <svg @click="showSocialWidget" xmlns="http://www.w3.org/2000/svg" class="close-button b" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144M368 144L144 368"/></svg>
      </div>
      <nav class="row social-nav-bar">
        <svg @click="() => section='list'" xmlns="http://www.w3.org/2000/svg" :class="[section == 'list' ? 'nav-icon-selected' : '' ,'nav-icon']" viewBox="0 0 512 512"><path d="M340.75 344.49c5.91-20.7 9.82-44.75 11.31-67.84a4.41 4.41 0 00-4.46-4.65h-71.06a4.43 4.43 0 00-4.47 4.39v55.3a4.44 4.44 0 004.14 4.38 273.51 273.51 0 0159 11.39 4.45 4.45 0 005.54-2.97zM323.58 377.31a260.05 260.05 0 00-46.6-9.09 4.42 4.42 0 00-4.91 4.29v65.24a4.47 4.47 0 006.76 3.7c15.9-9.27 29-24.84 40.84-45.43 1.94-3.36 4.89-9.15 6.67-12.69a4.29 4.29 0 00-2.76-6.02zM235.29 368.4a256.85 256.85 0 00-46.56 8.82c-2.64.76-3.75 4.4-2.55 6.79 1.79 3.56 4 8.11 5.89 11.51 13 23 26.84 37.5 41.24 45.93a4.47 4.47 0 006.76-3.7v-65.27a4.16 4.16 0 00-4.78-4.08zM235.6 272h-71.06a4.41 4.41 0 00-4.46 4.64c1.48 23.06 5.37 47.16 11.26 67.84a4.46 4.46 0 005.59 3 272.2 272.2 0 0159-11.36 4.44 4.44 0 004.15-4.38V276.4a4.43 4.43 0 00-4.48-4.4zM277 143.78a235.8 235.8 0 0046.5-9.14 4.3 4.3 0 002.76-6c-1.79-3.57-4.27-8.68-6.17-12.09-12.29-22-26.14-37.35-41.24-46a4.48 4.48 0 00-6.76 3.7v65.23a4.43 4.43 0 004.91 4.3zM276.54 240h71.06a4.39 4.39 0 004.46-4.58c-1.48-22.77-5.27-47.8-11.16-68.22a4.46 4.46 0 00-5.59-2.95c-19 5.74-38.79 10.43-59.09 12a4.4 4.4 0 00-4.15 4.32v55.11a4.4 4.4 0 004.47 4.32zM233.31 70.56c-15.42 8.57-29.17 24.43-41.47 46.37-1.91 3.41-4.19 8.11-6 11.67a4.31 4.31 0 002.76 6 225.42 225.42 0 0046.54 9.17 4.43 4.43 0 004.91-4.29V74.26a4.49 4.49 0 00-6.74-3.7zM235.92 176.26c-20.3-1.55-40.11-6.24-59.09-12a4.46 4.46 0 00-5.59 2.95c-5.89 20.42-9.68 45.45-11.16 68.22a4.39 4.39 0 004.46 4.58h71.06a4.4 4.4 0 004.47-4.34v-55.09a4.4 4.4 0 00-4.15-4.32z"/><path d="M414.39 97.61A224 224 0 1097.61 414.39 224 224 0 10414.39 97.61zM176.6 430.85a219.08 219.08 0 01-12.48-19.66c-2-3.69-4.84-9.26-6.73-13.13a7.29 7.29 0 00-10.31-3.16c-4.3 2.41-10 5.72-14.13 8.43a147.29 147.29 0 01-23.57-22.43 248.83 248.83 0 0130.41-18.36c1.86-1 2.77-2.14 2.18-4.18a374.8 374.8 0 01-14.09-82.17 4.36 4.36 0 00-4.3-4.17H66.84a2 2 0 01-2-1.7A98.28 98.28 0 0164 256a96.27 96.27 0 01.86-14.29 2 2 0 012-1.7h56.74c2.29 0 4.17-1.32 4.29-3.63a372.71 372.71 0 0114-81.83 4.36 4.36 0 00-2.19-5.11 260.63 260.63 0 01-29.84-17.9 169.82 169.82 0 0123.14-22.8c4.08 2.68 9.4 5.71 13.66 8.11a7.89 7.89 0 0011-3.42c1.88-3.87 4-8.18 6.06-11.88a221.93 221.93 0 0112.54-19.91A185 185 0 01256 64c28.94 0 55.9 7 80.53 18.46a202.23 202.23 0 0112 19c2.59 4.66 5.34 10.37 7.66 15.32a4.29 4.29 0 005.92 1.94c5.38-2.91 11.21-6.26 16.34-9.63a171.36 171.36 0 0123.2 23 244.89 244.89 0 01-29.06 17.31 4.35 4.35 0 00-2.18 5.12 348.68 348.68 0 0113.85 81.4 4.33 4.33 0 004.3 4.12l56.62-.07a2 2 0 012 1.7 117.46 117.46 0 010 28.62 2 2 0 01-2 1.72h-56.67a4.35 4.35 0 00-4.3 4.17 367.4 367.4 0 01-13.87 81.3 4.45 4.45 0 002.19 5.19c5 2.59 10.57 5.48 15.37 8.42s9.55 6.08 14.13 9.34a172.73 172.73 0 01-23 22.93c-2.44-1.61-5.34-3.44-7.84-4.94-1.72-1-4.89-2.77-6.65-3.76-3.82-2.14-7.88-.54-9.79 3.4s-4.83 9.59-6.87 13.25a212.42 212.42 0 01-12.35 19.53C310.91 442.37 284.94 448 256 448s-54.77-5.63-79.4-17.15z"/></svg>
        <svg @click="() => {section='ask'; getAllFriendInvitations();}" xmlns="http://www.w3.org/2000/svg" :class="[section == 'ask' ? 'nav-icon-selected' : '' ,'nav-icon']" viewBox="0 0 512 512"><path d="M288 256c52.79 0 99.43-49.71 104-110.82 2.27-30.7-7.36-59.33-27.12-80.6C345.33 43.57 318 32 288 32c-30.24 0-57.59 11.5-77 32.38-19.63 21.11-29.2 49.8-27 80.78C188.49 206.28 235.12 256 288 256zM495.38 439.76c-8.44-46.82-34.79-86.15-76.19-113.75C382.42 301.5 335.83 288 288 288s-94.42 13.5-131.19 38c-41.4 27.6-67.75 66.93-76.19 113.75-1.93 10.73.69 21.34 7.19 29.11A30.94 30.94 0 00112 480h352a30.94 30.94 0 0024.21-11.13c6.48-7.77 9.1-18.38 7.17-29.11zM104 288v-40h40a16 16 0 000-32h-40v-40a16 16 0 00-32 0v40H32a16 16 0 000 32h40v40a16 16 0 0032 0z"/></svg>
      </nav>
    </div>

    <div v-if="section == 'list'" class="column friend-list">
      <div v-for="friend in menuInfo.friendList" class="friend-card" @click="inviteInGroup(friend.id)">
        <div class="row">
          <h3>{{ friend .username }}</h3>
          <svg xmlns="http://www.w3.org/2000/svg" :class="[friend.online ? 'online-indicator' : 'offline-indicator']" viewBox="0 0 512 512"><path d="M256 464c-114.69 0-208-93.31-208-208S141.31 48 256 48s208 93.31 208 208-93.31 208-208 208z"/></svg>
        </div>
        <p>{{ friend.status.length > 20 ? friend.status.substring(0, 17) + "..." : friend.status }}</p>
      </div>
    </div>

    <div v-if="section == 'ask'" class="column ask-content">
      <form class="form-invite" @submit.prevent="searchFriend">
        <input type="email" v-model="email" id="email" name="email" required>
        <button class="send-invitation" type="submit">Send</button>
      </form>

      <h3 class="ask-title">Friend Asks : </h3>

      <div v-for="friend in fInvitations.ask" class="friend-card" @click="() => {AccountServices.acceptFriend(friend.id).then(() => {getFriendList(); getAllFriendInvitations(); showNotification(friend.username + ' is now your friend !', null, true)})}">
        <div class="row">
          <h3>{{ friend?.username }}</h3>
          <svg xmlns="http://www.w3.org/2000/svg" :class="[friend?.online ? 'online-indicator' : 'offline-indicator']" viewBox="0 0 512 512"><path d="M256 464c-114.69 0-208-93.31-208-208S141.31 48 256 48s208 93.31 208 208-93.31 208-208 208z"/></svg>
        </div>
        <p>{{ friend?.status.length > 20 ? friend?.status.substring(0, 17) + "..." : friend?.status }}</p>
      </div>

      <h3 class="ask-title">Own Asks : </h3>

      <div v-for="friend in fInvitations.own" class="friend-card">
        <div class="row">
          <h3>{{ friend.username }}</h3>
          <svg xmlns="http://www.w3.org/2000/svg" :class="[friend?.online ? 'online-indicator' : 'offline-indicator']" viewBox="0 0 512 512"><path d="M256 464c-114.69 0-208-93.31-208-208S141.31 48 256 48s208 93.31 208 208-93.31 208-208 208z"/></svg>
        </div>
        <p>{{ friend?.status.length > 20 ? friend?.status.substring(0, 17) + "..." : friend?.status }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .title {
    height: max(100px, 12.5vh);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: center;
  }

  .title>h2 {
    font-size: 55px;
    margin: 1% 10%;
  }

  .close-button {
    height: 75px;
    cursor: pointer;
    position: absolute;
    right: 10px;
  }

  .friend-card {
    margin: 2px;
    height: max(90px,10vh);
    width: 100%;
    border-top: solid 3px;
    border-bottom: solid 3px;
    border-color: rgba(var(--background-color), 0.65);
    cursor: pointer;
    transition: border-color .125s ease-in-out, border-radius .125s ease-in-out;

    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
  }

  .friend-card:hover {
    border-radius: 15px;
    border-color: rgba(var(--secondary-color), .95);
  }

  .friend-card>div:nth-child(1) {
    transition: transform .125s ease-in-out;
    align-items: center;
    align-content: start;
    justify-items: start;
  }

  .friend-card:hover>div:nth-child(1) {
    transform: translateX(5px);
  }

  .friend-card>div:nth-child(1)>h3 {
    font-weight: 600;
    text-transform: capitalize;
    margin: 0 2.5%;
    font-size: 28px;
  }

  .friend-card>div:nth-child(1)>.online-indicator {
    height: 20px;
    margin: 1% 0;
    fill: rgba(0, 255, 0, 0.75);
  }

  .friend-card>div:nth-child(1)>.offline-indicator {
    height: 20px;
    margin: 1% 0;
    fill: rgba(var(--link-color), 0.75);
  }

  .friend-card>p {
    margin: 0 3%;
    font-weight: 500;
    font-size: 22px;
    transform: translateX(-5px);
    transition: transform .125s ease-in-out;
  }

  .friend-card:hover>p {
    transform: translateX(0px);
  }

  .social-nav-bar {
    align-items: center;
    justify-items: center;
    justify-content: space-evenly;
    border-bottom: solid 5px rgba(var(--selector-color), 0.75);
    transition: border-color .065s linear;
    margin: 2.5% 0;
  }

  .social-nav-bar:hover {
    border-color: rgba(var(--selector-color), 0.9);
  }

  .social-nav-bar>.nav-icon {
    height: 45px;
    padding: 4%;
    width: 100%;
    cursor: pointer;
    transition: background-color .05s linear;
  }

  .social-nav-bar>.nav-icon:hover {
    background: rgba(var(--selector-color), 1);
  }

  .nav-icon-selected {
    background: rgba(var(--selector-color), 0.65);
  }

  .form-invite {
    padding: 1% 2%
  }


  .form-invite>input {
    width: 94.5%;
    padding: 0.25% 2.5%;
    font-size: 20px;
    height: 30px;
    resize: none;
    overflow: scroll;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    background-color: rgb(var(--background-color));
    border: none;
  }

  .form-invite>input:focus {
    outline:none;
  }

  .send-invitation {
    border-radius: 0;
    background-color: rgba(var(--secondary-color));
    width: 100%;
    border: solid 2px rgba(var(--secondary-color));
  }

  .send-invitation:hover {
    background-color: rgb(var(--selector-color));
  }

  .ask-title {
    margin-top: 5%;
    margin-left: 2.5%;
    font-size: 32px;
  }
</style>