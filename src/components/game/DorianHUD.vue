<script setup lang="ts">
</script>

<template>

  <div class="user" id="you">
    <div class="avatar">
      <img src="https://i.pinimg.com/originals/9f/41/09/9f410947631b1d109bda0b5e91ace3ff.jpg" height="50" width="50" class="img-user">
    </div>
    <div class="content">
      <p class="username">You</p>
      <p class="argent">Argent: <span>£</span><span class="user-money">550 000</span></p>
    </div>
  </div>

  <div class="user" id="other-user" >
    <div class="avatar">
      <img src="https://i.pinimg.com/originals/9f/41/09/9f410947631b1d109bda0b5e91ace3ff.jpg" height="50" width="50" class="img-user">
    </div>

    <div class="content">
      <p class="username" ref="otherUsername">Unselect</p>
      <p class="argent">Argent: <span>£</span><span class="other-money">550 000</span></p>
    </div>
  </div>

  <div class="caseCard card">
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

          <div class="column .terrain">
            <p>- Terrain</p>
            <p>- Avec &nbsp;1</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5</p>
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

  <div class="card-action">

    <div class="caseCardAction card">
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

            <div class="column .terrain">
              <p>- Terrain</p>
              <p>- Avec &nbsp;1</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5</p>
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

    <div class="actions">
      <button class="action" id="Buy">Buy</button>
      <button class="action" id="Quit">Quit</button>
    </div>

  </div>

</template>

<style scoped>

.user{
  position: fixed;
  top: 1%;
  left: 0.5%;
  height: 8vh;
  width: 25vh;
  padding: 0.5% 0.75%;
  border-radius: 13px;

  display: flex;
  flex-direction: row;
  justify-content: space-around;
  justify-items: flex-start;
  align-items: center;

  background: white;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.115);

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.user#other-user {
  top: 1%;
  right: 0.5%;
  left: unset;
  transform: translateX(150%);
  transition: transform 1s ease-in-out;
}


.user>.avatar  {
  height: 6vh;
  width: 6vh;
  border-radius: 6vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user>.avatar>img {
  height: auto;
  width: 100%;
}

.user>.content {
  display: flex;
  flex-direction: column;
  padding: 2%;
  width: 15.5vh;
}

.user>.content>p, .user>.content>p>span {
  font-size: 1.85vh;
}

.user>.content>p {
  font-weight: 600;
}

.user>.content>p>span {
  font-weight: 400;
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

.card-action {
  position: fixed;
  top: 12.5vh;
  left: 30%;
  width: 75vh;
  background: transparent;
  height: 75vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  visibility: hidden;
  justify-content: space-evenly;
}

.card-action>.actions {
  width: 75%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-action>.actions>.action {
  width: 35%;
  margin: 0 2.5%;
}

.card {
  width: 32.5vh;
  height: 47.5vh;
  padding: 0.5%;
  background-color: white;
  border-radius: 4%;

  display: flex;
  justify-content: center;
  align-items: center;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.caseCard {
  position: fixed;
  bottom: 1%;
  right: 0.5%;
  transform: translateY(60vh);
  transition: transform .5s ease-out;
}


.card>.container  {
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

.card>.container>.title {
  width: 100%;
  height: 25%;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 5px;
}

.card>.container>.title>.name {
  font-size: 2vw;
}

.card>.container>.title>.sub-title {
  font-size: 1.25vw;
}

.card>.container>.title:nth-child(n) {
  text-align: center;
  text-transform: uppercase;
}

.card>.container>.content {
  height: 75%;
  width: 100%;
}

.card>.container>.content>div>p, .card>.container>.content>div>div>p {
  font-size: 0.85vw;
}

.card>.container>.content>.details {
  height: 45%;
  width: 100%;
  margin: 0 1%;
  justify-content: space-between;
}

.card>.container>.content>.details>div{
  width: 100%;
  margin: 0 1%;
}

.card>.container>.content>.desc {
  height: 20%;
  margin: 0 2%;
  border-top: solid 2px black;
  border-bottom: solid 2px black;
  padding: 1% 0.1%;
}

.card>.container>.content>.info {
  height: 30%;
  justify-content: space-evenly;
}

</style>