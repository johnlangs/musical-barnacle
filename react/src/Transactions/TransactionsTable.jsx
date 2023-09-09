import React, { useState, useEffect } from "react";
import { Card,Table, TableBody, TableCell} from "@radix-ui/themes"


function TransactionsTable(props) {

  const[loading, setLoading] = useState(true);
  const[transactions, setTransactions] = useState({
    amount: 0,
    date: "",
    category: "",
    accountID: "",
    merchant_name: ""
  });
  
  // sets transactions to transactions state, ignoring other 
  const getTransactionsOnly = React.useCallback(async () => {
    setLoading(true)
    const response = await fetch("/api/transactions", {});
    const data = await response.json();
    setTransactions(data.transactions);
    setLoading(false);
  }, []);

  useEffect(() => {
      getTransactionsOnly();
  },[])
  //TODO: remove tmp
  
  return (
    <Card>
      {
        console.log(transactions)
      }
      <>Transactions</>
      <Table.Root>
        <Table.Header>
          <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
        </Table.Header>
        <TableBody>
          {
            transactions.map = (transactions) => {
              <TableCell></TableCell>
            }
          }
        </TableBody>
        <Table.Row>

        </Table.Row>
      </Table.Root>
    </Card>
  )
}

export default TransactionsTable;