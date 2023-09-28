//@ts-check
import sqlite3 from "sqlite3";
import { AuthRequests } from "../requests/authRequests.js";
import { UserManager } from "./userManager.js";

/**
 * Authentication manager.
 * @class
 */
export class AuthManager {
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
   *
   * @returns {Promise<any>}
   */
  async loadTINYSESSID() {
    return new Promise((resolve, reject) => {
      // create a database connection
      const db = new sqlite3.Database("./database.sqlite3", (err) => {
        if (err) reject(err);
        console.log("Connected to the database.");
        // select the TINYSESSID from the table
        db.get(`SELECT TINYSESSID FROM tinySession`, (err, row) => {
          if (err) resolve(err);
          // if the TINYSESSID exists, load it
          if (row) {
            this.TINYSESSID = row.TINYSESSID;
            resolve(true);
          }
        });
      });
    });
  }

  /**
   *
   * @returns {Promise<any>}
   */
  saveTINYSESSID() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database("./database.sqlite3", (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log("Connected to the database.");
        // create a table to store the TINYSESSID
        db.run(
          `CREATE TABLE IF NOT EXISTS tinySession (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        TINYSESSID text NOT NULL
      );`,
          (err) => {
            if (err) reject(err);
            console.log("Table created.");
            // insert the TINYSESSID into the table, if it already exists, overwrite the value
            db.run(
              `INSERT OR REPLACE INTO tinySession(id, TINYSESSID) VALUES(1, ?)`,
              [this.TINYSESSID],
              function (err) {
                if (err) reject(err);
                console.log(
                  `A row has been inserted with row id ${this.lastID}`
                );
                resolve(true);
              }
            );
          }
        );
      });
    });
  }

  /**
   * Perform user login.
   * @param {string} userEmail - User's email address.
   * @param {string} userPassword - User's password.
   * @returns {Promise<string|null>} - The TINYSESSID if login is successful, otherwise null.
   */
  async login(userEmail, userPassword, saveTINYSESSID = true) {
    try {
      if (saveTINYSESSID && this.TINYSESSID && this.TINYSESSID != "0") {
        const isAuth = await AuthRequests.verifyTINYSESSID(this.TINYSESSID);
        console.log({ isAuth });
        if (isAuth) return this.TINYSESSID;
      }

      const response = await AuthRequests.initLogin({
        email: userEmail,
        password: userPassword,
      });

      // This cookie is temporary; it will be invalid after finishing login.
      const TINYSESSID_TEMP = this.extractTINYSESSID(
        response.headers.get("set-cookie") || ""
      );
      if (!TINYSESSID_TEMP) throw new Error("Cannot find a TINYSESSID_TEMP");

      const { idUsuario, uidLogin } = response.data.response[0].val;

      const finalizeResponse = await AuthRequests.finishLogin({
        uidLogin,
        idUsuario,
        TINYSESSID: TINYSESSID_TEMP,
      });

      // Here I catch the final TINYSESSID
      const TINYSESSID = this.extractTINYSESSID(
        finalizeResponse.headers.get("set-cookie") || ""
      );
      if (!TINYSESSID) throw new Error("Cannot find a TINYSESSID_TEMP");

      this.TINYSESSID = TINYSESSID;

      if (saveTINYSESSID) this.saveTINYSESSID().catch(console.error);

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
   * @param {string} setCookie - An array of cookies.
   * @returns {string|null} - The TINYSESSID if found, otherwise null.
   * @private
   */
  extractTINYSESSID(setCookie) {
    const regexExec = /TINYSESSID=(.+?);/g.exec(setCookie);
    return regexExec ? regexExec[1] : null;
  }
}
