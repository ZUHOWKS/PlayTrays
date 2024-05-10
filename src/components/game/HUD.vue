<script setup lang="ts">
</script>

<template>

  <div class="money">
    <img src="https://i.pinimg.com/originals/9f/41/09/9f410947631b1d109bda0b5e91ace3ff.jpg" height="50" width="50" class="img-user">
    <p class="username">Majurax</p>
    <p class="nbargent">Argent: £ 20000</p>
  </div>

  <div class="hud">
    <div class="container column">
      <div class="title column">
        <p class="sub-title">titre de propriété</p>
        <h3 class="name">rue de la paix</h3>
      </div>
      <div class="content">
        <div class="details row">

          <div class="column">
            <p>Loyer</p>
            <p>  <<</p>
            <p>  <<</p>
            <p>  <<</p>
            <p>  <<</p>
            <p>  <<</p>
          </div>

          <div class="column">
            <p>- Terrain</p>
            <p>- Avec&nbsp;&nbsp;1</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1</p>
          </div>

          <div class="column">
            <p>nu</p>
            <p>maison</p>
            <p><<</p>
            <p><<</p>
            <p><<</p>
            <p> hotel</p>
          </div>

          <div class="column">
            <p class="price-default"></p>
            <p class="price-1"></p>
            <p class="price-2"></p>
            <p class="price-3"></p>
            <p class="price-4"></p>
            <p class="price-5"></p>
          </div>

        </div>

        <div class="desc row">
          <p>Si un joueur possède TOUS les terrains d'une même couleur, la valeur de ceux-ci est doublée</p>
        </div>

        <div class="info row">
          <div class="column">
            <p>Prix des maisons</p>
            <p>Prix d'un hotel</p>
          </div>

          <div class="column">
            <p class="price-maison"></p>
            <p class="price-hotel"></p>
            <p></p>
          </div>
        </div>
      </div>


    </div>
  </div>

</template>

<style scoped>

.money{
  position: fixed;
  top: 1%;
  left: 0.5%;
  width: 30vh;
  height: 30vh;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.img-user{
  height: 15vh;
  width: 15vh;
  border-radius: 50%;
}
.money>.nbargent{
  bacground-color: black;
  width: 100%;
  height: 100%;
}

.hud {
  position: fixed;
  bottom: 1%;
  right: 0.5%;
  width: 32.5vh;
  height: 47.5vh;
  padding: 0.5%;
  background-color: white;
  border-radius: 4%;

  display: flex;
  justify-content: center;
  align-items: center;

  transform: translateY(60vh);
  transition: transform .5s ease-out;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.container {
  width: 100%;
  height: 97.5%;
  position: relative;

  padding: 1.5%;
  border: solid 1px black;
  background-color: white;
  border-radius: 5px;

  align-items: center;
  justify-content: space-evenly;
}

.container>.title {
  width: 100%;
  height: 25%;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  border-radius: 5px;
}

.container>.title:nth-child(n) {
  text-align: center;
  text-transform: uppercase;
}

.container>.content {
  height: 75%;
  width: 100%;
}

.content>div>p:nth-child(n) {
  font-size: 18px;
}

.content>div>div>p:nth-child(n) {
  font-size: 18px;
}

.content>.details {
  height: 45%;
  width: 100%;
  margin: 0 1%;
  justify-content: space-between;
}

.content>.details>div {
  width: 100%;
  margin: 0 1%;
}

.content>.desc {
  height: 20%;
  margin: 0 2%;
  border-top: solid 2px black;
  border-bottom: solid 2px black;
  padding: 1% 0.1%;
}

.content>.info {
  height: 30%;
  justify-content: space-evenly;
}
@media screen and (max-height: 950px) {

  .title>.sub-title {
    font-size: 18px;
  }

  .title>.name {
    font-size: 30px;
  }

  .content>div>p:nth-child(n) {
    font-size: 15px;
  }

  .content>div>div>p:nth-child(n) {
    font-size: 15px;
  }
}

@media screen and (max-height: 750px) {

  .title>.sub-title {
    font-size: 15px;
  }

  .title>.name {
    font-size: 27px;
  }

  .content>div>p:nth-child(n) {
    font-size: 12px;
  }

  .content>div>div>p:nth-child(n) {
    font-size: 12px;
  }
}

@media screen and (max-height: 550px) {

  .title>.sub-title {
    font-size: 10px;
  }

  .title>.name {
    font-size: 18px;
  }

  .content>div>p:nth-child(n) {
    font-size: 8px;
  }

  .content>div>div>p:nth-child(n) {
    font-size: 8px;
  }
}

</style>