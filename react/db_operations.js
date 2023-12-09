/**
 * @file Assumes an valid mongodb client with direct connection
 */

const { MongoClient, FindCursor } = require("mongodb");

/**
 * Ping a given database through a given client
 * @param {import("mongodb").MongoClient} client 
 * @param {string} database
 */
async function pingDB(client, database) 
{
    await client.connect();
    await client.db(database).command({ ping: 1 });
    console.log(`Successful Ping at ${process.env.MONGODB_URI}`);
}

/**
 * Insert a document given a client object, and database and collection string name
 * @param {import("mongodb").MongoClient} client 
 * @param {string} database
 * @param {string} collection 
 * @param {object} doc  
 */
async function insertDoc(client, database, collection, doc) 
{
    await client.connect();
    const result = await client.db(database).collection(collection).insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
}

/**
 * Get a specific number of documents from a collection, in index order
 * @param {import("mongodb").MongoClient} client 
 * @param {string} database 
 * @param {string} collection
 * @param {number} n 
 * @param {boolean} [oldest_first=false] 
 * @returns {Array<import("plaid").Transaction>}
 */
async function getDocuments(client, database, collection, n, oldest_first=false)
{
  let docs = [];
    await client.connect();

    if (n === -1)
      docs = await client.db(database).collection(collection).find().sort({ date: oldest_first ? 1 : -1 }).toArray();
    else
      docs = await client.db(database).collection(collection).find().sort({ date: oldest_first ? 1 : -1 }).limit(n).toArray();

    return docs;
}

/**
 * Update a transaction collection given arrays of added, modified, and removed transactions
 * @param {import("mongodb").MongoClient} client 
 * @param {string} database
 * @param {string} collection 
 * @param {Array<import("plaid").Transaction>} added  
 * @param {Array<import("plaid").Transaction>} modified 
 * @param {Array<import("plaid").Transaction>} deleted 
 */
async function updateTransactionsDb(client, database, collection, added, modified, removed)
{

    await client.connect();
    const coll = client.db(database).collection(collection);    

    // Insert transaction Docs that have marked as so by the sync
    if (added.length > 0)
      await addTransactions(coll, added).catch(console.dir);

    // Modify transaction Docs that have marked as so by the sync
    if (modified.length > 0)
      await modifyTransactions(coll, modified).catch(console.dir);

    // Delete transaction Docs that have marked as so by the sync
    if (removed.length > 0)
      await removeTransactions(coll, removed).catch(console.dir);
}

/**
 * Add transactions to a collection
 * @param {Collection<Document>} coll
 * @param {Array<import("plaid").Transaction>} added
 */
async function addTransactions(coll, added)
{
  const result = await coll.insertMany(added);
  if (result.insertedCount === added.length)
  {
    console.log(`Added ${result.insertedCount} transactions to ${coll.namespace}`);
  }
  else
  {
    console.log(`Failed to add ${added.length - result.insertedCount} transactions in ${coll.namespace}`);
  }
}

/**
 * Modify transactions in a collection
 * @param {Collection<Document>} coll
 * @param {Array<import("plaid").Transaction>} modified
 */
async function modifyTransactions(coll, modified)
{
  const result = await coll.updateMany(modified);
  if (result.insertedCount === modified.length)
  {
    console.log(`Modified ${result.insertedCount} transactions in ${coll.namespace}`);
  }
  else
  {
    console.log(`Failed to modify ${modified.length - result.insertedCount} transactions in ${coll.namespace}`);
  }
}

/**
 * Remove transactions from a collection
 * @param {Collection<Document>} coll
 * @param {Array<import("plaid").Transaction>} removed
 */
async function removeTransactions(coll, removed)
{
  const result = await coll.deleteMany(removed);
  if (result.insertedCount === removed.length)
  {
    console.log(`Removed ${result.insertedCount} transactions from ${coll.namespace}`);
  }
  else
  {
    console.log(`Failed to remove ${removed.length - result.insertedCount} transactions from ${coll.namespace}`);
  }
}


module.exports = {pingDB, insertDoc, updateTransactionsDb, getDocuments};
