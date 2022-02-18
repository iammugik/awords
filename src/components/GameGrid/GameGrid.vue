<script setup lang="ts">
import type { State } from "@/stores/store";

const props = defineProps<{
  gridSize: [number, number];
  grid: State["letters"];
}>();
</script>

<template>
  <div
    class="gameGrid"
    :style="`--columnsCount: ${gridSize[0]}; --rowsCount: ${gridSize[1]}`"
  >
    <div class="gameGrid__grid">
      <div
        v-for="num in gridSize[0] * gridSize[1]"
        :key="num"
        :class="`gameGrid__cell ${
          grid[num - 1]?.status ? 'gameGrid__cell--' + grid[num - 1].status : ''
        }`"
      >
        {{ grid[num - 1] ? grid[num - 1].letter : "" }}
      </div>
    </div>
  </div>
</template>

<style src="./GameGrid.scss" lang="scss"></style>
