import { get, writable } from "svelte/store";
import { blobToDataUrl } from "@maruware/blob-to-base64";
import type { Mods } from "../types/global.interfaces";

export const modsOn = writable<Mods>({});
export const modsOff = writable<Mods>({});
export const errorMessage = writable("");
export const modCollisions = writable<string[]>([]);
export const filesInUse = writable<{ [filename: string]: string }>({});

export async function getIconDataUrl(data: Uint8Array): Promise<string> {
  return blobToDataUrl(new Blob([data]));
}

export const pathIcon = "icons";

export function getIconPath(uuid: string): string {
  return `${pathIcon}/${uuid}.jpg`;
}

export function getModFilesToUuids(): { [filename: string]: string } {
  const files: { [filename: string]: string } = {};
  const loadedMods = get(modsOn);
  for (const uuid in loadedMods) {
    for (const filename of loadedMods[uuid].metadata.files) {
      files[filename] = uuid;
    }
  }
  return files;
}

export async function deleteMod(uuid: string): Promise<void> {
  if (!window.api.deleteMod(uuid)) {
    return;
  }
  filesInUse.update(files => {
    for (const filename in files) {
      if (files[filename] === uuid) {
        delete files[filename];
      }
    }
    return files;
  });
  modsOn.update(mods => {
    delete mods[uuid];
    return mods;
  });
  modsOff.update(mods => {
    delete mods[uuid];
    return mods;
  });
  modCollisions.update(collisions => {
    const iModId = collisions.indexOf(uuid);
    if (iModId > -1) {
      collisions.splice(iModId, 1);
    }
    return collisions;
  });
}

export const pathContent = "content/";
export const regexAudio = /audio\/.+\.ogg/;
export const regexImage = /img\/.+\.png/;
export const regexIcon = new RegExp(`${pathIcon}/`);
export const regexSupportedFiles = new RegExp(
  `(?:^${pathContent}(?:${regexAudio.source}|${regexImage.source})$)|^${regexIcon.source}`
);
