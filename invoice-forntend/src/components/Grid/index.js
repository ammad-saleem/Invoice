import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export default function RowAndColumnSpacing({ data }) {
    console.log(data)
    return (
        <Box sx={{ width: '100%' }}>

           {data?.map((patient,index)=>{
              return(
               <Grid item xs={2} sm={4} md={4} key={index}>
                   <Item>{patient.patientName}</Item>
               </Grid>
              )
           }) 
        }

        </Box>
    );
}
