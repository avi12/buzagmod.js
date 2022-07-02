import type { Unzipped } from "fflate";

export type Mods = { [uuid: string]: ModSingle };

export interface ModSingle {
  files?: Unzipped;
  metadata: ModMetadata;
  icon: string;
}

export interface ModMetadata {
  md5: string;
  name: string;
  author: string;
  description: string;
  files: string[];
}

declare global {
  interface Window {
    api: {
      loadMods(): Promise<Mods>;
      addMod({
        fileEntries,
        uuid,
        metadata
      }: {
        fileEntries: Unzipped;
        uuid: string;
        metadata: Omit<ModMetadata, "icon" | "md5" | "files">;
      }): boolean | string;
      deleteMod(uuid: string): boolean | string;
    };
  }
}
