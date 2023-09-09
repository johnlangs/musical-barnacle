import React, { useState, useCallback, useEffect } from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer} from "recharts";
import { Flex, Card, Table, TableBody, TableRow, TableCell, Grid, Box } from "@radix-ui/themes";

function SpendCategories(props) {
  const [loading, setLoading] = useState(true);
  const [spending, setSpending] = useState(null);
  const [categoryCount, setCategoryCount] = useState(0);

   const getSpending = React.useCallback(async () => {
    setLoading(true)
    const response = await fetch("/api/categorySpending", {});
    const data = await response.json();
    setSpending(data.category_expenditures);
    setCategoryCount(data.number_of_categories);
    setLoading(false);
  }, []);

  useEffect(() => {
    getSpending();
  },[])

  const data = [
    { name: 'Group A', value: 400, hex: '#'},
    { name: 'Group B', value: 300, hex: '#'},
    { name: 'Group C', value: 300, hex: '#'},
    { name: 'Group D', value: 200, hex: '#'},
    { name: 'Group E', value: 200, hex: '#'},
    { name: 'Group F', value: 200, hex: '#'},
    { name: 'Group G', value: 200, hex: '#'},
    { name: 'Group H', value: 200, hex: '#'},
    { name: 'Group I', value: 200, hex: '#'},
    { name: 'Group J', value: 200, hex: '#'},
    { name: 'Group K', value: 200, hex: '#'},
    { name: 'Group L', value: 200, hex: '#'},
    { name: 'Group M', value: 200, hex: '#'},
    { name: 'Group N', value: 200, hex: '#'},
    { name: 'Group O', value: 200, hex: '#'},
    { name: 'Group P', value: 200, hex: '#'},
  ];

  const COLORS = ['#C087E8', '#B694FF', '#E887CF', '#FF94AE'];

  const onMouseEnterHandleSegment = () => {

  }

  return (
    <Card style={{ height:""}}>
        <Grid columns={{initial: '1', md:'2'}} gap="3" width="100%">
          <Box height="100%">
            <ResponsiveContainer width="100%" height="100%" minHeight="350px" minWidth="350px" style={{margin: "0px"}}>
            <PieChart width={100} height={100}>
                  <Pie
                    onMouseEnter={onMouseEnterHandleSegment()}
                    data={data}
                    cx={"50%"}
                    cy={"50%"}
                    innerRadius={"85%"}
                    outerRadius={"100%"}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-{index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
            </PieChart> 
            </ResponsiveContainer>
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
                !loading && data != null 
                ? data.map((data) => 
                <TableRow>
                  {<TableCell>{}</TableCell>}
                  {<TableCell>{data.name}</TableCell>}
                  {<TableCell>{data.value}</TableCell>}
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