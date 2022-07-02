<script lang="ts">
  import { Button, ExpansionPanel, ExpansionPanels, Icon, ListItem } from "svelte-materialify";
  import { mdiDelete } from "@mdi/js";
  import { deleteMod, modCollisions } from "../../../shared";
  import ModToDelete from "./ModToDelete.svelte";

  export let lastModInstalled = "";

  function deleteCollidingMods(): void {
    for (const uuid of $modCollisions) {
      deleteMod(uuid);
    }
  }
</script>

<ExpansionPanels disabled value={$modCollisions.length > 0 ? [0] : []}>
  <ExpansionPanel>
    {#if $modCollisions.length > 0}
      <article class="collisions-list-container">
        <section class="text-body">ישנה התנגשות בין המוד "{lastModInstalled}" והמודים:</section>
        <section class="collisions-list">
          {#each $modCollisions as uuid}
            <ListItem class="list-item-mod-to-delete">
              <ModToDelete {uuid} />
            </ListItem>
          {/each}
        </section>
        <Button class="btn-delete-collisions" on:click={deleteCollidingMods}>
          <Icon path={mdiDelete} />
          מחק התנגשויות
        </Button>
      </article>
    {/if}
  </ExpansionPanel>
</ExpansionPanels>

<style lang="scss">
  :global(.s-expansion-panels) {
    position: sticky;
    bottom: 0;
  }

  :global(.btn-delete-collisions > .s-btn__content) {
    letter-spacing: 0.06em;
  }

  :global(.s-expansion-panel) {
    color: var(--theme-text-primary) !important;
  }

  .collisions-list-container {
    flex: 1;
  }

  .collisions-list {
    overflow-y: scroll;
    max-height: 100px;
    margin-bottom: 10px;
  }

  :global(.list-item-mod-to-delete > .s-list-item__content) {
    padding: 0;
  }
</style>
