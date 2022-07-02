import { filesInUse, getModFilesToUuids, modsOn, modsOff } from "../../shared";
import App from "./App.svelte";

async function main(): Promise<void> {
  const { modsEnabled, modsDisabled } = await window.api.loadMods();
  modsOn.set(modsEnabled);
  modsOff.set(modsDisabled);
  filesInUse.set(getModFilesToUuids());
  new App({ target: document.body });
}

main();
