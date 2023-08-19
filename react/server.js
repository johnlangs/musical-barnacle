/*
server.js – Configures the Plaid client and uses Express to defines routes that call Plaid endpoints in the Sandbox environment.Utilizes the official Plaid node.js client library to make calls to the Plaid API.
*/

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { MongoClient, ServerApiVersion } = require("mongodb")
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const { pingDB, insertDoc, updateAccountTransactionsDb, getHighestIndex } = require("./db_operations.js");
const app = express();

const MongoDbClient = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})
pingDB(MongoDbClient).catch(console.dir);

app.use(
  // FOR DEMO PURPOSES ONLY
  // Use an actual secret key in production
  session({ secret: process.env.SESSION_SECRET, saveUninitialized: true, resave: true })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuration for the Plaid client
const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

//Instantiate the Plaid client with the configuration
const PlaidClient = new PlaidApi(config);

//Creates a Link token and return it
app.get("/api/create_link_token", async (req, res, next) => {
  const tokenResponse = await PlaidClient.linkTokenCreate({
    user: { client_user_id: req.sessionID },
    client_name: "Plaid's Tiny Quickstart",
    language: "en",
    products: ["auth", "transactions"],
    country_codes: ["US"],
    redirect_uri: process.env.PLAID_SANDBOX_REDIRECT_URI,
    webhook: "www.example.com",
  });
  res.json(tokenResponse.data);
});

// Exchanges the public token from Plaid Link for an access token
app.post("/api/exchange_public_token", async (req, res, next) => {
  const exchangeResponse = await PlaidClient.itemPublicTokenExchange({
    public_token: req.body.public_token,
  });

  // FOR DEMO PURPOSES ONLY
  // Store access_token in DB instead of session storage
  req.session.access_token = exchangeResponse.data.access_token;

  await insertDoc(MongoDbClient, process.env.MONGO_DB_NAME, process.env.MONGO_COLL_NAME, {
    title: "Test Token",
    content: exchangeResponse.data.access_token,
  }).catch(console.dir);

  console.log(exchangeResponse.data.access_token);

  res.json(true);
});

// Fetches balance data using the Node client library for Plaid
app.get("/api/balance", async (req, res, next) => {
  const doc = await getHighestIndex(MongoDbClient, process.env.MONGO_DB_NAME, process.env.MONGO_COLL_NAME).catch(console.dir);
  const balanceResponse = await PlaidClient.accountsBalanceGet({ access_token:  doc.at(0).content});

  res.json({
    Balance: balanceResponse.data,
  });
});

app.get("/api/transactionsSync", async (req, res, next) => {
  const doc = await getHighestIndex(MongoDbClient, process.env.MONGO_DB_NAME, process.env.MONGO_COLL_NAME).catch(console.dir);
  const transactionResponse = await PlaidClient.transactionsSync({
    access_token: doc.at(0).content,
  });

  updateAccountTransactionsDb(
    MongoDbClient, 
    "user", 
    "transactions", 
    transactionResponse.data.added,
    transactionResponse.data.modified,
    transactionResponse.data.removed
    ).catch(console.dir);

  res.json({
    TransactionStream: transactionResponse.data,
  });
})

app.listen(process.env.PORT || 8080);
