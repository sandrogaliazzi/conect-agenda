<script setup>
import { computed } from "vue";

const { data } = defineProps(["data"]);

const history = computed(() => [...data].reverse());

const drawer = defineModel();
</script>

<template>
  <v-navigation-drawer v-model="drawer" location="right" temporary width="450">
    <v-list>
      <v-list-item
        v-for="(log, i) in history"
        :key="i"
        :title="`Usuário: ${log.user}`"
        :value="log.log"
        :subtitle="log.log"
        lines="three"
        prepend-icon="mdi-history"
      >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
