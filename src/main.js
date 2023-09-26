// @ts-check

import { AuthManager } from "./managers/authManager.js";
import { ApiRequests } from "./requests/apiRequests.js";
import { EstoqueRequests } from "./requests/estoqueRequests.js";
import { getEnv } from "./utils/envUtils.js";

// Create a AppManager to manage all the application
/**
 * @class
 */
class AppManager{
    /**
     * 
     * @param {AuthManager} authManager 
     */
    constructor(authManager) {
        /**
         * @private
         */
        this.authManager = authManager;
    }

    async login(){
        await this.authManager.loadTINYSESSIDFromDatabase();
        await this.authManager.login(
            getEnv("USER_EMAIL"),
            getEnv("USER_PASSWORD"),
        );
    }
}

async function main(){
    // Get the product id, descricao, marca
    const authManager = new AuthManager();
    const appManager = new AppManager(authManager);

    await appManager.login();

    // Get the product id, descricao, marca
    const produtos = await EstoqueRequests.obterPacoteDadosImpressao(authManager.getTINYSESSID(), 0);
    console.log(JSON.stringify(produtos, null, 2));
}
main()