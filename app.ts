import express from "express";
import {join} from "path";
import {router} from "./controllers/mail";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, 'public')));

app.use('/mail', router);