import 'dotenv/config';
import 'module-alias/register';
import { config } from '@config/config';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as cors from 'cors';
import { join } from 'path';
import * as morgan from 'morgan';
import { createConnection } from "typeorm";
import { promises as fsPromises } from 'fs';

const app = express();
async function server() {
    const port: number = config.PORT;
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    app.use(cookieParser());
    app.use(cors());
    app.use(morgan('combined'));
    const autoRoutes = require('express-auto-routes')(app);
    autoRoutes(join(__dirname, './controllers'));

    const buffer = await fsPromises.readFile('./ormconfig.json');
    const typeormConfig = JSON.parse(buffer.toString());

    await createConnection({ ...typeormConfig, url: config.RDB.RDB_STAGING_URI });
    app.listen(port, () => {
        console.log(`node server is live on  http://localhost:${port}`);
    });
}

server()