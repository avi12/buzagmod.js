<script lang="ts">
  import { MaterialApp } from "svelte-materialify";
  import { filesInUse, mods } from "../../shared";
  import { theme } from "./core/dark-mode";
  import Dropzone from "./dropzone/Dropzone.svelte";
  import ModList from "./modList/ModList.svelte";

  function onAddedMod(e): void {
    const modNew = e.detail;
    $mods = { ...$mods, ...modNew };
    const [uuid] = Object.keys(modNew);
    for (const file of modNew[uuid].metadata.files) {
      $filesInUse[file] = uuid;
    }
  }
</script>

<MaterialApp theme={$theme}>
  {#if Object.keys($mods).length === 0}
    <Dropzone on:addedMod={onAddedMod} />
  {:else}
    <ModList />
  {/if}
</MaterialApp>

<style lang="scss">
  :global(html) {
    height: unset !important;
  }

  :global(body::-webkit-scrollbar) {
    width: 0;
  }

  :global(.s-app) {
    direction: rtl;
    height: 100vh;
  }
</style>
