import "./HeaderStyle.css"
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
    
    // TODO: tmp solution
    let bankList = "JPMorgan Chase Bank, Bank of America, Wells Fargo Bank, Citibank, Goldman Sachs, Morgan Stanley, U.S. Bank, PNC Bank, TD Bank, Capital One, HSBC Bank, Santander Bank, BB&T (now part of Truist), SunTrust (now part of Truist), Regions Bank, Fifth Third Bank, Ally Bank, KeyBank, BMO Harris Bank, Citizens Bank, Comerica Bank, Union Bank, M&T Bank, Huntington Bank, Discover Bank, Charles Schwab Bank, TIAA Bank, First Republic Bank, Santander Bank, Synovus Bank, Frost Bank"


    let finalString = bankList;
    return finalString;
  }

  // returns rendered Header
  return (
    <section class = "HeaderContainer">
        <p id="accountSum"> {getAccountSumString()} </p>
        
        <p id="bankList"> 
          <b> Accounts Connected: </b>
          {getBankNameString()} 
        </p>
    </section>
  )
}

export default Header;