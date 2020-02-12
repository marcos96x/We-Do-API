![](https://github.com/marcos96x/We-Do-Client/blob/master/img/we-do.jpeg)  

# We Do - API  

API desenvolvida exclusivamente pro sistema We Do, de forma que os dados são servidos de forma assíncrona tanto para o [sistema web](https://github.com/marcos96x/We-Do-Client) quanto para o [sistema mobile](https://github.com/Luuck4s/We-Do-Mobile).  

Para utilizar essa versão pública você deve executar alguns passos: 

1. Preparar o ambiente  

Você deve instalar as seguintes ferramentas:

- [Node JS](https://nodejs.org/en/);
- [NPM](https://www.npmjs.com/);
- [Mysql](https://www.mysql.com/);
- Algum servidor local ([WampServer](http://www.wampserver.com/en/), [xampp](https://www.apachefriends.org/pt_br/download.html), [live server(Plugin do vscode)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), [usbwebserver](https://www.usbwebserver.net/webserver/) etc).

2. Realizar o download da base de dados do sistema We Do  

Para baixar os scripts de criação do banco, clique [aqui](https://github.com/marcos96x/we-do-database).  

3. (Opcional) realizar o download do client web  

Para baixar o client web basta fazer o download do repositório do [We Do](https://github.com/marcos96x/we-do-client).  

4. Ligar o servidor da API  

Abra o terminal ou cmd com o diretório apontado para a pasta raíz da API e instale as dependências que o sistema utiliza com o seguinte comando:  

```
npm install --save
```

Agora inicie o servidor com o seguinte comando:  

```
npm start
```

Após carregar todas as dependências internas do projeto, em seu console deve aparecer por último as seguintes mensagens:  

```
Server de chat rodando na porta 8080
Server aberto - Porta: 3000
```  

Com isso, a API está rodando em seu sistema, sendo possível ver a utilização através do client ou de um software de testes de endpoints, como o [Postman](https://www.getpostman.com).  

Caso ocorra algum erro, certifique de que as configurações do banco de dados no arquivo src/models/database.js estão corretas conforme sua utilização.  

#### Para mais detalhes, consulte nossa [documentação oficial](https://github.com/MariaCarolinaa/documentacaoWeDo).
