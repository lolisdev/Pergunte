const Sequelize = require("sequelize");
const connection = require("./database");

const Pergunta = connection.define("perguntas",{ // realiza a criação e inserção de dados na tabela Perguntas 
    titulo:{
        type: Sequelize.STRING,
        allowNull: false
    },
    descricao:{
        type: Sequelize.TEXT,
        allowNull: false
    }
});

Pergunta.sync({force: false}); // force: false => caso a tabela exista, não criar uma nova.

module.exports = Pergunta;