<!--suppress JSUnusedAssignment -->
<script lang="ts">
  import { Avatar, Button, Icon, ListItem } from "svelte-materialify";
  import { mdiDelete } from "@mdi/js";
  import { deleteMod } from "../../../shared";
  import type { ModSingle } from "../../../../types/global.interfaces";

  export let mod: ModSingle;
  export let uuid: string;
  $: src = mod.icon !== "data:" ? mod.icon : "logo.png";
</script>

<ListItem>
  <span slot="prepend">
    <Avatar size="80px">
      <img alt="" class="icon" {src} />
    </Avatar>
  </span>
  {mod.metadata.name}
  <div slot="subtitle">
    <div>{mod.metadata.description}</div>
    <div>מאת: {mod.metadata.author}</div>
  </div>
  <span slot="append">
    <Button icon on:click={() => deleteMod(uuid)}>
      <Icon path={mdiDelete} />
    </Button>
  </span>
</ListItem>

<style lang="scss">
  .icon {
    object-fit: contain;
  }
</style>
