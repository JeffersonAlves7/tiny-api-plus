import sqlite3 from "sqlite3";
import { AuthRequests } from "./requests/Auth";

export class AuthManager {
  private TINYSESSID: string = "";

  constructor() {}

  async loadTINYSESSIDFromDatabase() {
    return new Promise((resolve) => {
      const db = new sqlite3.Database("temp/tiny.db");

      db.serialize(() => {
        db.get(
          "SELECT TINYSESSID FROM session ORDER BY rowid DESC LIMIT 1",
          (err, row: any) => {
            if (!err && row) {
              this.TINYSESSID = row.TINYSESSID;
            }
            resolve(true);
          }
        );
      });

      db.close();
    });
  }

  private async saveTINYSESSIDToDatabase() {
    const db = new sqlite3.Database("temp/tiny.db");

    db.serialize(() => {
      db.run("CREATE TABLE IF NOT EXISTS session (TINYSESSID TEXT)");
      const stmt = db.prepare("INSERT INTO session VALUES (?)");
      stmt.run(this.TINYSESSID);
      stmt.finalize();
    });

    db.close();
  }

  async login(userEmail: string, userPassword: string) {
    try {
      if (this.TINYSESSID) {
        const isAuth = await AuthRequests.verifyTINYSESSID(this.TINYSESSID);
        console.log({ isAuth });
        if (isAuth) return;
      }

      const response = await AuthRequests.initLogin({ email: userEmail, password: userPassword });

      // This cookie is temporary, after finish login that will be invalid.
      let regexExec: any = /TINYSESSID=(?<TINYSESSID>.+?);/g.exec(
        (response.headers["set-cookie"] as string[]).find((v) =>
          v.includes("TINYSESSID")
        ) as string
      );
      const TINYSESSID_TEMP = regexExec.groups["TINYSESSID"];

      const { idUsuario, uidLogin } = response.data.response[0].val;

      const finalizeResponse = await AuthRequests.finishLogin({
        uidLogin,
        idUsuario,
        TINYSESSID: TINYSESSID_TEMP,
      });

      // Here I catch the final TINYSESSID
      regexExec = /TINYSESSID=(?<TINYSESSID>.+?);/g.exec(
        (finalizeResponse.headers["set-cookie"] as string[]).find((v) =>
          v.includes("TINYSESSID")
        ) as string
      );
      this.TINYSESSID = regexExec.groups["TINYSESSID"];

      this.saveTINYSESSIDToDatabase();

      return this.TINYSESSID;
    } catch (e) {
      console.error(e);
    }
  }

  getTINYSESSID(){
    return this.TINYSESSID;
  }
}
