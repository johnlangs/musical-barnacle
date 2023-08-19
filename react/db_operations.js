
/**
 * 
 * @param {MongoClient} client 
 */
async function pingDB(client) 
{
    try 
    {
      await client.connect();
      await client.db("admin").command({ ping: 1 });
      console.log(`Successful Ping at ${process.env.MONGODB_URI}`);
    } 
    finally 
    {
      await client.close();
    }
}

/**
 * Insert a document  
 * @param {import("mongodb").MongoClient} client 
 * @param {string} database
 * @param {string} collection 
 * @param {object} doc  
 */
async function insertDoc(client, database, collection, doc) 
{
  try 
  {
    await client.connect();
    const result = await client.db(database).collection(collection).insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } 
  finally 
  {
    await client.close();
  }
}

/**
 * Insert a document  
 * @param {MongoClient} client 
 * @param {string} database
 * @param {string} collection
 */
async function getHighestIndex(client, database, collection) 
{
  try 
  {
    await client.connect();

    const db = client.db(database);
    const coll = db.collection(collection);

    // Perhaps indexing would be best on larger collections
    const result = await coll.find().sort({ $natural: -1 }).limit(1).toArray();
    //const result = await coll.find().min("_id").hint("_id_").limit(1).toArray();

    return result
  } 
  finally 
  {
    await client.close();
  }
}

/**
 * Update a transaction collection given arrays of added, modified, and removed transactions
 * @param {MongoClient} client 
 * @param {string} database
 * @param {string} collection 
 * @param {Array<import("plaid").Transaction>} added  
 * @param {Array<import("plaid").Transaction>} modified 
 * @param {Array<import("plaid").Transaction>} deleted 
 */
async function updateAccountTransactionsDb(client, database, collection, added, modified, removed)
{
  try
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
  finally
  {
    client.close();
  }
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
 * Modify transaction in a collection
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
 * Remove transaction from a collection
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

module.exports = {pingDB, insertDoc, getHighestIndex, updateAccountTransactionsDb};
