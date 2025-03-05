<script setup>
import { ref, onMounted } from "vue";
import { getAgenda } from "@/firebase/firestore";
import firestore from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";

import Panels from "./Panels.vue";

const firestoreData = ref([]);

const servicesCollection = collection(firestore, "services");

const getFirestoreData = async () => {
  firestoreData.value = await getAgenda();
};

const unsub = onSnapshot(servicesCollection, (querySnapshot) => {
  querySnapshot.docChanges().forEach((change) => {
    getFirestoreData();
  });
});

onMounted(async () => {
  firestoreData.value = await getAgenda();
});
</script>

<template>
  <v-container
    fluid
    class="fill-height overflow-x-auto gradient"
    style="align-items: start"
  >
    <v-row align="start" class="pt-5">
      <v-col cols="12" class="d-flex align-start ga-3">
        <Panels :data="firestoreData" v-if="firestoreData.length > 0" />
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
.gradient {
  background: #0575e6; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #021b79,
    #0575e6
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #021b79,
    #0575e6
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
</style>
