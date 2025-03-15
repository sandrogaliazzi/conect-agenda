<script setup>
import { ref, watch } from "vue";
import {
  updateFirestoreDoc,
  getDocumentsByAgendaId,
} from "@/firebase/firestore";
import firestore from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAppStore } from "@/stores/app";
import Panels from "./Panels.vue";
import { storeToRefs } from "pinia";
import AddPanel from "./AddPanel.vue";

const store = useAppStore();
const key = ref(1);
const services = ref([]);

const { hasTagUpdate, selectedAgenda } = storeToRefs(store);

const servicesCollection = collection(firestore, "services");

const getServicesByAgendaId = async (id) => {
  services.value = await getDocumentsByAgendaId(id);
};

const getFirestoreData = async () => {
  getServicesByAgendaId(selectedAgenda.value.id);
};

const unsub = onSnapshot(servicesCollection, (querySnapshot) => {
  querySnapshot.docChanges().forEach((_) => {
    getFirestoreData();
  });
});

watch(hasTagUpdate, () => {
  if (store.hasTagUpdate) {
    key.value++;
    store.setUpdate(false);
  }
});

watch(selectedAgenda, (val) => {
  getServicesByAgendaId(val.id);
});

const handleTitleEdit = async (data) => {
  const { panel, title } = data;

  const oldPanelRef = services.value.find(
    (doc) => doc.panel_id === panel.panel_id
  );

  if (!oldPanelRef) return;

  oldPanelRef.title = title;

  try {
    await updateFirestoreDoc(oldPanelRef.id, oldPanelRef, "services");
  } catch (error) {
    alert("erro ao editar painél");
    throw error;
  }
};
</script>

<template>
  <v-container
    fluid
    class="fill-height overflow-x-auto gradient"
    style="align-items: start"
  >
    <v-row align="start" class="pt-5">
      <v-col cols="12" class="d-flex align-start ga-3">
        <Panels
          :data="services"
          :key="key"
          v-if="services.length > 0"
          @title-edit="(panel) => handleTitleEdit(panel)"
        />
        <AddPanel />
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
