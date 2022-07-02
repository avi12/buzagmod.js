import { filesInUse, getModFilesToUuids, mods } from "../../shared";
import App from "./App.svelte";

async function main(): Promise<void> {
  mods.set(await window.api.loadMods());
  filesInUse.set(getModFilesToUuids());
  new App({ target: document.body });
}

main();
