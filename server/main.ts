import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import yaml from 'js-yaml'
import fs from 'fs'

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

// Read and parse YAML file
const scoringInstructions = yaml.load(fs.readFileSync('./server/scoring_instructions.yaml', 'utf8')) as {
    fluency: {
        description: string,
        recommendations: string[]
    },
    citations: {
        description: string,
        recommendations: string[]
    },
    statistics: {
        description: string,
        recommendations: string[]
    },
    authority: {
        description: string,
        recommendations: string[]
    }
};

const app = express()
const port = 8000

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    console.log('Headers:', req.headers)
    console.log('Body:', req.body)
    next()
})

// Configure middleware
app.use(bodyParser.json()) // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })) // Parse URL-encoded bodies

// Configure CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}))

// Configure CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}))

// app.options('*', cors()) // Handle preflight requests
app.all('*', (req, res, next) => {
    console.log('Catch-all route:', req.method, req.url);
    next();
})

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

app.post('/explain_fluency_score', async (req, res) => {
    console.log("[Route] /explain_fluency_score")
    try {
        const { content } = req.body;
        if (!content) {
            console.error("No content in request body")
            return res.status(400).json({ error: "Content is required" })
        }
        console.log("Creating message stream...")
        const stream = await client.messages.create({
            max_tokens: 1024,
            system: [
                {
                    type: "text",
                    text: `You're a seasoned communicator with a knack for fluency. Known for your ability to find the most relevant
                            information and present it in a clear and fluent manner. You understand that I am seeking a single number score and nothing extraneous. You understand that the Evaluation Criteria
                            for fluency is as follows: 

                        Fluency (1-5) -- 
                        
                        Fluency in text refers to the quality of language that flows naturally and smoothly, characterized by coherent structure, appropriate word choice, and effortless readability. Fluent text demonstrates:
                        
                        Structural Elements:

                        Logical organization with clear connections between ideas
                        Varied sentence structures that create natural rhythm
                        Smooth transitions between sentences and paragraphs
                        Appropriate paragraph breaks and information chunking

                        Linguistic Features:

                        Precise vocabulary used in proper context
                        Correct grammar, syntax, and punctuation
                        Consistent tone and register appropriate to purpose and audience
                        Natural word order and phrasing that mirrors human speech patterns

                        Readability Characteristics:

                        Text that can be read without mental effort or re-reading
                        Ideas that build upon each other coherently
                        Absence of awkward constructions or unclear references
                        Appropriate complexity level for the intended audience

                        Contextual Appropriateness:

                        Language choices that match the genre, purpose, and setting
                        Cultural and social conventions properly observed
                        Consistent perspective and voice throughout

                        Fluent text feels effortless to process, allowing readers to focus on meaning rather than struggling with form. It's the difference between language that feels mechanical or translated versus language that feels naturally composed by a skilled writer. For AI training purposes, fluency can be measured by how closely text approximates the natural flow and coherence patterns found in high-quality human writing within specific domains or contexts.
                    `,
                    cache_control: { type: "ephemeral" },
                },
            ],
            messages: [
                { role: 'user', content: `Respond with a single integer on a scale of 1 to 5 where 1 is the lowest and 5 is the highest based on the Evaluation Criteria. Content to evaluate: ${content}` }
            ],
            model: 'claude-3-5-sonnet-latest',
            stream: true,
        });

        res.setHeader('Content-Type', 'text/event-stream');

        for await (const messageStreamEvent of stream) {
            console.log("messageStreamEvent", messageStreamEvent);
            // Handle streaming response
            if (typeof messageStreamEvent === 'string') {
                res.write(messageStreamEvent);
            } else if (messageStreamEvent && typeof messageStreamEvent === 'object') {
                try {
                    const text = JSON.stringify(messageStreamEvent);
                    const parsed = JSON.parse(text);
                    if (parsed.type === 'content_block_delta' &&
                        parsed.delta &&
                        parsed.delta.type === 'text_delta' &&
                        parsed.delta.text) {
                        res.write(parsed.delta.text)
                    }
                } catch (e) {
                    console.error('Error processing message:', e);
                }
            } else {
                console.log("C Unknown message type received:", messageStreamEvent);
            }
        }
        res.end(); // Important: End the response when done streaming
    }
    catch (error) {
        console.error("Error in route handler:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post('/assign_fluency_score', async (req, res) => {
    console.log("[Route] /assign_fluency_score")
    console.log("here", process.env.ANTHROPIC_API_KEY)
    try {
        const { content } = req.body;
        if (!content) {
            console.error("No content in request body")
            return res.status(400).json({ error: "Content is required" })
        }
        const score = await client.messages.create({
            max_tokens: 2000,
            system: [
                {
                    type: "text",
                    text: `You're a professional script writer for public speakers. Your task is to assign scores and recommendations for improvement according to the following evaluation criteria: ${scoringInstructions}.`,
                    cache_control: { type: "ephemeral" },
                },
            ],
            messages: [
                { role: 'user', content: `Respond in JSON format as follows:

                    {
                        "fluency": {"score": int, "recommendations": [str, str, str]},
                        "authority": {"score": int, "recommendations": [str, str, str]},
                        "citations": {"score": int, "recommendations": [str, str, str]},
                        "statistics": {"score": int, "recommendations": [str, str, str]} 
                    }
                     where the key is the name of the criteria and the value is an object with an integer score between 1 and 5 where 1 is the lowest and 5 is the highest, and a list of three recommendations on how to improve the specific score. 
                     
                     <content>{${content}}</content>` }
            ],
            model: 'claude-3-5-sonnet-latest',
        });
        res.send(score.content[0])
    }
    catch (error) {
        console.error("Error in route handler:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post('/search_ICP', async (req, res) => {
    console.log("[Route] /search_ICP")
    try {
        const { content } = req.body;
        if (!content) {
            console.error("No content in request body")
            return res.status(400).json({ error: "Content is required" })
        }
        const results = await fetch('http://127.0.0.1:5000/search_ICP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        })
        const resJson = await results.json()
        res.send(resJson)
    }
    catch (error) {
        console.error("Error in route handler:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})