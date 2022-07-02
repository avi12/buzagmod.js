<script lang="ts">
  import { Avatar, Button, Checkbox, Icon, ListItem } from "svelte-materialify";
  import { mdiDelete } from "@mdi/js";
  import { deleteMod, filesInUse, getModFilesToUuids, modCollisions, modsOff, modsOn } from "../../../shared";
  import { v4 as UUID } from "uuid";
  import type { ModSingle } from "../../../../types/global.interfaces";
  import "./Mod.scss";

  export let mod: ModSingle;
  export let uuid = UUID();

  $: isModEnabled = Boolean($modsOn[uuid]);
  $: src = mod?.icon !== "data:" ? mod?.icon : "logo.png";

  function enableMod(uuid): void {
    if (!window.api.enableMod(uuid)) {
      return;
    }

    const modDisabled = $modsOff[uuid] || ({} as ModSingle);
    $modsOn[uuid] = { ...modDisabled };

    delete $modsOff[uuid];
    $modsOff = $modsOff;

    $filesInUse = getModFilesToUuids();
  }

  function disableMod(uuid): void {
    if (!window.api.disableMod(uuid)) {
      return;
    }

    const modEnabled = $modsOn[uuid] || ({} as ModSingle);
    $modsOff[uuid] = { ...modEnabled };

    delete $modsOn[uuid];
    $modsOn = $modsOn;

    for (const uuidCurrent in $filesInUse) {
      if (uuidCurrent === uuid) {
        const file = $filesInUse[uuidCurrent];
        const iFile = $modCollisions.indexOf(file);
        if (iFile >= -1) {
          $modCollisions.splice(iFile, 1);
        }
        delete $filesInUse[uuid];
      }
    }
  }
</script>

<ListItem>
  <span class="d-flex" slot="prepend">
    <Checkbox checked={isModEnabled} on:change={e => (e.target.checked ? enableMod(uuid) : disableMod(uuid))} />
    <Avatar size="80px">
      <img alt="" class="icon" {src} />
    </Avatar>
  </span>
  {mod?.metadata.name}
  <div slot="subtitle">
    <div>{mod?.metadata.description}</div>
    <div>מאת: {mod?.metadata.author}</div>
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
