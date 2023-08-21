/*
server.js – Configures the Plaid client and uses Express to defines routes that call Plaid endpoints in the Sandbox environment.Utilizes the official Plaid node.js client library to make calls to the Plaid API.
*/

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const app = express();

const fs = require('fs');
const account_balances = JSON.parse(fs.readFileSync("./dummy-json/account_balances.json"));
const accounts_list = JSON.parse(fs.readFileSync("./dummy-json/accounts_list.json"));
const category_spending = JSON.parse(fs.readFileSync("./dummy-json/category_spending.json"));
const total_balance = JSON.parse(fs.readFileSync("./dummy-json/total_balance.json"));
const transactions = JSON.parse(fs.readFileSync("./dummy-json/transactions.json"));

app.use(
  // FOR DEMO PURPOSES ONLY
  // Use an actual secret key in production
  session({ secret: "bosco", saveUninitialized: true, resave: true })
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
const client = new PlaidApi(config);

//Creates a Link token and return it
app.get("/api/create_link_token", async (req, res, next) => {
  const tokenResponse = await client.linkTokenCreate({
    user: { client_user_id: req.sessionID },
    client_name: "Plaid's Tiny Quickstart",
    language: "en",
    products: ["auth"],
    country_codes: ["US"],
    redirect_uri: process.env.PLAID_SANDBOX_REDIRECT_URI,
  });
  res.json(tokenResponse.data);
});

// Exchanges the public token from Plaid Link for an access token
app.post("/api/exchange_public_token", async (req, res, next) => {
  const exchangeResponse = await client.itemPublicTokenExchange({
    public_token: req.body.public_token,
  });

  // FOR DEMO PURPOSES ONLY
  // Store access_token in DB instead of session storage
  req.session.access_token = exchangeResponse.data.access_token;
  res.json(true);
});

app.get("/api/accountBalances", (req, res, next) => {
  res.json(account_balances);
})

app.get("/api/accountsList", async (req, res, next) => {
  res.json(accounts_list);
});

app.get("/api/categorySpending", async (req, res, next) => {
  res.json(category_spending);
});

app.get("/api/totalBalance", async (req, res, next) => {
  res.json(total_balance);
});

app.get("/api/transactions", async (req, res, next) => {
  res.json(transactions);
});

app.listen(process.env.PORT || 8080);
