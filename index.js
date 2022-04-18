// Tecnologias utilizadas: Node, Bootstrap e MySql com o auxílio do Express, Sequelize, Body-Parser e EJS.
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta")

var user = "Anônimo";
var logado = false;
var botao = "Entrar";
var rota = "/login";

connection.authenticate().then(()=>{ // conexão com o banco de dados através do script database/database.js
    console.log("Conexão estabelecida com o banco de dados!");
}).catch((err)=>{
    console.log(err);
});

app.set("view engine", "ejs"); // Usando EJS como View Engine
app.use(express.static("public")); // Utilizando arquivos estáticos
app.use(bodyParser.urlencoded({extended: false})); // decodificar arquivos enviados por requisição
app.use(bodyParser.json()); // permite leitura de dados de formulário via Json

app.get("/", (req,res)=>{ // toda vez que a rota é acessada, o que tiver dentro é executado.
    
    Pergunta.findAll({ raw: true, order:[["id", "DESC"]] }).then((perguntas)=>{ // equivale ao SELECT * FROM perguntas; raw: true => traz apenas as informações essenciais (dados).
        console.log(perguntas)
        res.render("index",{
            perguntas_index: perguntas, // é criada e enviada uma variável para o index que recebe as perguntas do banco de dados.
            user: user, rota: rota, botao: botao
        });
    })
});

app.get("/login", (req, res) =>{
    res.render("logar", ({user: user, rota: rota, botao: botao}));
});

app.post("/enviarlogin", (req, res)=>{
    var login = req.body.email;
    var senha = req.body.senha;

    if( login!="" && senha!=""){ // dados válidos
        user = login;
        logado = true;
        botao = "Sair"
        rota = "/deslogar";
        res.redirect("/")
    }else{
        res.render("logar", ({user: user, rota: rota, botao: botao}));
    }
});

app.get("/deslogar", (req, res)=>{
    user = "Anônimo";
    logado = false;
    botao = "Entrar";
    rota = "/login";
    res.redirect("/");
});

app.get("/perguntar", (req, res)=>{ // toda vez que a rota é acessada, o que tiver dentro é executado.
    if(logado){
            res.render("perguntar", ({user: user, rota: rota, botao: botao}));
        }else{
            res.redirect("/login")
        }
});

app.post("/salvarpergunta", (req, res)=>{ // toda vez que a rota é acessada, o que tiver dentro é executado.
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;

    if(titulo == "" || descricao == ""){
        res.send("ATENÇÃO: Preencha os dados corretamente");
        //res.redirect("/");
    }else{
        Pergunta.create({
            titulo: titulo,
            descricao: descricao
        }).then(()=>{
            res.redirect("/");
        });
    }
});

app.get("/pergunta/:id", (req, res)=>{ // procura o id repassado no banco e renderiza a pagina da pergunta
    var id = req.params.id;
    Pergunta.findOne({
        where: {id: id}
    }).then(pergunta =>{
        if(pergunta != undefined){

            Resposta.findAll({
                where: {perguntaId: pergunta.id}
            }).then(resposta =>{
                res.render("pergunta", {
                pergunta_pergunta: pergunta,
                resposta_pergunta: resposta,
                user: user,
                rota: rota,
                botao: botao
                });
            });
        }else{
            res.redirect("/")
        }
    })
});

app.post("/responder", (req, res)=>{
    var texto_resp = req.body.texto_resp;
    var nro_pergunta = req.body.nro_pergunta;

    if(texto_resp == ""){
        res.send("ATENÇÃO: Escreva uma resposta");
        //res.redirect("/");
    }else{
        if(logado){
            Resposta.create({
                corpo: texto_resp,
                perguntaId: nro_pergunta
            }).then(()=>{
                res.redirect("/pergunta/"+nro_pergunta);
            }).catch((err)=>{
                res.send(err);
            });
        }else{
            res.render("logar", {user: user, rota: rota, botao: botao});
        }
    }
});

app.listen(8081, ()=>{
    console.log("App Rodando...");
});