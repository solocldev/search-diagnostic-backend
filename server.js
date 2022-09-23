import express from 'express';
import mongoose from 'mongoose';
import { Object } from './model.js';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import html_to_pdf from 'html-pdf-node'
import path from 'path';


const html = fs.readFileSync('./template.html', 'utf8');

var options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    header: {
        height: "45mm",
        contents: '<div style="text-align: center;">Solocl Search Diagnostics</div>'
    },
    footer: {
        height: "28mm",
        contents: {
            first: 'Cover page',
            2: 'Second page',
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
            last: 'Last Page'
        }
    }
};

const generatePdf = () => {

}

const app = express();
dotenv.config()
app.use(cors())
app.use(express.json())
mongoose.connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(console.log('connected to mongo')).catch(error => console.error(error))

app.get('/', async (req, res) => {
    try {
        const objects = await Object.find()
        res.json(objects);
    } catch (error) {
        res.json(error.message);
    }
})

app.post('/', async (req, res) => {
    const details = req.body.details
    const response = req.body.response
    try {
        const object = await Object({ details, response })
        object.save()
        let result = 0;
        response.map(res => {
            if (res.answer === 'yes') {
                result++;
            }
        })
        html_to_pdf.generatePdf({
            content: `
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <script src="server.js"></script>
        </head>
        
        <body>
            <h1 class="title" style="text-align:center; color:#5D3FD3;">Search Diagnostics</h1>
            <h1 class="score" style="text-align:center;">${result}0%</h1>
            <ul style="list-style:none;">
            <div class="box" style="box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
                border-radius: 12px;
                padding: 1rem;">
                ${response.map(res => {
                return (`
                    <li class="question" style="margin:1rem 0;font-size: 18px;">Question: </li>
                    <li class="question" style="margin:1rem 0;font-size: 24px;">${res.question} </li>
                    <li class="answer" style="margin:1rem 0;">Your response: <span
                        style="font-weight: bold; font-size: 24px; color:#5D3FD3;">${res.answer}</span></li>
                `)
            })}
            </div>
            </ul >
        </body >
        </html >
                    ` }, options).then(pdfBuffer => {
                fs.writeFileSync('./output.pdf', pdfBuffer)
                const msg = {
                    from: "sarthakrajesh777@gmail.com",
                    to: details.email,
                    subject: "test",
                    attachments: [{
                        filename: 'output.pdf',
                        path: './output.pdf',
                        contentType: 'application/pdf'
                    }],
                    text: "test"
                }
                nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'sarthakrajesh777@gmail.com',
                        pass: process.env.APPPASS
                    },
                    port: 465,
                    host: 'smtp.gmail.com',
                }).sendMail(msg, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    else console.log('sent')
                })
            });

        res.status(201).json(object)
    } catch (error) {
        res.json(error.message);
    }
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log('server running on port', PORT);
});