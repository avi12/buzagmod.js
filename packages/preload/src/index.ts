import * as fs from "fs-extra";
import * as path from "path";
import { contextBridge } from "electron";
import type { Unzipped } from "fflate";
import { getIconDataUrl, pathContent, pathIcon } from "../../shared";
import type { ModMetadata, Mods } from "../../../types/global.interfaces";

const pathEnabledModsFile = "data/data.mods";
const pathDisabledModsFile = "data/disabled-mods.json";

function getPath(pathRelative: string): string {
  return path.join(__dirname, pathRelative);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getEnabledModsJson() {
  const path = getPath(pathEnabledModsFile);
  return fs.existsSync(path) ? fs.readJsonSync(path) : {};
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getDisabledModsJson() {
  const path = getPath(pathDisabledModsFile);
  return fs.existsSync(path) ? fs.readJsonSync(path) : {};
}

async function getIcon({ uuid }: { uuid: string }): Promise<string> {
  const path = getPath(`${pathIcon}/${uuid}.jpg`);
  const iconData = fs.existsSync(path) ? fs.readFileSync(path) : new Buffer(0);
  return getIconDataUrl(Buffer.from(iconData));
}

contextBridge.exposeInMainWorld("api", {
  async loadMods(): Promise<{ modsEnabled: Mods; modsDisabled: Mods }> {
    const jsonModsEnabled = getEnabledModsJson();
    const jsonModsDisabled = getDisabledModsJson();
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
      filenames.push(pathCurrent.replace(pathContent, ""));
    }

    // Add as entry to data.mods
    const modsFileContent = getEnabledModsJson();
    const modsJson = {
      ...modsFileContent,
      [uuid]: {
        ...metadata,
        files: filenames
      }
    };
    fs.outputJsonSync(getPath(pathEnabledModsFile), modsJson);
    return true;
  },
  deleteMod(uuid: string): boolean | string {
    // Fetch mod files list by UUID
    const jsonModsEnabled = getEnabledModsJson();
    const jsonModsDisabled = getDisabledModsJson();

    const deleteFiles = (jsonMods: Mods): void => {
      // Delete mod files
      // @ts-ignore
      for (const file of jsonMods[uuid].files) {
        fs.removeSync(path.join(__dirname, `content/${file}`));
      }
    };

    if (jsonModsDisabled[uuid]) {
      deleteFiles(jsonModsDisabled);
      delete jsonModsDisabled[uuid];
      fs.outputJsonSync(getPath(pathDisabledModsFile), jsonModsDisabled);
      return true;
    }

    fs.removeSync(getPath(`icons/${uuid}.jpg`));

    deleteFiles(jsonModsEnabled);
    delete jsonModsEnabled[uuid];
    fs.outputJsonSync(getPath(pathEnabledModsFile), jsonModsEnabled);

    return true;
  },
  enableMod(uuid: string): boolean {
    const jsonModsEnabled = getEnabledModsJson();
    const jsonModsDisabled = getDisabledModsJson();
    jsonModsEnabled[uuid] = { ...jsonModsDisabled[uuid] };
    delete jsonModsDisabled[uuid];
    fs.outputJsonSync(getPath(pathEnabledModsFile), jsonModsEnabled);
    fs.outputJsonSync(getPath(pathDisabledModsFile), jsonModsDisabled);
    return true;
  },
  disableMod(uuid: string): boolean {
    const jsonModsEnabled = getEnabledModsJson();
    const jsonModsDisabled = getDisabledModsJson();
    jsonModsDisabled[uuid] = { ...jsonModsEnabled[uuid] };
    delete jsonModsEnabled[uuid];
    fs.outputJsonSync(getPath(pathEnabledModsFile), jsonModsEnabled);
    fs.outputJsonSync(getPath(pathDisabledModsFile), jsonModsDisabled);
    return true;
  }
});
