<script setup>
import { ref, watch, computed } from "vue";
import {
  getFirestoreCollectionDocs,
  createFirestoreDoc,
  updateFirestoreDoc,
} from "@/firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";
import firestore from "@/firebase";
import TagCreator from "./TagCreator.vue";
import { useAppStore } from "@/stores/app";
const store = useAppStore();

const dialog = ref(false);
const tags = ref([]);
const tagSelection = ref([]);
const selectedTag = ref({
  label: "",
  color: "",
});
const query = ref("");

const filterResults = computed(() => {
  return tags.value.filter((t) => t.label.includes(query.value));
});

const emit = defineEmits(["tagSelection"]);

const myBtn = ref(null);

const tagsCollection = collection(firestore, "tags");

const getFirestoreTags = async () => {
  tags.value = await getFirestoreCollectionDocs("tags");
};

const unsub = onSnapshot(tagsCollection, (querySnapshot) => {
  querySnapshot.docChanges().forEach((_) => {
    getFirestoreTags();
  });
});

watch(selectedTag, () => {
  if (myBtn.value) {
    myBtn.value.$el.click();
  }
});

watch(tagSelection, () => {
  emit("tagSelection", tagSelection.value);
});

const saveNewTag = async (tag) => {
  if (tag.id) {
    await updateFirestoreDoc(tag.id, tag, "tags");
    store.setUpdate(true);
  } else await createFirestoreDoc(tag, "tags");
};
</script>

<template>
  <v-dialog width="auto" scrollable>
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn
        icon="mdi-plus"
        variant="plain"
        size="x-small"
        v-bind="activatorProps"
      ></v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card prepend-icon="mdi-label" title="Adicionar Tag" rounded="xl">
        <v-divider class="mt-3"></v-divider>

        <v-card-text class="px-4" style="height: 400px" v-if="tags.length > 0">
          <v-text-field
            variant="underlined"
            append-icon="mdi-magnify"
            placeholder="procurar"
            v-model="query"
          ></v-text-field>
          <div
            class="d-flex align-center ga-1"
            v-for="tag in filterResults || tags"
            :key="tag.label"
          >
            <v-checkbox-btn :value="tag" v-model="tagSelection">
              <template #label>
                <v-sheet
                  :height="30"
                  :width="300"
                  rounded="lg"
                  :color="tag.color"
                  class="my-2 d-flex justify-start align-center ga-2"
                >
                  <v-icon size="x-small" class="ml-2">mdi-label</v-icon>
                  <p class="text-body-2">{{ tag.label.toUpperCase() }}</p>
                </v-sheet>
              </template>
            </v-checkbox-btn>

            <v-btn
              icon="mdi-pencil"
              variant="plain"
              size="x-small"
              @click="selectedTag = tag"
            ></v-btn>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn text="Fechar" @click="isActive.value = false"></v-btn>

          <v-spacer></v-spacer>

          <v-btn
            color="surface-variant"
            text="Criar Nova"
            @click="dialog = true"
            variant="flat"
            ref="myBtn"
          >
          </v-btn>

          <v-btn
            color="primary"
            text="Salvar"
            @click="isActive.value = false"
            variant="flat"
          >
          </v-btn>

          <TagCreator
            :tag="selectedTag"
            v-model="dialog"
            @new-tag-added="(tag) => saveNewTag(tag)"
          />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
