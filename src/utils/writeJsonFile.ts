import fs from "fs"

export default function writeJsonFile(fileName: string, content: any){
  fs.writeFileSync("temp/" + fileName, JSON.stringify(content, null, 2));
}