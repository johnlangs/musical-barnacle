import React from "react";
import "../Context/Context";

// contains the sum of all accounts, banks info is pulled from with info button, and selector
function Header(props) {

  // gets the total of all credits and debts
  function getAccountSum() {
    let totalBalance = 0;
    return totalBalance;
  }

  // gets the string of banks, displayed under total sum
  function getBankNameString() {
    let finalString = "tmp";
    return finalString;
  }

  // returns rendered Header
  return (
    <p>{getAccountSum()}</p>
  )
}

// export single function from script
export default Header;