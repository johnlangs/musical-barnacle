/*
server.js – Configures the Plaid client and uses Express to defines routes that call Plaid endpoints in the Sandbox environment.Utilizes the official Plaid node.js client library to make calls to the Plaid API.
*/

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const { pingDB, insertDoc, updateTransactionsDb, getDocuments } = require("./db_operations.js");
const app = express();

const fs = require('fs');
const account_balances = JSON.parse(fs.readFileSync("./dummy-json/account_balances.json"));
const accounts_list = JSON.parse(fs.readFileSync("./dummy-json/accounts_list.json"));
const category_spending = JSON.parse(fs.readFileSync("./dummy-json/category_spending.json"));
const total_balance = JSON.parse(fs.readFileSync("./dummy-json/total_balance.json"));
const transactions_ex = JSON.parse(fs.readFileSync("./dummy-json/transactions.json"));

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
  });
  res.json(tokenResponse.data);
});

// Exchanges the public token from Plaid Link for an access token
app.post("/api/exchange_public_token", async (req, res, next) => {
  const exchangeResponse = await PlaidClient.itemPublicTokenExchange({
    public_token: req.body.public_token,
  });
  await insertDoc(MongoDbClient, process.env.DB_NAME, process.env.TOKENS_COLL, exchangeResponse.data).catch(console.dir);

  const balanceResponse = await PlaidClient.accountsBalanceGet({
    access_token: exchangeResponse.data.access_token,
  });
  for (const account of balanceResponse.data.accounts) {
    await insertDoc(MongoDbClient, process.env.DB_NAME, process.env.ACCOUNTS_COLL, account).catch(console.dir);
  }

  const transactionResponse = await PlaidClient.transactionsSync({
    access_token: exchangeResponse.data.access_token,
    options: {include_personal_finance_category: true}
  });
  await updateTransactionsDb(
    MongoDbClient, 
    process.env.DB_NAME, 
    process.env.TRANSACTIONS_COLL, 
    transactionResponse.data.added,
    transactionResponse.data.modified,
    transactionResponse.data.removed
    ).catch(console.dir);

  res.json(true);
});

app.get("/api/accountsList", async (req, res, next) => {
  let accounts = [];
  let totalBalance = 0;
  const docs = await getDocuments(MongoDbClient, process.env.DB_NAME, process.env.ACCOUNTS_COLL, -1);

  for (const doc of docs) {
    accounts.push({name: doc.name, account_id: doc.account_id, balance: doc.balances.current});
    totalBalance += Number(doc.balances.current);
  }

  res.json({
    balance: totalBalance,
    accounts: accounts,
    generated_at: "test-te-st"
  })
});

app.get("/api/categorySpending", async (req, res, next) => {
  const docs = await getDocuments(MongoDbClient, process.env.DB_NAME, process.env.TRANSACTIONS_COLL, -1);

  let categories = 
  {
    "BANK_FEES"                 :0,
    "ENTERTAINMENT"             :0,
    "FOOD_AND_DRINK"            :0,
    "GENERAL_MERCHANDISE"       :0,
    "GENERAL_SERVICES"          :0,
    "GOVERNMENT_AND_NON_PROFIT" :0,
    "HOME_IMPROVEMENT"          :0,
    "INCOME"                    :0,
    "LOAN_PAYMENTS"             :0,
    "MEDICAL"                   :0,
    "PERSONAL_CARE"             :0,
    "RENT_AND_UTILITIES"        :0,
    "TRANSFER_IN"               :0,
    "TRANSFER_OUT"              :0,
    "TRANSPORTATION"            :0,
    "TRAVEL"                    :0
  }

  for (const doc of docs) {
    categories[doc.personal_finance_category.primary] += doc.amount;
  }

  res.json(categories);
});

app.get("/api/transactions", async (req, res, next) => {
   const docs = await getDocuments(MongoDbClient, process.env.DB_NAME, process.env.TRANSACTIONS_COLL, -1);

  let transactions = [];
  for (const doc of docs) {
    let account_name = "";
    try
    {
      await MongoDbClient.connect();
      let account = await MongoDbClient.db(process.env.DB_NAME).collection(process.env.ACCOUNTS_COLL).findOne({account_id: {$eq: doc.account_id}});
      account_name = account.name;
    }
    finally
    {
      await MongoDbClient.close();
    }

    transactions.push({
      date: doc.date,
      amount: doc.amount,
      account: account_name,
      account_id: doc.account_id,
      category: doc.personal_finance_category.primary,
      merchant_name: doc.merchant_name
    })
  }

  res.json({
    number_of_transactions: transactions.length,
    transactions: transactions,
    generated_at: "test-te-st"
  });
});

app.listen(process.env.PORT || 8080);
