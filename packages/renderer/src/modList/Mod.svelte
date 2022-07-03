<script lang="ts">
  import { Avatar, Button, Checkbox, Icon, ListItem } from "svelte-materialify";
  import { mdiDelete } from "@mdi/js";
  import {
    deleteMod,
    errorMessage,
    filesInUse,
    getModFilesToUuids,
    modCollisions,
    modsOff,
    modsOn,
    UUID_FIXED
  } from "../../../shared";
  import { createEventDispatcher } from "svelte";
  import { getCollidingModIds } from "../dropzone/is-mod-installable";
  import { v5 as UUID } from "uuid";
  import type { ModSingle } from "../../../../types/global.interfaces";
  import "./Mod.scss";

  export let mod: ModSingle;
  // noinspection JSUnusedAssignment
  export let uuid = UUID(mod.metadata.name, UUID_FIXED);

  let isShowError = false;
  $: isModEnabled = Boolean($modsOn[uuid]);
  $: src = mod?.icon !== "data:" ? mod?.icon : "logo.png";
  $: if ($modsOff[uuid]) {
    isShowError = false;
    $errorMessage = "";
  }

  const dispatch = createEventDispatcher();

  function enableMod(uuid): void {
    const modDisabled = $modsOff[uuid] || ({} as ModSingle);
    $modsOn[uuid] = { ...modDisabled };

    delete $modsOff[uuid];
    $modsOff = $modsOff;

    $filesInUse = getModFilesToUuids();
    dispatch("enabledMod", uuid);

    window.api.enableMod(uuid);
  }

  function disableMod(uuid): void {
    const modEnabled = $modsOn[uuid] || ({} as ModSingle);
    $modsOff[uuid] = { ...modEnabled };

    delete $modsOn[uuid];
    $modsOn = $modsOn;

    for (const file in $filesInUse) {
      $modCollisions.delete(uuid);
      delete $filesInUse[file];
    }
    $modCollisions = $modCollisions;

    dispatch("disabledMod", uuid);

    window.api.disableMod(uuid);
  }

  function enableModIfNotColliding(e: Event, uuid: string): void {
    const collidingModIds = getCollidingModIds($modsOff[uuid].metadata.files);
    const elCheckbox = e.target as HTMLInputElement;
    if (collidingModIds.size === 0) {
      enableMod(uuid);
      elCheckbox.checked = true;
      isShowError = false;
      return;
    }
    for (const uuid of collidingModIds) {
      $modCollisions.add(uuid);
    }
    $modCollisions = new Set($modCollisions);

    dispatch("collidingMod", $modsOff[uuid].metadata.name);
    elCheckbox.checked = false;
    isShowError = true;

    $errorMessage = "התנגשות";
  }
</script>

<ListItem>
  <span class="d-flex" slot="prepend">
    <Checkbox
      checked={isModEnabled}
      color={isShowError ? "error" : "secondary"}
      on:change={e => (e.target.checked ? enableModIfNotColliding(e, uuid) : disableMod(uuid))}
    />
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
