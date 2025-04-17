<script setup>
import { ref, onMounted, watch, computed } from "vue";
import {
  getFirestoreCollectionDocs,
  deleteFirestoreDoc,
  getDocumentsByAgendaId,
} from "@/firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";
import firestore from "@/firebase";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import { useAuth } from "@/composables/auth";
import { useLogout } from "@/composables/logout";
import AgendaForm from "./AgendaForm.vue";

const { user } = useAuth();
const { logout } = useLogout();

const store = useAppStore();
const { selectedAgenda, blueprints } = storeToRefs(store);

const drawer = ref(false);
const agendas = ref([]);
const showForm = ref(false);
const settingsSelection = ref([]);
const selectAgenda = ref({
  title: "",
  id: "",
  users: [],
});

const filteredAgendas = computed(() =>
  agendas.value.filter((agenda) => {
    const userName = user.value.email.split("@")[0];
    return !agenda.is_blue_print && agenda.users.includes(userName);
  })
);

const getAgendas = async () =>
  (agendas.value = await getFirestoreCollectionDocs("agendas"));

const agendaColletion = collection(firestore, "agendas");

const unsub = onSnapshot(agendaColletion, (_) => {
  getAgendas();
});

onMounted(() => {
  getAgendas();
});

const editAgenda = (agenda) => {
  selectAgenda.value = agenda;
  showForm.value = true;
  console.log(agenda);
};

const deleteAgenda = async (agenda) => {
  await deleteFirestoreDoc(agenda.id, "agendas");

  const agendaDocs = await getDocumentsByAgendaId(agenda.id);

  await Promise.all(
    agendaDocs.map(
      async (doc) => await deleteFirestoreDoc(doc.id, "services", true)
    )
  );

  await getAgendas();
  store.setAgendas().then((a) => store.setAgenda(a));
};

watch(selectedAgenda, () => getAgendas());

watch(showForm, (val) => {
  if (!val) {
    selectAgenda.value = {
      title: "",
      id: "",
      users: [],
    };
  }
});

const selectNewAgenda = (agenda) => {
  store.setAgenda(agenda);
};
</script>

<template>
  <v-app-bar :elevation="0" color="indigo-darken-4">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"> </v-app-bar-nav-icon>
    </template>
    <v-app-bar-title> {{ selectedAgenda.title }}</v-app-bar-title>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" location="left" temporary>
    <template #append>
      <v-btn
        block
        rounded
        variant="plain"
        prepend-icon="mdi-logout"
        text="logout"
        class="mb-5"
        @click="logout"
      ></v-btn>
    </template>
    <v-list>
      <v-list-item
        prepend-icon="mdi-account"
        :subtitle="user.email"
        :title="user.email.split('@')[0]"
      ></v-list-item>
    </v-list>
    <v-divider></v-divider>
    <div class="ma-4">
      <v-btn
        block
        rounded
        variant="plain"
        prepend-icon="mdi-plus"
        text="nova agenda"
        @click="showForm = true"
        class="mt-3"
        v-user="['marcelo', 'tainan', 'sandro', 'leonardo']"
      ></v-btn>
    </div>
    <v-list>
      <v-list-subheader>Agendas</v-list-subheader>
      <v-list-item
        v-for="agenda in filteredAgendas"
        :key="agenda.id"
        :title="agenda.title"
        :value="agenda.id"
        prepend-icon="mdi-view-agenda"
        color="primary"
        nav
        @click="selectNewAgenda(agenda)"
      >
        <template v-slot:append>
          <v-btn
            size="small"
            variant="text"
            v-user="['marcelo', 'sandro', 'tainan', 'leonardo']"
          >
            <v-icon>mdi-dots-horizontal</v-icon>
            <v-menu activator="parent">
              <v-list nav>
                <v-list-item>
                  <v-btn
                    prepend-icon="mdi-pencil"
                    variant="plain"
                    text="editar"
                    @click="editAgenda(agenda)"
                  ></v-btn>
                </v-list-item>
                <v-list-item>
                  <v-btn
                    prepend-icon="mdi-delete"
                    variant="plain"
                    text="excluir"
                    @click="deleteAgenda(agenda)"
                  ></v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list>
      <v-list-subheader>Modelos</v-list-subheader>
      <v-list-item
        v-for="agenda in blueprints"
        :key="agenda.id"
        :title="agenda.title"
        :value="agenda.id"
        prepend-icon="mdi-content-copy"
        color="primary"
        nav
        v-user="['marcelo', 'tainan', 'sandro', 'leonardo']"
        @click="selectNewAgenda(agenda)"
      >
      </v-list-item>
    </v-list>
    <AgendaForm v-model="showForm" :agenda="selectAgenda" />
  </v-navigation-drawer>
</template>
