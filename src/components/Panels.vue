<script setup>
import { ref, computed, toRefs, onMounted, watch } from "vue";
import Cards from "./Cards.vue";
import CardForm from "./CardForm.vue";
import History from "./History.vue";
import draggble from "vuedraggable";
import {
  updateFirestoreDoc,
  deleteFirestoreDoc,
  setFirestoreDoc,
} from "@/firebase/firestore";
import { rules } from "./inputRules";
import { useAuth } from "@/composables/auth";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import { serverTimestamp } from "firebase/firestore";
import { randomId } from "@/firebase/firestore";
import { useWindowSize } from "vue-window-size";
import { generateKeyBetween } from "fractional-indexing";

const store = useAppStore();
const { selectedAgenda } = storeToRefs(store);

const data = defineModel();
const emit = defineEmits(["titleEdit"]);

const hoveringOn = ref(null);
const panelClick = ref(null);
const panelForm = ref(null);
const drawer = ref(false);
const title = ref("");
const refreshTags = ref(0);
const blockCardId = ref(false);
const { user } = useAuth();

const beforeDragChange = ref([...data.value]);

watch(data, () => {
  beforeDragChange.value = [...data.value];
});

const userName = computed(() => user.value.email.split("@")[0]);

const updateFirestore = async (newData) => {
  await Promise.all(
    newData.map(async (d) => await updateFirestoreDoc(d.id, d, "services"))
  );
  console.log("dados atualizados no firestore");
};

const handleDraggOperation = () => {
  const changes = [];

  data.value.forEach((item, index) => {
    const initialItem = beforeDragChange.value[index];

    if (JSON.stringify(item) !== JSON.stringify(initialItem)) {
      changes.push(item);
    }
  });

  if (changes.length > 0) {
    updateFirestore(changes);
  }

  beforeDragChange.value = [...data.value];
};

const handleFormSubmit = async (formData, submitType) => {
  try {
    let panel = data.value.find(
      (d) => d.panel_id == (formData.panelId || panelClick.value)
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
        const { id, content, is_complete } = formData;
        const card = findCard(id);
        if (!card) throw new Error("Cartão não encontrado!");

        const oldVal = card.card_content;
        card.card_content = content;
        card.is_complete = is_complete || false;
        console.log(card, is_complete, content);
        if (oldVal != content.value) {
          addHistoryLog(
            `Cartão editado: ${oldVal} > ${content.value}`,
            "update"
          );
        }
        break;
      }

      case "finishCard": {
        const { id, is_complete } = formData;
        const card = findCard(id);
        if (!card) throw new Error("Cartão não encontrado!");

        card.is_complete = is_complete;
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

        const tagDisponivel = content.filter(
          (tag) => tag.label.toUpperCase() !== "DISPONÍVEL"
        );

        const oldTagsRef = !card.tags ? [""] : card.tags;

        addHistoryLog(
          `alteração de tag: ${oldTagsRef
            .map((t) => t.label)
            .join("")} > ${content.map((t) => t.label).join(",")}`,
          "tagChange"
        );

        card.tags = !tagDisponivel.length ? content : tagDisponivel;
        break;
      }

      case "blockPanel": {
        blockCardId.value = formData.panelId;
        panel.lock = !panel.lock;
        panel.userLock = user.value.email.split("@")[0];
        addHistoryLog(
          `Lista ${panel.lock ? "Bloqueada" : "Desbloqueada"}`,
          "block"
        );
        break;
      }

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

const handlePanelForm = (panel) => {
  if (!panel) {
    panelForm.value = null;
    title.value = "";
  } else {
    panelForm.value = panel.panel_id;
    title.value = panel.title;
  }
};

const handleTitleEdit = (panel) => {
  emit("titleEdit", { panel, title });
  panelForm.value = null;
  title.value = "";
};

const historyData = ref([]);

const showHistoryDrawer = ({ history_logs }) => {
  historyData.value = history_logs;
  drawer.value = true;
};

const { width } = toRefs(useWindowSize());

const isOrderTooClose = (list, minGap = 10) => {
  const sorted = [...list].sort((a, b) => a.order - b.order);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].order - sorted[i - 1].order < minGap) return true;
  }
  return false;
};

async function reorderList(e) {
  if (!e.moved) return;

  const { newIndex, element } = e.moved;

  // Ordena a lista atual usando a comparação correta
  const sorted = [...beforeDragChange.value].sort((a, b) =>
    a.order < b.order ? -1 : 1
  );

  // Encontra o item movido e filtra a lista sem ele
  const movedItem = sorted.find((item) => item.id === element.id);
  const filtered = sorted.filter((item) => item.id !== movedItem.id);

  // Determina a nova posição
  let newOrder;

  // Caso 1: Mover para o início da lista
  if (newIndex === 0) {
    newOrder = generateKeyBetween(null, filtered[0]?.order);
  }
  // Caso 2: Mover para o final da lista
  else if (newIndex >= filtered.length) {
    newOrder = generateKeyBetween(filtered[filtered.length - 1]?.order, null);
  }
  // Caso 3: Mover entre dois itens
  else {
    const before = filtered[newIndex - 1];
    const after = filtered[newIndex];
    newOrder = generateKeyBetween(before?.order, after?.order);
  }

  // Atualiza o item movido
  movedItem.order = newOrder;

  // Mantém a lista ordenada após a mudança
  const reordered = [...filtered];
  reordered.splice(newIndex, 0, movedItem);

  // Atualiza o Firestore e o estado local
  await updateFirestoreDoc(movedItem.id, movedItem, "services");
  beforeDragChange.value = reordered;
}

async function addSidePanel(panel) {
  // Ordena os painéis usando comparação direta
  const sortedPanels = [...data.value].sort((a, b) =>
    a.order < b.order ? -1 : 1
  );

  // Encontra o painel atual na lista ordenada
  const currentIndex = sortedPanels.findIndex(
    (p) => p.panel_id === panel.panel_id
  );

  // Determina as chaves vizinhas
  let beforeOrder = null;
  let afterOrder = null;

  if (currentIndex < sortedPanels.length - 1) {
    // Se não for o último item, insere entre o atual e o próximo
    beforeOrder = sortedPanels[currentIndex].order;
    afterOrder = sortedPanels[currentIndex + 1].order;
  } else {
    // Se for o último item, insere após ele
    beforeOrder = sortedPanels[currentIndex].order;
    afterOrder = null;
  }

  // Gera a nova chave de ordenação
  const newOrder = generateKeyBetween(beforeOrder, afterOrder);

  // Cria o novo painel
  const newPanel = {
    agenda_id: selectedAgenda.value.id,
    date: serverTimestamp(),
    panel_id: randomId(),
    title: "Nova Lista duplicada",
    cards: [...panel.cards], // Copia os cards
    order: newOrder,
    history_logs: [],
  };

  // Encontra a posição de inserção na lista original
  const insertIndex = data.value.findIndex((d) => d.order > newOrder);

  // Insere na posição correta
  if (insertIndex === -1) {
    data.value.push(newPanel);
  } else {
    data.value.splice(insertIndex, 0, newPanel);
  }

  await setFirestoreDoc(newPanel.panel_id, newPanel, "services");
}
</script>

<template>
  <draggble
    class="d-flex align-start ga-3"
    v-model="data"
    @change="reorderList"
    group="panels"
    :disabled="width < 600"
    item-key="id"
    :animation="300"
  >
    <template #item="{ element: panel }">
      <div>
        <v-card
          :disabled="panel.lock"
          width="300px"
          rounded="xl"
          @mouseenter="hoveringOn = panel.panel_id"
          @mouseleave="hoveringOn = null"
        >
          <template #append>
            <v-btn icon="mdi-dots-horizontal" variant="plain" size="small">
              <v-icon>mdi-dots-horizontal</v-icon>
              <v-menu activator="parent">
                <v-list>
                  <v-list-item>
                    <v-btn
                      prepend-icon="mdi-history"
                      variant="plain"
                      size="small"
                      text="histórico"
                      @click="showHistoryDrawer(panel)"
                    ></v-btn>
                  </v-list-item>
                  <v-list-item>
                    <v-btn
                      prepend-icon="mdi-lock"
                      variant="plain"
                      size="small"
                      type="submit"
                      text="bloquear lista"
                      @click="
                        handleFormSubmit(
                          { panelId: panel.panel_id },
                          'blockPanel'
                        )
                      "
                    ></v-btn>
                  </v-list-item>
                  <v-list-item>
                    <v-btn
                      prepend-icon="mdi-pencil"
                      variant="plain"
                      size="small"
                      text="editar título da lista"
                      @click="handlePanelForm(panel)"
                    ></v-btn>
                  </v-list-item>
                  <v-list-item>
                    <v-btn
                      prepend-icon="mdi-content-duplicate"
                      variant="plain"
                      size="small"
                      text="duplicar lista"
                      @click="addSidePanel(panel)"
                    ></v-btn>
                  </v-list-item>
                  <v-list-item>
                    <v-btn
                      prepend-icon="mdi-delete"
                      @click="deleteFirestoreDoc(panel.id, 'services')"
                      variant="plain"
                      text="excluir lista"
                      size="small"
                    ></v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
          </template>

          <template #title>
            <p
              v-if="panelForm !== panel.panel_id"
              @click="handlePanelForm(panel)"
              class="text-line"
            >
              {{ panel.title }}
            </p>
            <v-form
              v-if="panelForm === panel.panel_id"
              @submit.prevent="handleTitleEdit(panel)"
            >
              <v-text-field
                autofocus
                v-model="title"
                variant="underlined"
                :rules="rules"
                @blur="handlePanelForm()"
              ></v-text-field>
            </v-form>
          </template>

          <v-card-text style="max-height: 600px; overflow-y: auto">
            <draggble
              v-if="panel.cards"
              v-model="panel.cards"
              item-key="id"
              group="cards"
              :disabled="width < 600"
              :animation="300"
              @change="handleDraggOperation"
            >
              <template #item="{ element: card }">
                <Cards
                  :data="card"
                  :panel="panel.panel_id"
                  @update-card="(card) => handleFormSubmit(card, 'updateCard')"
                  @delete-card="(card) => handleFormSubmit(card, 'deleteCard')"
                  @update-tags="(card) => handleFormSubmit(card, 'updateTags')"
                  @finish-card="(card) => handleFormSubmit(card, 'finishCard')"
                  :key="refreshTags"
                />
              </template>
            </draggble>
            <CardForm
              class="mt-4"
              v-if="panelClick == panel.panel_id"
              :panel="panelClick"
              @close-form="panelClick = null"
              @submit-form="
                (formData) => handleFormSubmit(formData, 'createCard')
              "
            />
          </v-card-text>

          <v-card-actions>
            <v-btn
              prepend-icon="mdi-plus"
              variant="plain"
              block
              rounded
              @click="panelClick = panel.panel_id"
            >
              Adicionar cartão
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-btn
          block
          rounded
          variant="plain"
          text="desbloquear"
          prepend-icon="mdi-unlock"
          @click="handleFormSubmit({ panelId: panel.panel_id }, 'blockPanel')"
          v-if="panel.lock && panel.userLock == userName"
        ></v-btn>
        <v-btn
          block
          rounded
          variant="plain"
          prepend-icon="mdi-lock"
          v-else-if="panel.userLock && userName !== panel.userLock"
          >Bloqueado por {{ panel.userLock }}</v-btn
        >
      </div>
    </template>
  </draggble>

  <History v-model="drawer" :data="historyData" />
</template>

<style scoped>
.text-line {
  font-size: 14px;
  text-wrap: wrap;
  font-weight: 400;
}
</style>
