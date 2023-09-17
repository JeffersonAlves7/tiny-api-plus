import { Tiny } from "./Tiny";
import dotenv from "dotenv"

dotenv.config()

async function main(){
  const tiny = new Tiny(
    process.env.USER_EMAIL as string,
    process.env.USER_PASSWORD as string
  );

  await tiny.login();
  console.log({ TINYSESSID: tiny.TINYSESSID });
}

main()
