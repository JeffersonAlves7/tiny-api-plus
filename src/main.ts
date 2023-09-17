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

  if(!tiny.TINYSESSID){
    await tiny.login();
  }

  console.log({ TINYSESSID: tiny.TINYSESSID });

  const relatorios = await tiny.obterEstoquesPorPeriodo(90)
  // const diasParaRequisitar = ["15/09/2023", "16/09/2023", "17/09/2023"];

  // const relatorios = await Promise.all(
  //   diasParaRequisitar.map((dia) => tiny.obterEstoqueDoDia(dia))
  // );

  // console.log({ relatorios });

  writeJsonFile("relatorios.json", relatorios)
}

main();
