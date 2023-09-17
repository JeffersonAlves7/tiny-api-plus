import { AuthRequests } from "./requests/Auth";

export class Tiny {
  TINYSESSID: string = "";

  constructor(public userEmail: string, public userPassword: string) {}

  async login() {
    try {
      const email = this.userEmail;
      const password = this.userPassword;

      const response = await AuthRequests.initLogin({ email, password });

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

      return this.TINYSESSID;
    } catch (e) {
      console.error(e);
    }
  }
}
