// @ts-check

/// <reference path="authManager.gs"/>
/// <reference path="estoqueManager.gs"/>

function main() {
  const authManager = new AuthManager();
  authManager.loadTINYSESSIDFromScriptProperties();
  console.log({ TINYSESSID: authManager.getTINYSESSID() });
  const scriptProperties = PropertiesService.getScriptProperties();

  const email = scriptProperties.getProperty("USER_EMAIL") || "";
  const password = scriptProperties.getProperty("USER_PASSWORD") || "";

  if(!email || !password){
    throw new Error("Cannot find User's email address and User's password");
  }

  authManager.login(email, password);
  const estoqueManager = new EstoqueManager(authManager.getTINYSESSID());
  const retorno = estoqueManager.obterGiroConsiderandoEstoque(2);
  console.log(JSON.stringify({ retorno }, null, 2));
}