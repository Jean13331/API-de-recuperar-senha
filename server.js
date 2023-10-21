const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const fs = require('fs');
const tokens = new Map();
const crypto = require('crypto');

const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.get('/gerar-link', (req, res) => {
    const token = crypto.randomBytes(32).toString('hex');
    tokens.set(token, 'redefinir-senha');
    const link = `http://localhost:3000/redefinir-senha?token=${token}`;
    res.send(`Seu link: <a href="${link}">${link}</a>`);
  });
  app.get('/redefinir-senha', (req, res) => {
    fs.readFile('redefinir-senha.html', 'utf8', (err, data) => {
      if (err) {
        console.error('Erro ao ler o arquivo HTML:', err);
        res.status(500).send('Erro interno do servidor');
      } else {
        res.send(data);
      }
    });
  });



app.get('/', (req, res) => {
  fs.readFile('home.html', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo HTML:', err);
      res.status(500).send('Erro interno do servidor');
    } else {
      res.send(data);
    }
  });
});
app.get('/styles.css', (req, res) => {
  fs.readFile('styles.css', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo CSS:', err);
      res.status(500).send('Erro interno do servidor');
    } else {
      res.setHeader('Content-Type', 'text/css');
      res.send(data);
    }
  });
});


app.post('/enviar-email', (req, res) => {
  const email = req.body.email;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "seu email", //Seu email que sera usado para enviar o e-mail. Lembrando que deve ser habilitado no seu email um campo que permite o acesso de dispositivos menos seguros https://myaccount.google.com/u/2/lesssecureapps
      pass: "sua senha" // Sua senha de email. Lembrando que esse nao e um metodo seguro de inserir a senha pois esta exposto, o certo seria utilizar algum hash de senha.
    }
  });

 
  const token = crypto.randomBytes(32).toString('hex');
  const link = `http://localhost:3000/redefinir-senha?token=${token}`;

  const configEmail = {
    from: "seu email", //Seu email que sera usado para enviar as mensagens 
    to: email, //Email que ira receber o email
    subject: "Recuperação de Senha",
    html: `lang="pt-br"
            <h3>Por favor não responda</h3>
            <p>Clique no link a seguir para redefinir sua senha:</p>
            <a href="${link}">${link}</a>`
  };

  async function enviarEmail() {
    try {
      const info = await transporter.sendMail(configEmail);
      console.log("Email enviado com sucesso:", info.response);
      res.send('E-mail enviado com sucesso.');
    } catch (error) {
      console.error("Erro ao enviar o email:", error);
      res.status(500).send('Erro ao enviar o e-mail.'); 
    }
  }

  enviarEmail();
});

app.listen(port, () => console.log(`O servidor está rodando na porta ${port}!`));
