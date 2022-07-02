<script lang="ts">
  import { AppBar, Button, Dialog, Icon, Tooltip } from "svelte-materialify";
  import { fade } from "svelte/transition";
  import { mdiDelete, mdiPlus } from "@mdi/js";
  import { errorMessage, filesInUse, modCollisions, modsOff, modsOn } from "../../../shared";
  import { delay, duration } from "../core/transition-utils";
  import Mod from "./Mod.svelte";
  import Dropzone from "../dropzone/Dropzone.svelte";
  import { theme } from "../core/dark-mode";
  import ModCollisions from "./ModCollisions.svelte";
  import { flip } from "svelte/animate";
  import "./ModList.svelte";

  let isShowDropzone = false;
  let lastModInstalled = "";

  function onAddedMod(e): void {
    const modNew = e.detail;
    $modsOn = { ...$modsOn, ...modNew };
    const [uuid] = Object.keys(modNew);
    for (const file of modNew[uuid].metadata.files) {
      $filesInUse[file] = uuid;
    }
    isShowDropzone = false;
  }

  function onError(e): void {
    lastModInstalled = e.detail;
    if ($modCollisions.length > 0) {
      isShowDropzone = false;
      $errorMessage = "";
    }
  }

  function deleteAllMods(): void {
    for (const modId in $modsOn) {
      window.api.deleteMod(modId);
    }

    $modsOn = {};
    $modsOff = {};
    $modCollisions = [];
    $errorMessage = "";
    $filesInUse = {};
  }
</script>

<article in:fade|local={{ delay, duration }} out:fade={{ duration }}>
  <AppBar class="secondary-color theme--dark">
    <span class="flex-grow-1 text-h6">רשימת מודים</span>
    <div class="header-icon-container d-flex">
      <Tooltip active={false} bottom>
        <Button icon on:click={() => (isShowDropzone = !isShowDropzone)}>
          <Icon path={mdiPlus} />
        </Button>
        <span slot="tip">הוסף מוד</span>
      </Tooltip>
      <Tooltip active={false} bottom>
        <Button icon on:click={deleteAllMods} outlined={$theme === "dark"}>
          <Icon path={mdiDelete} />
        </Button>
        <span slot="tip">מחק את כל המודים</span>
      </Tooltip>
    </div>
  </AppBar>

  {#each Object.entries($modsOn) as [uuid, mod], i(uuid)}
    <div animate:flip>
      <Mod {uuid} {mod} />
    </div>
  {/each}

  {#each Object.entries($modsOff) as [uuid, mod], i(uuid)}
    <div animate:flip>
      <Mod {uuid} {mod} />
    </div>
  {/each}
</article>

<ModCollisions {lastModInstalled} />

<Dialog bind:active={isShowDropzone} class="pa-4">
  <Dropzone on:addedMod={onAddedMod} on:error={onError} />
</Dialog>

<style lang="scss">
  .header-icon-container {
    flex: 0;
    margin-inline-end: 12px;
  }
</style>
