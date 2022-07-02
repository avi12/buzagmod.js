<script lang="ts">
  import { AppBar, Button, Dialog, ExpansionPanel, ExpansionPanels, Icon, ListItem, Tooltip } from "svelte-materialify";
  import { fade } from "svelte/transition";
  import { mdiDelete, mdiPlus } from "@mdi/js";
  import { errorMessage, filesInUse, modCollisions, mods } from "../../../shared";
  import { delay, duration } from "../core/transition-utils";
  import Mod from "./Mod.svelte";
  import ModToDelete from "./ModToDelete.svelte";
  import Dropzone from "../dropzone/Dropzone.svelte";

  let isShowDropzone = false;
  let lastModInstalled = "";

  function onAddedMod(e): void {
    const modNew = e.detail;
    $mods = { ...$mods, ...modNew };
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
    for (const modId in $mods) {
      window.api.deleteMod(modId);
    }

    $mods = {};
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
        <Button icon on:click={deleteAllMods}>
          <Icon path={mdiDelete} />
        </Button>
        <span slot="tip">מחק את כל המודים</span>
      </Tooltip>
    </div>
  </AppBar>

  {#each Object.entries($mods) as [uuid, mod]}
    <Mod {uuid} {mod} />
  {/each}
</article>

<ExpansionPanels disabled value={$modCollisions.length > 0 ? [0] : []}>
  <ExpansionPanel>
    <article>
      {#if $modCollisions.length > 0}
        <section class="text-body">ישנה התנגשות בין המוד "{lastModInstalled}" והמודים:</section>
        {#each $modCollisions as uuid}
          <ListItem>
            <ModToDelete {uuid} />
          </ListItem>
        {/each}
      {/if}
    </article>
  </ExpansionPanel>
</ExpansionPanels>

<Dialog bind:active={isShowDropzone} class="pa-4">
  <Dropzone on:addedMod={onAddedMod} on:error={onError} />
</Dialog>

<style lang="scss">
  :global(.s-list-item [slot="prepend"] .s-avatar) {
    margin-inline-end: 16px;
    margin-right: 0 !important;
  }

  :global(.s-app-bar__title) {
    padding-inline-start: 16px;
    padding-left: 0 !important;
  }

  .header-icon-container {
    flex: 0;
    margin-inline-end: 12px;
  }

  :global(.s-dialog__content) {
    width: 50%;
    height: 70%;
    outline: 1px solid gray;
  }

  :global(.theme--dark .s-dialog__content) {
    outline: 1px solid gray;
  }

  :global(.s-expansion-panels) {
    position: fixed !important;
    bottom: 0;
  }

  :global(.s-expansion-panel) {
    color: var(--theme-text-primary) !important;
  }
</style>
