<script setup>
import { ref, computed } from "vue";
import Draggable from "vuedraggable";
import PanelCard from "./PanelCard.vue";
import History from "./History.vue";
import {
  updateFirestoreDoc,
  setFirestoreDoc,
  deleteFirestoreDoc,
} from "@/firebase/firestore";
import { useAuth } from "@/composables/auth";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import { serverTimestamp } from "firebase/firestore";
import { randomId } from "@/firebase/firestore";

const emit = defineEmits(["titleEdit"]);
const data = defineModel();

const store = useAppStore();
const { selectedAgenda } = storeToRefs(store);
const { user } = useAuth();

const hoveringOn = ref(null);
const panelClick = ref(null);
const panelForm = ref(null);
const drawer = ref(false);
const title = ref("");
const historyData = ref([]);
const blockCardId = ref(false);

const userName = computed(() => user.value.email.split("@")[0]);

const updateFirestore = async (newData) => {
  await Promise.all(
    newData.value.map((d) => updateFirestoreDoc(d.id, d, "services"))
  );
};

const handleFormSubmit = async (formData, submitType) => {
  try {
    let panel = data.value.find(
      (d) => d.panel_id === (formData.panelId || panelClick.value)
    );
    if (!panel) throw new Error("Painel não encontrado!");

    const addHistoryLog = (log, eventType) => {
      panel.history_logs.push({
        log: `${log} em ${new Date().toLocaleString()}`,
        event_type: eventType,
        user: userName,
      });
    };

    const findCard = (id) => panel.cards.find((c) => c.id === id);

    switch (submitType) {
      case "createCard":
        panel.cards.push({ ...formData });
        addHistoryLog(`Cartão adicionado: ${formData.card_content}`, "create");
        break;

      case "updateCard": {
        const { id, content } = formData;
        const card = findCard(id);
        if (!card) throw new Error("Cartão não encontrado!");
        const oldVal = card.card_content;
        card.card_content = content;
        addHistoryLog(`Cartão editado: ${oldVal} > ${content}`, "update");
        break;
      }

      case "deleteCard": {
        const { id } = formData;
        const card = findCard(id);
        if (!card) throw new Error("Cartão não encontrado!");
        const oldVal = card.card_content;
        panel.cards = panel.cards.filter((c) => c.id !== id);
        addHistoryLog(`Cartão ${oldVal} excluído`, "delete");
        break;
      }

      case "updateTags": {
        const { id, content } = formData;
        const card = findCard(id);
        if (!card) throw new Error("Cartão não encontrado!");
        card.tags = content;
        break;
      }

      case "blockPanel":
        blockCardId.value = formData.panelId;
        panel.lock = !panel.lock;
        panel.userLock = userName.value;
        addHistoryLog(
          `Lista ${panel.lock ? "Bloqueada" : "Desbloqueada"}`,
          "block"
        );
        break;

      default:
        throw new Error("Tipo de submissão inválido!");
    }

    await updateFirestoreDoc(panel.id, panel, "services");
    panelClick.value = null;
  } catch (error) {
    alert("Erro ao processar a solicitação: " + error.message);
    throw error;
  }
};

const reorderList = async (e) => {
  if (e.moved) {
    const { newIndex, oldIndex, element } = e.moved;
    const panel = data.value.find((d) => d.id === element.id);
    const panel2 = data.value.find(
      (d) => d.order === newIndex && d.id !== panel.id
    );
    panel.order = newIndex;
    if (panel2) panel2.order = oldIndex;

    const updates = [updateFirestoreDoc(panel.id, panel, "services")];
    if (panel2) updates.push(updateFirestoreDoc(panel2.id, panel2, "services"));
    await Promise.all(updates);
  }
};

const addSidePanel = async (panel) => {
  const insertIndex = panel.order;
  data.value.forEach((d) => {
    if (d.order > insertIndex) d.order++;
  });

  const newPanel = {
    agenda_id: selectedAgenda.value.id,
    date: serverTimestamp(),
    panel_id: randomId(),
    title: "Nova Lista duplicada",
    cards: panel.cards,
    order: insertIndex + 1,
    history_logs: [],
  };

  const arrayInsertIndex = data.value.findIndex((d) => d.order > insertIndex);
  if (arrayInsertIndex === -1) data.value.push(newPanel);
  else data.value.splice(arrayInsertIndex, 0, newPanel);

  await setFirestoreDoc(newPanel.panel_id, newPanel, "services");
};

const showHistoryDrawer = ({ history_logs }) => {
  historyData.value = history_logs;
  drawer.value = true;
};
</script>

<template>
  <Draggable
    class="d-flex align-start ga-3"
    v-model="data"
    @change="reorderList"
    group="panels"
    item-key="id"
    :animation="300"
  >
    <template #item="{ element: panel }">
      <PanelCard
        :panel="panel"
        :hoveringOn="hoveringOn"
        :panelClick="panelClick"
        :panelForm="panelForm"
        :title="title"
        :userName="userName"
        @update-card="(card) => handleFormSubmit(card, 'updateCard')"
        @delete-card="(card) => handleFormSubmit(card, 'deleteCard')"
        @update-tags="(card) => handleFormSubmit(card, 'updateTags')"
        @create-card="(card) => handleFormSubmit(card, 'createCard')"
        @block-panel="(panelId) => handleFormSubmit({ panelId }, 'blockPanel')"
        @edit-title="emit('titleEdit', $event)"
        @show-history="showHistoryDrawer"
        @duplicate-panel="addSidePanel"
        @delete-panel="(panelId) => deleteFirestoreDoc(panelId, 'services')"
      />
    </template>
  </Draggable>

  <History v-model="drawer" :data="historyData" />
</template>
