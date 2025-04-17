<script setup>
import { ref, watch, onMounted } from "vue";
import { updateFirestoreDoc } from "@/firebase/firestore";
import firestore from "@/firebase";
import { query, where, collection, onSnapshot } from "firebase/firestore";
import { useAppStore } from "@/stores/app";
import Panels from "./Panels.vue";
import { storeToRefs } from "pinia";
import AddPanel from "./AddPanel.vue";

const store = useAppStore();
const key = ref(1);
const services = ref([]);

const { hasTagUpdate, selectedAgenda } = storeToRefs(store);

const servicesCollection = collection(firestore, "services");

const getExpiredCards = (panels) => {
  const now = Date.now();

  return panels
    .map((panel) => {
      let hasExpiredCards = false;

      // Atualiza os cards do painel mantendo os que não expiraram
      const updatedCards = panel.cards.map((card) => {
        const isExpired = card.tags?.some(
          (tag) => tag.hasOwnProperty("expireTime") && now > tag.expireTime
        );

        if (!isExpired) return card; // Mantém os cards não expirados

        hasExpiredCards = true; // Marca que este painel teve cards expirados

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
              is_complete: false,
            },
          ],
          created_by: "",
        };
      });

      if (!hasExpiredCards) return null; // Ignora painéis sem cards expirados

      return { ...panel, cards: updatedCards };
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

let unsubscribe = null;

const setupSnapshotListener = (agendaId) => {
  if (unsubscribe) unsubscribe(); // Para a escuta anterior

  const q = query(servicesCollection, where("agenda_id", "==", agendaId));

  unsubscribe = onSnapshot(q, (querySnapshot) => {
    const updatedServices = [];

    querySnapshot.forEach((doc) => {
      updatedServices.push({ id: doc.id, ...doc.data() });
    });

    // Ordena e atualiza somente os serviços da agenda selecionada
    services.value = updatedServices.sort((a, b) => a.order - b.order);
    store.setLastIndex(services.value.length * 1000 + 1000);
  });
};

const checkExpiredCards = async (panels) => {
  console.log("Verificando e resetando cards expirados...");

  const panelsWithExpiredCards = getExpiredCards(panels);

  await resetExpiredCards(panelsWithExpiredCards);
};

watch(hasTagUpdate, () => {
  if (store.hasTagUpdate) {
    key.value++;
    store.setUpdate(false);
  }
});

watch(services, (val) => {
  if (val.length > 0) {
    checkExpiredCards(val);
    console.log(val);
  }
});

watch(selectedAgenda, async (val) => {
  if (val?.id) {
    setupSnapshotListener(val.id);
  }
});

onMounted(async () => {
  if (selectedAgenda.value?.id) {
    setupSnapshotListener(selectedAgenda.value.id);
  }
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
