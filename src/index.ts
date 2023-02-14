/* eslint-disable */
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import passportGoogle from 'passport-google-oauth20';
import AWS from 'aws-sdk';
require('https').globalAgent.options.rejectUnauthorized = false;
// import { DynamoDBClient, BatchExecuteStatementCommand } from "@aws-sdk/client-dynamodb"
// import { ScanCommand } from "@aws-sdk/lib-dynamodb";
// const client = new DynamoDBClient({ region: "REGION" });

import asyncHandler from 'express-async-handler';

const GoogleStrategy = passportGoogle.Strategy;
dotenv.config();

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const app = express();

// const dynamodb = new AWS.DynamoDB();
const db = new AWS.DynamoDB();

const port = process.env.PORT;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(
  session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  return done(null, user);
});

passport.deserializeUser((user: any, done) => {
  return done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/auth/google/callback',
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    },
    function (accessToken: any, refreshToken: any, profile: any, cb) {
      // Successful Auth
      // insert into db
      console.log('access token ', accessToken, ' refresh token ', refreshToken);
      console.log('profile ', profile);
      cb(null, profile);
    }
  )
);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/failure',
    successRedirect: 'http://localhost:3000',
  }),
  function (req, res) {
    console.log('redirecting...');
    // Successful authentication, redirect home.
    // res.redirect('/');
  }
);

app.get('/', (req, res) => {
  console.log('user ', req.user);
  if (req.user) {
    // req.logout();
    console.log('user ', req.user);
    res.send('done');
  } else {
    res.send('Express + TypeScript Server');
  }
});

app.get(
  '/test-db',
  asyncHandler(async (req, res) => {
    try {
      const tableName = process.env.TABLE_POSTS;

      if (tableName) {
        const response = await db.scan({ TableName: tableName! }).promise();
        console.log('response ', response);
        res.json(response.Items);
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  })
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
