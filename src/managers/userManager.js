// @ts-check

import { AuthManager } from "./authManager.js";

/**
 * @class
 */
export class UserManager {
  /**
   * @constructor
   * @param {string} email
   * @param {string} password 
   * @param {'matriz' | 'filial'} nomeLoja 
   */
  constructor(email, password, nomeLoja){ 
    /**
     * @private
     */
    this.email = email;
    /**
     * @private
     */
    this.password = password;
    /**
     * @private
     */
    this.authManager = new AuthManager();
    /**
     * @public
     */
    this.nomeLoja = nomeLoja;
  }

  async login(){ 
    await this.authManager.login(this.email, this.password, false);
  }

  getTINYSESSID(){
    return this.authManager.getTINYSESSID();
  }

  loadTINYSESSID(){
    return this.authManager.loadTINYSESSID();
  }
}