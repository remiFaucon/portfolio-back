import express from 'express';
import { validate } from 'deep-email-validator'
import {createTransport} from 'nodemailer'

export const router = express.Router();

router.post('/', async (req, res) => {
  if (!req.body.email || !req.body.object || !req.body.emailBody) {
    res.status(500).send({
      message: "tout les champs n'ont pas etait saisis"
    })
  }
  else {
    const validEmail = await validate(req.body.email)
    if (!validEmail.valid) {
      res.status(500).send({
        message: "l'email saisi nest pas valide"
      })
    }
    else {
      const transporter = createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "faucon.remi04@gmail.com",
          pass: "wqoqsreqqhhyltjn",
        },
      });

      await transporter.sendMail({
        from: req.body.email,
        to: "faucon.remi04@gmail.com",
        subject: "porte folio - " + req.body.object,
        text: req.body.emailBody,
      });

      res.status(200).send({message: "email envoyé"});
    }
  }
});
