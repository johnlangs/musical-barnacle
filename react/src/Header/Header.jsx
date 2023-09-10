import React, { useState, useEffect} from "react";
import { Button, Card, DropdownMenu, DropdownMenuTrigger } from "@radix-ui/themes";
import "./HeaderStyle.css"
import "../Context/Context";
import SignIn from "../Sign In/SignIn";

// contains the sum of all accounts, banks info is pulled from with info button, and selector
function Header(props) {
  const [balance, setBalance] = useState();
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(true);

  // gets the string of banks, displayed under total sum
  const getBankNameString = React.useCallback(async () => {
    setLoading(true);
    
    const response = await fetch("/api/accountsList", {});
    const data = await response.json();
    console.log(data);

    setAccounts(data.accounts.map((item) => item.name).join(", "));
    
    let balance = data.balance;
    balance = "$ " + balance.toLocaleString();
    setBalance(balance);

    setLoading(false);
  }, [setAccounts, setBalance]);

  useEffect(() => {
    if (accounts == null && balance == null) {
      getBankNameString();
    }
  }, [accounts, balance, getBankNameString]); 

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
      
      <SignIn></SignIn>
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