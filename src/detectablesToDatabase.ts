import { Database } from "bun:sqlite";
import { insertDetectable, type Detectable } from "./database";

const url = "https://discord.com/api/v9/games/detectable";

interface RawDetectable {
  id: string;
  icon_hash: string;
  name: string;
}

const main = async () => {
  console.log("Fetching...");
  const data = (await fetch(url).then((res) => res.json())) as RawDetectable[];

  console.log("Inserting...");
  for (let i = 0; i < data.length; i++) {
    const detectable = data[i]!;
    if (!detectable.name || !detectable.icon_hash) continue;
    insertDetectable({
      icon: detectable.icon_hash,
      id: detectable.id,
      name: detectable.name,
    });
  }
  console.log("done");
};

main();
