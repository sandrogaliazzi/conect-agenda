<script setup>
import { ref, watch, onMounted } from "vue";
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

const getExpiredCards = (panels) => {
  const now = Date.now();

  return panels
    .map((panel) => {
      let hasExpiredCard = false;

      // Atualiza os cards do painel original
      const updatedCards = panel.cards.map((card) => {
        const hasExpiredTag = card.tags?.some(
          (tag) => tag.hasOwnProperty("expireTime") && now > tag.expireTime
        );

        if (hasExpiredTag) {
          hasExpiredCard = true; // Marca que o painel tem pelo menos um card expirado

          panel.history_logs.push({
            log: `Reserva: ${
              card.card_content
            } removida em ${new Date().toLocaleString()}`,
            event_type: "expirado",
            user: "sistema",
          });

          return {
            ...card,
            card_content: "REMOVIDO RESERVA",
            tags: [
              {
                color: "#4CAF68",
                id: "lFyEh36QC60dSJqiB7HV",
                label: "DISPONÍVEL",
              },
            ],
            created_by: "",
          };
        }

        return card; // Retorna o card original se não expirou
      });

      return hasExpiredCard ? { ...panel, cards: updatedCards } : null;
    })
    .filter((panel) => panel !== null);
};

const resetExpiredCards = async (panels) => {
  if (!panels.length) return;
  await Promise.all(
    panels.map((panel) => {
      return updateFirestoreDoc(panel.id, panel, "services");
    })
  );

  console.log("resetado cards expirados");
};

const getFirestoreData = async () => {
  getServicesByAgendaId(selectedAgenda.value.id);
};

const checkExpiredCards = async (panels) => {
  console.log("Verificando e resetando cards expirados...");

  const panelsWithExpiredCards = getExpiredCards(panels);

  console.log(panelsWithExpiredCards);

  await resetExpiredCards(panelsWithExpiredCards);
};

const unsub = onSnapshot(servicesCollection, (querySnapshot) => {
  getFirestoreData();
  checkExpiredCards();
  // querySnapshot.docChanges().forEach((change) => {
  //   const docData = change.doc.data();
  //   const docId = change.doc.id;
  //   const index = services.value.findIndex((s) => s.id === docId);

  //   if (change.type === "modified") {
  //     // Valida se o id já está setado no documento
  //     if (docData.id === docId) {
  //       if (index !== -1) {
  //         // Atualiza
  //         services.value[index] = { id: docId, ...docData };
  //       } else {
  //         // Adiciona no lugar certo se ainda não tiver na lista
  //         services.value.splice(docData.order, 0, { id: docId, ...docData });
  //       }
  //     }
  //   }

  //   if (change.type === "removed") {
  //     if (index !== -1) services.value.splice(index, 1);
  //   }
  // });
});

watch(hasTagUpdate, () => {
  if (store.hasTagUpdate) {
    key.value++;
    store.setUpdate(false);
  }
});

watch(selectedAgenda, async (val) => {
  console.log(val);
  await getServicesByAgendaId(val.id);
  store.setLastIndex(services.value.length + 1);
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
          v-model="services"
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
