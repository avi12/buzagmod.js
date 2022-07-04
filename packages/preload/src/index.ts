import * as fs from "fs-extra";
import * as path from "path";
import { contextBridge } from "electron";
import type { Unzipped } from "fflate";
import { getIconDataUrl, Paths } from "../../shared";
import type { ModMetadata, Mods } from "../../../types/global.interfaces";

enum PathModsFile {
  enabled = "data/data.mods",
  disabled = "data/disabled-mods.json"
}

function getPath(pathRelative: string): string {
  return path.join(__dirname, pathRelative);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getModsJson(type: PathModsFile) {
  const pathAbsolute = getPath(type);
  try {
    return fs.readJsonSync(pathAbsolute);
  } catch {
    return {};
  }
}

async function getIcon({ uuid }: { uuid: string }): Promise<string> {
  const path = getPath(`${Paths.icon}/${uuid}.jpg`);
  const iconData = fs.existsSync(path) ? fs.readFileSync(path) : new Buffer(0);
  return getIconDataUrl(Buffer.from(iconData));
}

contextBridge.exposeInMainWorld("api", {
  async loadMods(): Promise<{ modsEnabled: Mods; modsDisabled: Mods }> {
    const jsonModsEnabled = getModsJson(PathModsFile.enabled);
    const jsonModsDisabled = getModsJson(PathModsFile.disabled);
    const modsEnabled: Mods = {};
    const modsDisabled: Mods = {};

    for (const uuid in jsonModsEnabled) {
      modsEnabled[uuid] = {
        icon: await getIcon({ uuid }),
        metadata: jsonModsEnabled[uuid] as ModMetadata
      };
    }

    for (const uuid in jsonModsDisabled) {
      modsDisabled[uuid] = {
        icon: await getIcon({ uuid }),
        metadata: jsonModsDisabled[uuid] as ModMetadata
      };
    }
    return { modsEnabled, modsDisabled };
  },
  addMod({
    fileEntries,
    uuid,
    metadata
  }: {
    fileEntries: Unzipped;
    uuid: string;
    metadata: ModMetadata;
  }): boolean | string {
    const filenames: string[] = [];

    // Create all the files
    for (const pathCurrent in fileEntries) {
      const data = fileEntries[pathCurrent];
      const pathFull = getPath(pathCurrent);
      fs.outputFileSync(pathFull, Buffer.from(data));
      filenames.push(pathCurrent.replace(Paths.content, ""));
    }

    // Add as entry to data.mods
    const modsFileContent = getModsJson(PathModsFile.enabled);
    const modsJson = {
      ...modsFileContent,
      [uuid]: {
        ...metadata,
        files: filenames
      }
    };
    fs.outputJsonSync(getPath(PathModsFile.enabled), modsJson);
    return true;
  },
  deleteMod(uuid: string): boolean | string {
    // Fetch mod files list by UUID
    const jsonModsEnabled = getModsJson(PathModsFile.enabled);
    const jsonModsDisabled = getModsJson(PathModsFile.disabled);

    const deleteFiles = (jsonMods: Mods): void => {
      // Delete mod files
      // @ts-ignore
      for (const file of jsonMods[uuid].files) {
        fs.removeSync(path.join(__dirname, Paths.content, file));
      }
    };

    if (jsonModsDisabled[uuid]) {
      deleteFiles(jsonModsDisabled);
      delete jsonModsDisabled[uuid];
      fs.outputJsonSync(getPath(PathModsFile.disabled), jsonModsDisabled);
      return true;
    }

    fs.removeSync(getPath(`icons/${uuid}.jpg`));

    deleteFiles(jsonModsEnabled);
    delete jsonModsEnabled[uuid];
    fs.outputJsonSync(getPath(PathModsFile.enabled), jsonModsEnabled);

    return true;
  },
  enableMod(uuid: string): boolean {
    const jsonModsEnabled = getModsJson(PathModsFile.enabled);
    const jsonModsDisabled = getModsJson(PathModsFile.disabled);
    jsonModsEnabled[uuid] = { ...jsonModsDisabled[uuid] };
    delete jsonModsDisabled[uuid];
    fs.outputJsonSync(getPath(PathModsFile.enabled), jsonModsEnabled);
    fs.outputJsonSync(getPath(PathModsFile.disabled), jsonModsDisabled);
    return true;
  },
  disableMod(uuid: string): boolean {
    const jsonModsEnabled = getModsJson(PathModsFile.enabled);
    const jsonModsDisabled = getModsJson(PathModsFile.disabled);
    jsonModsDisabled[uuid] = { ...jsonModsEnabled[uuid] };
    delete jsonModsEnabled[uuid];
    fs.outputJsonSync(getPath(PathModsFile.enabled), jsonModsEnabled);
    fs.outputJsonSync(getPath(PathModsFile.disabled), jsonModsDisabled);
    return true;
  }
});
