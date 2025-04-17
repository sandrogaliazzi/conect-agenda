<script setup>
import { ref } from "vue";
import Cards from "./Cards.vue";
import CardForm from "./CardForm.vue";
import PanelActions from "./PanelActions.vue";
import draggable from "vuedraggable";

const props = defineProps({
  panel: Object,
  panelForm: [String, null],
  title: String,
  userName: String,
  refreshTags: Number,
});

const emit = defineEmits([
  "submit",
  "panel-form",
  "title-edit",
  "show-history",
  "delete-panel",
]);

const panelClick = ref(null);
</script>

<template>
  <div>
    <v-card :disabled="panel.lock" width="300px" rounded="xl">
      <template #append>
        <PanelActions
          :panel="panel"
          @show-history="() => emit('show-history', panel)"
          @block-panel="
            () => emit('submit', { panelId: panel.panel_id }, 'blockPanel')
          "
          @edit-title="() => emit('panel-form', panel)"
          @duplicate="() => emit('submit', panel, 'duplicate')"
          @delete-panel="() => emit('delete-panel', panel.id)"
        />
      </template>

      <template #title>
        <p
          v-if="panelForm !== panel.panel_id"
          @click="emit('panel-form', panel)"
          class="text-line"
        >
          {{ panel.title }}
        </p>
        <v-form v-else @submit.prevent="emit('title-edit', panel)">
          <v-text-field
            autofocus
            v-model="props.title"
            variant="underlined"
            @blur="emit('panel-form', null)"
          />
        </v-form>
      </template>

      <v-card-text style="max-height: 600px; overflow-y: auto">
        <draggable
          v-if="panel.cards"
          v-model="panel.cards"
          item-key="id"
          group="cards"
          :animation="300"
          @change="(e) => emit('submit', e, 'drag')"
        >
          <template #item="{ element: card }">
            <Cards
              :data="card"
              :panel="panel.panel_id"
              @update-card="(card) => emit('submit', card, 'updateCard')"
              @delete-card="(card) => emit('submit', card, 'deleteCard')"
              @update-tags="(card) => emit('submit', card, 'updateTags')"
              :key="refreshTags"
            />
          </template>
        </draggable>

        <CardForm
          class="mt-4"
          v-if="panelClick === panel.panel_id"
          :panel="panelClick"
          @close-form="panelClick = null"
          @submit-form="(formData) => emit('submit', formData, 'createCard')"
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

    <!-- Bloqueio -->
    <v-btn
      block
      rounded
      variant="plain"
      text="desbloquear"
      prepend-icon="mdi-unlock"
      @click="emit('submit', { panelId: panel.panel_id }, 'blockPanel')"
      v-if="panel.lock && panel.userLock === userName"
    />
    <v-btn
      block
      rounded
      variant="plain"
      prepend-icon="mdi-lock"
      v-else-if="panel.userLock && userName !== panel.userLock"
    >
      Bloqueado por {{ panel.userLock }}
    </v-btn>
  </div>
</template>

<style scoped>
.text-line {
  font-size: 14px;
  text-wrap: wrap;
  font-weight: 400;
}
</style>
