import { Database } from "bun:sqlite";
import { insertDetectable, type Detectable } from "./database";

const url = "https://gitdab.com/Cynosphere/HiddenPhox/raw/branch/rewrite/data/games.json";


const main = async () => {
    console.log("Fetching...")
    const data = await fetch(url).then((res) => res.json()) as Detectable[];
    
    console.log("Inserting...")
    for (let i = 0; i < data.length; i++) {
        const detectable = data[i]!;
        if (!detectable.name || !detectable.icon) continue;
        insertDetectable(detectable);
    }
    console.log("done")
}

main();
