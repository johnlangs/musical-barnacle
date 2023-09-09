import Header from "./Header/Header";
import TransactionsTable from "./Transactions/TransactionsTable"
import "./MyApp.css"

function MyApp(props) {

  return(
    <div>
      <Header></Header>
      <div class = "Padding">
        <TransactionsTable></TransactionsTable>
      </div>
    </div>
  )
  
}

export default MyApp;