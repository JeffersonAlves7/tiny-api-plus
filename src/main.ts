import dotenv from "dotenv";
import { AuthManager } from "./authManager";
import { EstoqueManager } from "./estoqueManager";
import writeJsonFile from "./utils/writeJsonFile";

dotenv.config();

async function main() {
  const authManager = new AuthManager();
  await authManager.loadTINYSESSIDFromDatabase();
  await authManager.login(
    process.env.USER_EMAIL as string,
    process.env.USER_PASSWORD as string
  );
  const TINYSESSID = authManager.getTINYSESSID();

  console.log({ TINYSESSID });

  const estoqueManager = new EstoqueManager(TINYSESSID);
  const giroPorItem = await estoqueManager.obterGiroConsiderandoEstoque(3);

  writeJsonFile("giroPorItem.json", giroPorItem)
}

main();
