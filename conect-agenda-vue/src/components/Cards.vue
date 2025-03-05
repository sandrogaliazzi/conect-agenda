<script setup>
const { data } = defineProps(["data"]);

const colors = ["primary", "secondary", "red", "green", "indigo", "orange"];
</script>

<template>
  <v-card color="grey-darken-3 mt-3">
    <v-card-title class="d-flex justify-space-between">
      <template class="d-flex flex-wrap">
        <v-chip
          v-for="tag in data.tags"
          :key="tag"
          :color="colors[Math.floor(Math.random() * 7)]"
          class="ma-2"
          label
          size="small"
          variant="flat"
        >
          <v-icon icon="mdi-label" start></v-icon>
          {{ tag }}</v-chip
        >
        <v-btn icon="mdi-plus" variant="plain" size="x-small" />
      </template>
    </v-card-title>
    <v-card-text>
      {{ data.card_content }}
    </v-card-text>
  </v-card>
</template>
