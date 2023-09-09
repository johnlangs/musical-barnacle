import React, { useState, useEffect } from "react";
import { Card,Table, TableBody, TableCell, TableRow, TableRowHeaderCell} from "@radix-ui/themes"


function TransactionsTable(props) {

  const[loading, setLoading] = useState(true);
  const[transactions, setTransactions] = useState({
    amount: 0,
    date: "",
    category: "",
    account_id: "",
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
            !loading && transactions != null 
            ? transactions.map((item) => 
            <TableRow>
              {<TableCell>{item.amount}</TableCell>}
              {<TableCell>{item.account_id}</TableCell>}
              {<TableCell>{item.date}</TableCell>}
              </TableRow>
            )
            : "Loading . . ."
          }
        </TableBody>
        <Table.Row>

        </Table.Row>
      </Table.Root>
    </Card>
  )
}

export default TransactionsTable;