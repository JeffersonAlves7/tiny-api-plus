import { Tiny } from "./Tiny";
import dotenv from "dotenv";
import writeJsonFile from "./utils/writeJsonFile";

dotenv.config();

async function main() {
  const tiny = new Tiny(
    process.env.USER_EMAIL as string,
    process.env.USER_PASSWORD as string
  );

  await tiny.loadTINYSESSIDFromDatabase();
  await tiny.login();

  console.log({ TINYSESSID: tiny.TINYSESSID });

  const relatorios = await tiny.obterRelatorioSaidasEntradas("01/07/2023", "30/09/2023")

  writeJsonFile("relatorios.json", relatorios)
}

main();
