<script setup lang="ts">
import SNavbar from "../components/home/SNavbar.vue";
import Welcome from "../components/home/Welcome.vue";
import Footer from "../components/home/Footer.vue";
import About from "@/components/home/About.vue";
import Games from "@/components/home/Games.vue";
</script>

<template >
  <SNavbar></SNavbar>
  <main>
  
    <Welcome></Welcome>

    <Games/>

    <About></About>
    
    <Footer></Footer>

  </main>
</template>

<style scoped>

</style>