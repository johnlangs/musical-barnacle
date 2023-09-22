import Header from "./Header/Header";
import SpendCatagories from "./Spend Catagories/SpendCatagories"
import TransactionsTable from "./Transactions/TransactionsTable"
import "./MyApp.css"

function MyApp(props) {

  return(
    <div>
      <Header></Header>
      <div class = "global">
        <SpendCatagories></SpendCatagories>
        <TransactionsTable></TransactionsTable>
      </div>
    </div>
  )

}

export default MyApp;