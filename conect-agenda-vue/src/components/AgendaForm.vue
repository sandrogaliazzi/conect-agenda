<script setup>
import { ref, watch } from "vue";
import { rules } from "./inputRules";
import { createFirestoreDoc, updateFirestoreDoc } from "@/firebase/firestore";
import { useAppStore } from "@/stores/app";

const store = useAppStore();
const { agenda } = defineProps(["agenda"]);

const title = ref();
const showForm = defineModel();
const users = ref([
  "sandro",
  "marcelo",
  "tainan",
  "william",
  "wellington",
  "leonardo",
  "joao",
  "gabriel",
  "david",
  "nadine",
  "janice",
  "orjana",
  "felipe",
  "julia",
  "angelicao",
  "luisfelipe",
  "douglas",
  "jessica",
  "fabio",
  "dionatan",
  "vinicius",
]);
const selectedUsers = ref([]);

watch(
  () => agenda,
  (val) => {
    title.value = val.title;
    selectedUsers.value = val.users;
  },
  { deep: true }
);

const handleFormSubmit = async () => {
  if (!agenda.id) {
    const agendaId = await createFirestoreDoc(
      { title: title.value, users: selectedUsers.value },
      "agendas"
    );
    store.setAgenda({ id: agendaId, title: title.value });
  } else {
    await updateFirestoreDoc(
      agenda.id,
      { title: title.value, users: selectedUsers.value },
      "agendas"
    );
  }
  showForm.value = false;
};
</script>

<template>
  <v-dialog v-model="showForm" max-width="400px">
    <v-card elevation="0" rounded="xl">
      <v-card-text>
        <v-form
          @submit.prevent="handleFormSubmit"
          class="d-flex justify-center flex-column"
        >
          <v-text-field
            variant="underlined"
            placeholder="titúlo agenda"
            :rules="rules"
            v-model="title"
          ></v-text-field>
          <v-select
            variant="underlined"
            label="usuários"
            :rules="rules"
            :items="users"
            multiple
            v-model="selectedUsers"
          ></v-select>
          <div style="margin-top: 1.7rem">
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
              class="mt-3"
              variant="text"
              @click="showForm = false"
            ></v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
