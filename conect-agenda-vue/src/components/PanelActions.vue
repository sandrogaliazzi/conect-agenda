<script setup>
const props = defineProps({
  panel: Object,
});

const emit = defineEmits([
  "show-history",
  "block-panel",
  "edit-title",
  "duplicate",
  "delete-panel",
]);
</script>

<template>
  <v-btn icon="mdi-dots-horizontal" variant="plain" size="small">
    <v-icon>mdi-dots-horizontal</v-icon>
    <v-menu activator="parent">
      <v-list>
        <v-list-item>
          <v-btn
            prepend-icon="mdi-history"
            variant="plain"
            size="small"
            text="Histórico"
            @click="emit('show-history')"
          />
        </v-list-item>

        <v-list-item>
          <v-btn
            prepend-icon="mdi-lock"
            variant="plain"
            size="small"
            text="Bloquear Lista"
            @click="emit('block-panel')"
          />
        </v-list-item>

        <v-list-item>
          <v-btn
            prepend-icon="mdi-pencil"
            variant="plain"
            size="small"
            text="Editar Título"
            @click="emit('edit-title')"
          />
        </v-list-item>

        <v-list-item>
          <v-btn
            prepend-icon="mdi-content-duplicate"
            variant="plain"
            size="small"
            text="Duplicar Lista"
            @click="emit('duplicate')"
          />
        </v-list-item>

        <v-list-item>
          <v-btn
            prepend-icon="mdi-delete"
            variant="plain"
            size="small"
            text="Excluir Lista"
            @click="emit('delete-panel')"
          />
        </v-list-item>
      </v-list>
    </v-menu>
  </v-btn>
</template>
