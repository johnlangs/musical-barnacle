/*
server.js – Configures the Plaid client and uses Express to defines routes that call Plaid endpoints in the Sandbox environment.Utilizes the official Plaid node.js client library to make calls to the Plaid API.
*/

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { MongoClient, ServerApiVersion } = require("mongodb")
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const { pingDB, insertDoc, updateTransactionsDb, getDocuments } = require("./db_operations.js");
const app = express();

const MongoDbClient = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

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
    products: ["auth", process.env.TRANSACTION_COLL],
    country_codes: ["US"],
    redirect_uri: process.env.PLAID_SANDBOX_REDIRECT_URI,
    webhook: "www.example.com",
  });
  res.json(tokenResponse.data);
});

// Exchanges the public token from Plaid Link for an access token
// Store balance and transaction data for that access token
app.post("/api/exchange_public_token", async (req, res, next) => {
  const exchangeResponse = await PlaidClient.itemPublicTokenExchange({
    public_token: req.body.public_token,
  });
  await insertDoc(MongoDbClient, process.env.DB_NAME, process.env.TOKEN_COLL, exchangeResponse.data).catch(console.dir);

  const balanceResponse = await PlaidClient.accountsBalanceGet({
    access_token: exchangeResponse.data.access_token,
  });
  await insertDoc(MongoDbClient, process.env.DB_NAME, process.env.BALANCE_COLL, balanceResponse.data).catch(console.dir);

  const transactionResponse = await PlaidClient.transactionsSync({
    access_token: exchangeResponse.data.access_token,
  });
  await updateTransactionsDb(
    MongoDbClient, 
    process.env.DB_NAME, 
    process.env.TRANSACTION_COLL, 
    transactionResponse.data.added,
    transactionResponse.data.modified,
    transactionResponse.data.removed
    ).catch(console.dir);

  res.json(true);
})

// Get balance records up to an n amount, newest->oldest
app.get("/api/balance/:n", async (req, res, next) => {
  const result = await getDocuments(MongoDbClient, process.env.DB_NAME, process.env.BALANCE_COLL, Number(req.params.n)).catch(console.dir);

  res.json({
    n: req.params.n,
    data: result,
  });
})

// Get transaction records up to an n amount, newest->oldest
app.get("/api/transactions/:n", async (req, res, next) => {
  const result = await getDocuments(MongoDbClient, process.env.DB_NAME, process.env.TRANSACTION_COLL, Number(req.params.n)).catch(console.dir);

  res.json({
    n: req.params.n,
    data: result,
  });
}) 

app.get("/api/balanceOverview", async (req, res, next) => {
  let totalBalance = 0;
  let accounts = [];

  const balanceDocuments = await getDocuments(MongoDbClient, process.env.DB_NAME, process.env.BALANCE_COLL, 100).catch(console.dir);

  for (const document of balanceDocuments) {
    for (const account of document.accounts) {
      totalBalance += Number(account.balances.current);
      accounts.push([account.name, account.balances.current]);
    }
  }

  res.json({
    totalBalance: totalBalance,
    accounts: accounts,
  })
})

app.listen(process.env.PORT || 8080);
