<script setup lang="ts">
import { GameStatus, useStore } from "@/stores/store";
import { ref, watch, computed, onMounted } from "vue";
import Keyboard from "@/components/Keyboard/Keyboard.vue";
import GameGrid from "@/components/GameGrid/GameGrid.vue";

const { state, dispatch } = useStore();

const handleKeyClick = async (key: string) => {
  if (key === "backspace") {
    await dispatch("deleteLetter");
    return;
  }
  await dispatch("addLetter", key);
};

onMounted(async () => {
  await dispatch("restartGame");
});
</script>

<template>
  <div v-if="state.status === GameStatus.INIT">Загрузка...</div>
  <template v-else>
    <div class="home__gameGrid">
      <GameGrid
        :grid="state.letters"
        :grid-size="[state.wordLength, state.rowsCount]"
      />
    </div>
    <Keyboard class="home__keyboard" :onKeyClick="handleKeyClick" />
  </template>
</template>

<style src="./Home.scss" lang="scss" />
