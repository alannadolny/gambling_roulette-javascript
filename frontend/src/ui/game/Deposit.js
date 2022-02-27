import Navbar from '../Navbar';
import { useParams } from 'react-router-dom';
import { Container, TextField, Typography, Button } from '@material-ui/core';
import Cookies from 'js-cookie';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useState } from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function Deposit() {
  const { login } = useParams();
  const [succ, setSucc] = useState(<div></div>);
  const [addMoney, setAddMoney] = useState(null);
  const addCoins = (v) => {
    if (v <= 0 || v === null)
      setSucc(
        <Alert severity='error'>
          <AlertTitle>Error</AlertTitle>
          Coins quantity must be <strong> higher</strong> than 0
        </Alert>
      );
    else
      axios
        .put('https://localhost:5000/users/', {
          username: login,
          money: parseInt(Cookies.get(`money${login}`)) + parseInt(v),
        })
        .then((value) => {
          Cookies.set(`money${login}`, parseInt(value.data.money));
          setSucc(
            <Alert severity='success'>
              <AlertTitle>Success</AlertTitle>
              Successfully added <strong> +{parseInt(v)}</strong> coins!
            </Alert>
          );
        });
  };

  return (
    <div>
      <Navbar login={login} />
      {succ}
      <Container>
        <Typography variant='h2' color='secondary'>
          Add coins
        </Typography>
        <br />
        <Typography style={{ margin: '10px' }} variant='h5' color='secondary'>
          Choose coins amount:
        </Typography>
        <TextField
          onChange={(e) => setAddMoney(e.target.value)}
          style={{ width: '200px' }}
          label='coins'
          type='number'
          variant='outlined'
          color='secondary'
        />
      </Container>
      <Button
        type='submit'
        onClick={() => addCoins(addMoney)}
        style={{ marginTop: '10px', width: '200px' }}
        variant='outlined'
        color='secondary'
      >
        Deposit
      </Button>
    </div>
  );
}

export default Deposit;
