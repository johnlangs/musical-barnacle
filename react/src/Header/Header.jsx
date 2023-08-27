import React, { useState, useEffect, useCallback } from "react";
import "./HeaderStyle.css"
import "../Context/Context";

// contains the sum of all accounts, banks info is pulled from with info button, and selector
function Header(props) {
  const [balance, setBalance] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(true);

  // gets the total of all credits and debts
  const getAccountSum = React.useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/totalBalance", {});
    const data = await response.json();
    console.log(data);
    let balance = data.amount;
    balance = "$ " + balance.toLocaleString();
    setBalance(balance);
    setLoading(false);
  }, [setBalance, setLoading]);


  // gets the string of banks, displayed under total sum
  const getBankNameString = React.useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/accountsList");
    const data = await response.json();
    console.log(data);
    const accounts = data.accounts_names_list.join(", ");
    setAccounts(accounts);
    setLoading(false);
  }, [setAccounts, setLoading]);

  useEffect(() => {
    if (balance == null) {
      getAccountSum();
    }
    if (accounts == null) {
      getBankNameString();
    }
  }, [accounts, balance, getAccountSum, getBankNameString, setLoading])

  // returns rendered Header
  return (
    <section class = "HeaderContainer">
      {!loading && balance != null &&
        (<p id="accountSum"> {balance} </p>)
      }
      {!loading && accounts != null &&
        (<p id="bankList"> <b> Accounts Connected: </b> {accounts} </p>)
      }
    </section>
  )
}

export default Header;