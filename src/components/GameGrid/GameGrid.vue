<script setup lang="ts">
import type { State } from "@/stores/store";

const props = defineProps<{
  columnsCount: number;
  rowsCount: number;
  guesses: State["guesses"];
}>();
</script>

<template>
  <div
    class="gameGrid"
    :style="`--columnsCount: ${columnsCount}; --rowsCount: ${rowsCount}`"
  >
    <div class="gameGrid__grid">
      <div v-for="rowIndex in rowsCount" :key="rowIndex" class="gameGrid__row">
        <div
          v-for="colIndex in columnsCount"
          :key="colIndex"
          :class="`gameGrid__cell ${
            guesses[rowIndex - 1]?.[colIndex - 1]?.status
              ? 'gameGrid__cell--' + guesses[rowIndex - 1][colIndex - 1].status
              : ''
          }`"
        >
          <template v-if="guesses[rowIndex - 1]?.[colIndex - 1]">
            {{ guesses[rowIndex - 1][colIndex - 1].letter }}
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./GameGrid.scss" lang="scss"></style>
