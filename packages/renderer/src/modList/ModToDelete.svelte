<script lang="ts">
  import { Button, Icon } from "svelte-materialify";
  import { mdiDelete } from "@mdi/js";
  import { deleteMod, mods } from "../../../shared";

  export let uuid: string;
</script>

<Button icon on:click={() => deleteMod(uuid)}>
  <Icon path={mdiDelete} />
</Button>

{$mods[uuid]?.metadata.name}
