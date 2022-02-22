<script setup lang="ts">
import { useStore } from "@/stores/store";
import { onMounted } from "vue";
import Keyboard from "@/components/Keyboard/Keyboard.vue";
import GameGrid from "@/components/GameGrid/GameGrid.vue";

const { dispatch } = useStore();

onMounted(async () => {
  await dispatch("restartGame");
});
</script>

<template>
  <GameGrid class="home__gameGrid" />
  <Keyboard class="home__keyboard" />
</template>

<style src="./Home.scss" lang="scss" />
