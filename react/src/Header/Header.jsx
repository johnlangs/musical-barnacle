import "./Header.css"
import "../Context/Context";

// contains the sum of all accounts, banks info is pulled from with info button, and selector
function Header(props) {

  // gets the total of all credits and debts
  function getAccountSumString() {
    
    //TODO: tmp solution
    let totalBalance = 88888888

    // formats commas to match local string
    totalBalance = totalBalance.toLocaleString()
    
    // auto formats to "$ -value" if negitive
    return "$ " + totalBalance;
  }

  // gets the string of banks, displayed under total sum
  function getBankNameString() {
    let finalString = "tmp";
    return finalString;
  }

  // returns rendered Header
  return (
    <div id="background">
      <p id="accountSum"> {getAccountSumString()} </p>
    </div>
  )
}

// export single function from script
export default Header;