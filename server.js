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
        html_to_pdf.generatePdf({ content: "<h1>nice</h1>" }, options).then(pdfBuffer => {
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