<script setup>
import { ref } from "vue";
import { rules } from "./inputRules";
import { serverTimestamp } from "firebase/firestore";
import { createFirestoreDoc } from "@/firebase/firestore";
import { randomId } from "@/firebase/firestore";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import AddPanelForm from "./AddPanelForm.vue";

const store = useAppStore();
const { selectedAgenda, lastIndex } = storeToRefs(store);

const emit = defineEmits(["createPanel"]);

const showForm = ref(false);
const newPanelTitle = ref("");
const dialog = ref(false);

const handleFormSubmit = async () => {
  await createFirestoreDoc(
    {
      agenda_id: selectedAgenda.value.id,
      date: serverTimestamp(),
      panel_id: randomId(),
      title: newPanelTitle.value,
      cards: [],
      history_logs: [],
      order: lastIndex.value,
    },
    "services"
  );
  showForm.value = false;
};
</script>

<template>
  <v-card rounded="xl" min-width="300">
    <v-card-title v-if="!showForm" class="d-flex justify-center align-center">
      <v-btn
        icon="mdi-plus"
        variant="plain"
        size="large"
        @click="showForm = true"
      ></v-btn>
    </v-card-title>
    <v-card-text v-else>
      <v-form
        @submit.prevent="handleFormSubmit"
        class="d-flex justify-center flex-column"
      >
        <v-text-field
          variant="underlined"
          placeholder="titúlo novo quadro"
          :rules="rules"
          v-model="newPanelTitle"
        ></v-text-field>
        <v-btn
          type="submit"
          rounded
          text="salvar"
          color="primary"
          block
        ></v-btn>
        <v-btn
          rounded
          text="cancelar"
          color="grey"
          class="my-3"
          variant="text"
          @click="showForm = false"
        ></v-btn>
      </v-form>
      <v-divider></v-divider>
      <v-btn
        rounded
        text="Adicionar em massa"
        variant="plain"
        class="mt-5"
        @click="dialog = true"
        block
      ></v-btn>
    </v-card-text>
  </v-card>
  <AddPanelForm v-model="dialog" />
</template>
