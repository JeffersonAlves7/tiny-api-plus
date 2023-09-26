//@ts-check

/// <reference path="../requests/authRequests.js"/>

/**
 * Authentication manager.
 * @class
 */
class AuthManager {
  /**
   * Create an AuthManager instance.
   */
  constructor() {
    /**
     * @private
     * @type {string}
     */
    this.TINYSESSID = "";
  }

  /**
   * Load the TINYSESSID from script properties, if available.
   * @returns {void}
   */
  loadTINYSESSIDFromScriptProperties() {
    const scriptProperties = PropertiesService.getScriptProperties();
    this.TINYSESSID = scriptProperties.getProperty("TINYSESSID") || "";
  }

  /**
   * Save the TINYSESSID to script properties.
   * @private
   * @returns {void}
   */
  saveTINYSESSIDToScriptProperties() {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty("TINYSESSID", this.TINYSESSID);
  }

  /**
   * Perform user login.
   * @param {string} userEmail - User's email address.
   * @param {string} userPassword - User's password.
   * @returns {string|null} - The TINYSESSID if login is successful, otherwise null.
   */
  login(userEmail, userPassword) {
    try {
      if (this.TINYSESSID && this.TINYSESSID != "0") {
        const isAuth = AuthRequests.verifyTINYSESSID(this.TINYSESSID);
        console.log({ isAuth });
        if (isAuth) return this.TINYSESSID;
      }

      const response = AuthRequests.initLogin({
        email: userEmail,
        password: userPassword,
      });

      // This cookie is temporary; it will be invalid after finishing login.
      const cookies = response.headers["Set-Cookie"];
      const TINYSESSID_TEMP = this.extractTINYSESSID(cookies);
      console.log({ TINYSESSID_TEMP });
      if (!TINYSESSID_TEMP) throw new Error("Cannot find a TINYSESSID_TEMP");

      const { idUsuario, uidLogin } = response.data.response[0].val;

      const finalizeResponse = AuthRequests.finishLogin({
        uidLogin,
        idUsuario,
        TINYSESSID: TINYSESSID_TEMP,
      });

      // Here I catch the final TINYSESSID
      const finalizeCookies = finalizeResponse.headers["Set-Cookie"];

      const TINYSESSID = this.extractTINYSESSID(finalizeCookies);
      console.log({ TINYSESSID });
      if (!TINYSESSID) throw new Error("Cannot find a TINYSESSID_TEMP");

      this.TINYSESSID = TINYSESSID;

      this.saveTINYSESSIDToScriptProperties();

      return this.TINYSESSID;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * Get the current TINYSESSID.
   * @returns {string} - The current TINYSESSID.
   */
  getTINYSESSID() {
    return this.TINYSESSID;
  }

  /**
   * Extract TINYSESSID from an array of cookies.
   * @param {string[]} cookies - An array of cookies.
   * @returns {string|null} - The TINYSESSID if found, otherwise null.
   * @private
   */
  extractTINYSESSID(cookies) {
    const cookieString = cookies.join(";");
    const regexExec = /TINYSESSID=(.+?);/g.exec(cookieString);
    return regexExec ? regexExec[1] : null;
  }
}
