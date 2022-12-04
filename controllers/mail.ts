import {createTransport} from 'nodemailer'
import { validate } from 'deep-email-validator'
import express from 'express';

export const router = express.Router();

router.post('/', async (req, res) => {
  if (!req.body.email || !req.body.object || !req.body.emailBody)
    return res.status(500).send({
      message: "tout les champs n'ont pas etait saisi"
    })

  const validEmail = await validate(req.body.email)
  if (!validEmail.valid)
    return res.status(500).send({
      message: "l'email saisi nest pas valide"
    })

  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailSend = await transporter.sendMail({
    from: req.body.email,
    to: process.env.MAIL_USER,
    subject: "porte folio - " + req.body.object,
    text: req.body.emailBody,
  });

  if (mailSend.rejected.length > 0)
    return res.status(500).send({message: "l'email n'a pas pu être envoyer"})

  return res.status(200).send({message: "email envoyé"});
});
