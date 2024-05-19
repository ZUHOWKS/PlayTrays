<script setup lang="ts">
</script>

<template>
  <div class="footer" id="contact">
    <h2>CONTACT</h2> 
    <div class="contacts-container">
      <div v-for="contact in contacts" :key="contact.id" class="contact">
        <div>{{ contact.name }}</div>
        <div>{{ contact.email }}</div>
      </div>
    </div>
    <div class="copyright">
      © 2024 Mathilde VARAGNAT, Joris VILARDELL, Othmane GARTANI, Mathias HELLAL. All Rights Reserved
    </div>
  </div>
</template>
  
<script>
export default {
  data() {
    return {
      contacts: [
        { id: 1, name: 'Mathilde VARAGNAT', email: 'mathilde.varagnat@etu.univ-savoie.fr' },
        { id: 2, name: 'Joris VILARDELL', email: 'joris.vilardell@etu.univ-savoie.fr' },
        { id: 3, name: 'Othmane GARTANI', email: 'othmane.gartani@etu.univ-savoie.fr' },
        { id: 4, name: 'Mathias HELLAL', email: 'mathias.hellal@etu.univ-savoie.fr' }
      ]
    };
  }
}
</script>

<style scoped>
.footer {
  display: flex;
  flex-direction: column;
  align-items: center; 
  justify-content: center;
  position: relative;
  width: 100%;
  background-color: #FFE66D;
  padding: 20px 0;
  box-sizing: border-box;
}

.footer h2 {
  align-self: center;
  font-size: 1.5rem;
  margin-bottom: 20px; 
  color: #333;
}

.contacts-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.footer .contact {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
}

.footer .contact div:first-child {
  font-weight: bold;
  text-align: center;
}

.footer .contact div:last-child {
  text-align: center;
  font-size: 0.9rem;
}

.footer .copyright {
  font-size: 0.8rem; 
  color: #333;
  margin-top: 20px;
  align-self: center; 
}

/* Requêtes média pour petits écrans */
@media (max-width: 768px) {
  .footer h2 {
    font-size: 1.2rem;
  }

  .footer .contact div:last-child {
    font-size: 1rem;
  }

  .footer .copyright {
    font-size: 0.9rem; 
  }
}
</style>