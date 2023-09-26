// @ts-check

class ApiRequests {
    // The API token to use for requests.
    constructor(){
        this.token = "";
        this.restUrl = "https://api.tiny.com.br/api2/";
    }

    
    // Load the API token from script properties, if available.
    loadApiToken(){
        const scriptProperties = PropertiesService.getScriptProperties();
        this.token = scriptProperties.getProperty("token") || "";
    }

    // Save the API token to script properties.
    saveApiToken(){
        const scriptProperties = PropertiesService.getScriptProperties();
        scriptProperties.setProperty("token", this.token);
    }

    // Do a request to Obter Produto by id
    /**
     * 
     * @param {number} id 
     * @returns 
     */
    obterProduto(id){
        const url = this.restUrl + "produto.obter.php";
        const params = {
            formato: 'json',
            token: this.token,
            id: id
        };

        // Trasform the variable params to a x-www-form-urlencoded
        const data = Object.keys(params).map(key => key + '=' + params[key]).join('&');

        const response = UrlFetchApp.fetch(url, {
            method: "post",
            payload: data 
        });

        const responseData = JSON.parse(response.getContentText());
        return responseData;
    }

    // Do a request to search all the products from the API passing pesquisa, situacao and pagina
    /**
     * 
     * @param {string} pesquisa 
     * @param {string?} situacao 
     * @param {string?} pagina 
     * @returns 
     */
    pesquisarProdutos(pesquisa, situacao, pagina){
        const url = this.restUrl + "produtos.pesquisa.php";
        const params = {
            token: this.token,
            formato: 'json',
            pesquisa: pesquisa,
            situacao: situacao,
            pagina: pagina
        };

        // Trasform the variable params to a x-www-form-urlencoded
        const data = Object.keys(params).map(key => key + '=' + params[key]).join('&');

        const response = UrlFetchApp.fetch(url, {
            method: "post",
            payload: data
        });

        const responseData = JSON.parse(response.getContentText());
        return responseData;
    }

    // Do a request to get the product stock from the API passing id
    /**
     * 
     * @param {number} id 
     * @returns 
     */
    obterEstoque(id){
        const url = this.restUrl + "produto.obter.estoque.php";
        const params = {
            token: this.token,
            formato: 'json',
            id: id
        };

        // Trasform the variable params to a x-www-form-urlencoded
        const data = Object.keys(params).map(key => key + '=' + params[key]).join('&');

        const response = UrlFetchApp.fetch(url, {
            method: "post",
            payload: data
        });

        const responseData = JSON.parse(response.getContentText());
        return responseData;
    }
}