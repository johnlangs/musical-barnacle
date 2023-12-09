import React, { useState, useCallback, useEffect } from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer} from "recharts";
import { Flex, Card, Table, TableBody, TableRow, TableCell, Grid, Box, Avatar } from "@radix-ui/themes";

function SpendCategories(props) {
  const [loading, setLoading] = useState(true);
  const [spending, setSpending] = useState(null);

   const getSpending = React.useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/categorySpending", {});
    const data = await response.json();
    setSpending([
      {name: 'Bank fees',               value: data.BANK_FEES                 ,  hex: '#9c27b0'},
      {name: 'Entertainment',           value: data.ENTERTAINMENT             ,  hex: '#2196f3'},
      {name: 'Food & Drink',            value: data.FOOD_AND_DRINK            ,  hex: '#009688'},
      {name: 'General merchandise',     value: data.GENERAL_MERCHANDISE       ,  hex: '#cddc39'},
      {name: 'General services',        value: data.GENERAL_SERVICES          ,  hex: '#ff9800'},
      {name: 'Government & non-profit', value: data.GOVERNMENT_AND_NON_PROFIT ,  hex: '#e81e63'},
      {name: 'Home improvement',        value: data.HOME_IMPROVEMENT          ,  hex: '#3f51b5'},
      {name: 'Income',                  value: data.INCOME                    ,  hex: '#00bcd4'},
      {name: 'Loan payments',           value: data.LOAN_PAYMENTS             ,  hex: '#8bc34a'},
      {name: 'Medical',                 value: data.MEDICAL                   ,  hex: '#ffc107'},
      {name: 'Personal care',           value: data.PERSONAL_CARE             ,  hex: '#f44336'},
      {name: 'Rent & utilties',         value: data.RENT_AND_UTILITIES        ,  hex: '#673ab7'},
      {name: 'Transfer in',             value: data.TRANSFER_IN               ,  hex: '#03a9f4'},
      {name: 'Transfer out',            value: data.TRANSFER_OUT              ,  hex: '#4caf50'},
      {name: 'Transportation',          value: data.TRANSPORTATION            ,  hex: '#ffeb3b'},
      {name: 'Travel',                  value: data.TRAVEL                    ,  hex: '#ff5722'},
    ]);
    setLoading(false);
  }, [spending, setSpending]);

  const getColorSwab = (hex) => {
    return(
      <Avatar style={{backgroundColor: hex}}>
      </Avatar>
    )
  }

  useEffect(() => {
    if (spending == null)
    {
      getSpending();
    }
  },[]);


  const onMouseEnterHandleSegment = () => {

  }

  return (
    <Card style={{ height:""}}>
        <p class = "cardTitle">Spending By Category</p>
        <Grid columns={{initial: '1', md:'2'}} gap="3" width="100%">
          <Box height="100%">
            {
            !loading && spending != null ?
            <ResponsiveContainer width="100%" height="100%" minHeight="350px" minWidth="350px" style={{margin: "0px"}}>
              <PieChart width={100} height={100}>
                <Pie
                  onMouseEnter={onMouseEnterHandleSegment()}
                  data={spending.filter(function (item) {return item.value > 0})}
                  cx={"50%"}
                  cy={"50%"}
                  innerRadius={"85%"}
                  outerRadius={"100%"}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {spending.filter(function (item) {return item.value > 0}).map((entry) => (
                    <Cell key={`cell-{index}`} fill={entry.hex} />
                  ))}
                </Pie>
              </PieChart> 
            </ResponsiveContainer>
            : "Loading . . ."
            }
          </Box>

          <Box height="100%">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>$</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
              { 
                !loading && spending != null 
                ? spending.filter(function (item) {return item.value > 0}).map((data) => 
                <TableRow>
                  {<TableCell>{getColorSwab(data.hex)}</TableCell>}
                  {<TableCell>{data.name}</TableCell>}
                  {<TableCell>{data.value.toFixed(2)}</TableCell>}
                  </TableRow>
                )
                : "Loading . . ."
              }
              </Table.Body>
            </Table.Root>
          </Box>
        </Grid>
    </Card>
  )

}

export default SpendCategories;