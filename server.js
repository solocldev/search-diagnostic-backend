import express from 'express';
import mongoose from 'mongoose';
import { Object, Link, ResponseObject } from './model.js';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import html_to_pdf from 'html-pdf-node'

const analysis = [
    "More than 10% of searches online are misspelt. Your search tool should be able to correct spelling mistakes and typing errors, otherwise this may lead to users abandoning sessions on the account of not finding desired results.",
    "If users search with terms that aren’t an exact match for your site’s product labels, only a fraction of the results get displayed, and it’s a missed opportunity. Since users aren’t presented with as many relevant (or full-breadth) results there is a high chance that the users might end their session. Having a robust synonym management system and good machine learning capabilities to develop an understanding of the user's intent is the best way you can offer visitors a better search experience.",
    "The same product can be spelt in different ways. A good search solution processes different spellings that your customers might use.",
    "Many search solutions work on exact query matching; so the search tends to break down if a customer looking for an apple types “apples”. Good search solutions should give the same results for singular and plural forms.",
    "If a customer searches for 'jackets' in Delhi and in Bangalore, they should be presented with very different results. Clients who search for a product want to find a relevant option for themselves and are more likely to come with an intent to purchase. If the results they get are not personalised, they might leave the website and search elsewhere. Personalisation is a subtle way of showing that you care about your users’ interests and preferences through relevant results.",
    "Search solutions with advanced analytics give businesses an insight into their customers. Analysing site search data is like talking to your customers: you can make the necessary adjustments to your site search and deliver a better experience. Analysing site search data reduces website bounce rate and optimises for better conversion.",
    "Users tend to expect search on all platforms to be similar to the search they are in the most habit of using (eg- Google, Amazon). So when searching for something on your platform, having the autocomplete feature on your search bar makes for a strong user delight. It also makes business sense since you nudge the user in the direction of products you have instead of risking “no-result”. Only 19% of sites get the implementation details right for the autocomplete feature. Getting it right is a good way of ensuring customer delight.",
    "The time before your user enters their search query, showing them trending searches can be a strong nudge. Companies like Twitter use this feature to help navigate user engagement on the platform.",
    "Searches can sometimes give a lot of results which can end up overwhelming the user, it is crucial that solutions enable relevant filtering and sorting options so the user can easily narrow down the list. Example, Amazon on their search results page encourages users to sort and filter the results to narrow the product options.",
    "Your users expect their search queries and phrases to be understood like a real conversation — sometimes using jargon, slang or abbreviations, and plain English words. Processing such search queries needs machine learning, artificial intelligence (AI) to understand and interpret the user's search intent — just like  humans do. 71% people prefer searching with voice, having a solution that can support voice/natural language based search will make the search experience on your website robust."
]

let options = {
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
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // 
            last: 'Last Page'
        }
    }
};

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

app.post('/link', async (req, res) => {
    const userLink = req.body.link
    const id = req.body.id
    try {
        const link = await Link({ link: userLink, id })
        link.save()
        res.status(201).send(link)
    } catch (error) {
        res.json(error.message)
    }
})

app.post('/response', async (req, res) => {
    const link = req.body.link
    const response = req.body.response
    const id = req.body.id
    try {
        const responseObject = await ResponseObject({ link, response, id })
        responseObject.save()
        res.status(201).send(responseObject)
    } catch (error) {
        res.json(error.message)
    }
})

app.post('/', async (req, res) => {
    const link = req.body.link
    const email = req.body.email
    const response = req.body.response
    const id = req.body.id
    try {
        const object = await Object({ link, response, email, id })
        object.save()
        let result = 0
        response.map(res => {
            if (res.answer === 'yes') {
                result++
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
            <title> Solocl Search Evaluation</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;400;600;700&display=swap" rel="stylesheet">
            <style>
                body{
                    font-family: 'Montserrat', sans-serif;
                }
            </style>
        </head>
        
        <body>
            <h1 class="title" style="text-align:center; color:#5D3FD3;">Solocl Search Evaluation</h1>
            <h1 class="score" style="text-align:center;">${result}0%</h1>
            <ul style="list-style:none;">
                ${response.map((res, index) => {
                return (`
                <div class="box" style="
                border: 2px solid #d3d3d3;
                border-radius: 12px;
                padding: 1rem;
                width: fit-content;
                margin-bottom: 1rem;
                ">
                    <li class="question" style="margin:1rem 0;font-size: 18px;">Question: </li>
                    <li class="question" style="margin:1rem 0;font-size: 24px;">${res.question} </li>
                    <li class="answer" style="margin:1rem 0;">Your response: <span
                        style="font-weight: bold; font-size: 24px; color:#5D3FD3;">${res.answer.charAt(0).toUpperCase() + res.answer.slice(1)}</span></li>
                    <li style="background-color: #d3d3d3;margin:1rem 0;font-size: 24px;border-radius: 12px;">
                    <span style="margin:1rem 0;font-size: 18px;">our analysis: </span>
                    <br />
                    <span style="margin:1rem 0;">${analysis[index]}</span>
                    </li>
                </div>
                `)
            })}
            </ul >
            <a href="https://calendly.com/pratik-solocl/seacheval" style="text-align: center;">
                <h1>Sign-up for a FREE 30-minute call to know about 40+ areas your search can improve.</h1>
            </a>
        </body >
        </html >
                    ` }, options).then(pdfBuffer => {
                fs.writeFileSync('./search-evaluation-report.pdf', pdfBuffer)
                const msg = {
                    from: "prajurkar23@gmail.com",
                    to: email,
                    subject: "Your Solocl Search Evaluation Report is here!",
                    attachments: [{
                        filename: 'search-evaluation-report.pdf',
                        path: './search-evaluation-report.pdf',
                        contentType: 'application/pdf'
                    }],
                    text: `Hello,\nThank you for taking the Solocl Search Evaluation, you can find your detailed Evaluation report attached below.\n\nYou can also sign-up for an exclusive FREE 30-minute call where we will go through 40+ additional evaluation parameters on your website/app.\nSign-up here: https://bit.ly/soloclsearcheval_mail\n\nLooking forward to interacting with you.\n\nPratik\nfrom Solocl\n`
                }
                nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'prajurkar23@gmail.com',
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
        res.json(error.message)
    }
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log('server running on port', PORT)
})