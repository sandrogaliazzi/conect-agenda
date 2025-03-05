<script setup>
import { ref } from "vue";
import Cards from "./Cards.vue";
import CardForm from "./CardForm.vue";
import draggble from "vuedraggable";

const { data } = defineProps(["data"]);

const hoveringOn = ref(null);
const panelClick = ref(null);

const updateFirestore = () => {};

const handleDraggOperation = (event) => {
  console.log(event.moved.element);
  console.log(data);
};
</script>

<template>
  <v-card
    v-for="panel in data"
    :key="panel.panel_id"
    min-width="300px"
    :title="panel.title"
    rounded="lg"
    @mouseenter="hoveringOn = panel.panel_id"
    @mouseleave="hoveringOn = null"
  >
    <template #append>
      <v-icon
        v-show="hoveringOn === panel.panel_id"
        @click="console.log('teste')"
      >
        mdi-dots-vertical
      </v-icon>
    </template>

    <v-card-text>
      <draggble
        v-model="panel.cards"
        :item-key="panel.panel_id"
        group="cards"
        @change="handleDraggOperation"
      >
        <template #item="{ element: card }">
          <Cards :data="card" />
        </template>
      </draggble>
      <CardForm
        class="mt-4"
        v-if="panelClick === panel.panel_id"
        @close-form="panelClick = null"
      />
    </v-card-text>

    <v-card-actions>
      <v-btn prepend-icon="mdi-plus" block @click="panelClick = panel.panel_id">
        Adicionar cartão
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
