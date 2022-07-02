import * as fs from "fs-extra";
import * as path from "path";
import { contextBridge } from "electron";
import type { Unzipped } from "fflate";
import { getIconDataUrl, pathContent, pathIcon } from "../../shared";
import type { ModMetadata, Mods } from "../../../types/global.interfaces";

const pathModsFile = "data/data.mods";

function getPath(pathRelative: string): string {
  return path.join(__dirname, pathRelative);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getModsJson() {
  const path = getPath(pathModsFile);
  return fs.existsSync(path) ? fs.readJsonSync(path) : {};
}

async function getIcon({ uuid }: { uuid: string }): Promise<string> {
  const path = getPath(`${pathIcon}/${uuid}.jpg`);
  const iconData = fs.existsSync(path) ? fs.readFileSync(path) : new Buffer(0);
  return getIconDataUrl(Buffer.from(iconData));
}

contextBridge.exposeInMainWorld("api", {
  async loadMods(): Promise<Mods> {
    const modsJson = getModsJson();
    const mods: Mods = {};
    for (const uuid in modsJson) {
      const mod: ModMetadata = modsJson[uuid];
      mods[uuid] = {
        icon: await getIcon({ uuid }),
        metadata: mod
      };
    }
    return mods;
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
      try {
        const data = fileEntries[pathCurrent];
        const pathFull = getPath(pathCurrent);
        fs.outputFileSync(pathFull, Buffer.from(data));
        filenames.push(pathCurrent.replace(pathContent, ""));
      } catch (e) {
        return e.message;
      }
    }

    // Add as entry to data.mods
    let modsFileContent;
    try {
      modsFileContent = getModsJson();
    } catch (e) {
      return e.message;
    }
    const modsJson = {
      ...modsFileContent,
      [uuid]: {
        ...metadata,
        files: filenames
      }
    };
    fs.outputJsonSync(getPath(pathModsFile), modsJson);
    return true;
  },
  deleteMod(uuid: string): boolean | string {
    // Fetch mod files list by UUID
    const modsJson = getModsJson();

    // Delete mod files
    for (const file of modsJson[uuid].files) {
      try {
        fs.removeSync(path.join(__dirname, `content/${file}`));
      } catch (e) {
        return e.message;
      }
    }

    fs.removeSync(getPath(`icons/${uuid}.jpg`));

    delete modsJson[uuid];
    fs.outputJsonSync(getPath(pathModsFile), modsJson);

    return true;
  }
});
