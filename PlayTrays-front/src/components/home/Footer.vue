<script setup lang="ts">
</script>

<template>
  <div class="footer" id="contact">
    <h2>CONTACT</h2> 
    <div class="contacts-container">
        <div class="contact-item">
            <span class="contact-name">Mathilde VARAGNAT</span>
            <a href="https://github.com/Mathvar" class="contact-github">@Mathvar</a>
        </div>
        <div class="contact-item">
            <span class="contact-name">Joris VILARDELL</span>
            <a href="https://zuhowks.github.io/" class="contact-github">@Zuhowks</a>
        </div>
        <div class="contact-item">
            <span class="contact-name">Othmane GARTANI</span>
            <a href="https://github.com/OthGart" class="contact-github">@OthGart</a>
        </div>
        <div class="contact-item">
            <span class="contact-name">Mathias HELLAL</span>
            <a href="https://github.com/Majurax" class="contact-github">@Majurax</a>
        </div>
    </div>
    <div class="copyright">
      © 2024 Mathilde VARAGNAT, Joris VILARDELL, Othmane GARTANI, Mathias HELLAL. All Rights Reserved
    </div>
  </div>
</template>


<style scoped>
.footer {
  display: flex;
  flex-direction: column;
  align-items: center; 
  justify-content: center;
  background-color: rgb(var(--primary-color));
  padding: 2% 3%;
}

h2 {
  font-size: min(3.4vw, 3.4vh);
  margin: 2% 0;
}

.contacts-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-evenly;
  align-content: center;
}

.contact-item {
  display:flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  margin: 1.5%;
}

.contact-name {
  font-size: min(2.2vw, 2.2vh);
  text-align: center;
}

.contact-github {
  text-align: center;
  font-size: min(1.8vw, 1.8vh);
}

.copyright {
  font-size: min(1.7vw, 1.7vh);
  margin: 1.5% 0;
}

/* Requêtes média pour petits écrans */
@media screen and (max-width: 800px) {
  h2 {
    font-size: min(4.5vw, 4.5vh);
  }

  .contacts-container {
    margin: 1.5%;
  }

  .contact-name {
    font-size: min(3.3vw, 3.3vh);
  }

  .contact-github {
    font-size: min(2.8vw, 2.8vh);
  }

  .copyright {
    font-size: min(2vw, 2vh);
  }
}
</style>