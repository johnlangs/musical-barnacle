import React, { useState, useEffect} from "react";
import { Button, Card, DropdownMenu, DropdownMenuTrigger } from "@radix-ui/themes";
import "./HeaderStyle.css"
import "../Context/Context";

// contains the sum of all accounts, banks info is pulled from with info button, and selector
function Header(props) {
  const [balance, setBalance] = useState();
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
  }, [setBalance]);

  // gets the string of banks, displayed under total sum
  const getBankNameString = React.useCallback(async () => {
    setLoading(true);
    
    const response = await fetch("/api/accountsList", {});
    const data = await response.json();
    console.log(data);

    setAccounts(data.accounts.map((item) => item.name).join(", "));

    setLoading(false);
  }, [setAccounts]);

  useEffect(() => {
    if (balance == null) {
      getAccountSum();
    }
    if (accounts == null) {
      getBankNameString();
    }
  }, [accounts, balance, getAccountSum, getBankNameString]); 

  // returns rendered Header
  return (
    <section class = "HeaderContainer">
      <p id="accountSum">
        {!loading && balance != null 
          ?  balance
          :  "$ Loading . . ."
        }
      </p>
      <p id="bankList"> 
        <b> Accounts Connected: </b>
          { //TODO: check that the style is correct with this
            !loading && accounts != null 
            ? accounts
            : "Loading . . ."
          }
      </p>
      
      <Card id = "cardSelector">
          <DropdownMenu.Root>
            <DropdownMenuTrigger>
              <Button class="dialogButton">
                <p>Filter</p>
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu.Root>
          <DropdownMenu.Root>
            <DropdownMenuTrigger>
              <Button class="dialogButton">
                <p> sort </p>
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu.Root>
      </Card>
    </section>
  )
}

export default Header;