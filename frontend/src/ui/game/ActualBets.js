import { Container, Typography, Button, Snackbar } from '@material-ui/core';
import MuiAlert from '@mui/material/Alert';
import * as mqtt from 'mqtt';
import { useEffect, useState, forwardRef } from 'react';
import * as axios from 'axios';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import * as _ from 'lodash';
const brokerAddress = 'localhost:8000/mqtt';

function ActualBets({ timer }) {
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [black, setBlack] = useState(0);
  const { login } = useParams();
  const [cannotDelete, setCannotDelete] = useState(false);
  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
  });

  const deleteBet = (color) => {
    if (timer === 'losowanie...') setCannotDelete(true);
    else {
      axios
        .delete(
          `https://localhost:5000/bets/${login}/game/${Cookies.get(
            'gameId'
          )}/${color}`
        )
        .then((value) => {
          const client = mqtt.connect(`mqtt://${brokerAddress}`);
          client.publish(
            'game/delete/bet',
            JSON.stringify({ username: login, color: color })
          );
          axios.put('https://localhost:5000/users/', {
            username: login,
            money:
              parseInt(Cookies.get(`money${login}`)) +
              parseInt(
                color === 'red' ? red : color === 'green' ? green : black
              ),
          });
          Cookies.set(
            `money${login}`,
            parseInt(Cookies.get(`money${login}`)) +
              parseInt(
                color === 'red' ? red : color === 'green' ? green : black
              )
          );
          color === 'red'
            ? setRed(0)
            : color === 'green'
            ? setGreen(0)
            : setBlack(0);
        });
    }
  };

  useEffect(() => {
    setRed(0);
    setGreen(0);
    setBlack(0);
  }, [Cookies.get('gameId')]);

  useEffect(() => {
    axios
      .get(`https://localhost:5000/bets/${Cookies.get('gameId')}`)
      .then((value) => {
        setRed(
          !_.isEmpty(
            value.data
              .filter((el) => el.bet.color === 'red' && el.user === login)
              .map((el) => el.bet.value)
          )
            ? value.data
                .filter((el) => el.bet.color === 'red' && el.user === login)
                .map((el) => el.bet.value)
            : 0
        );
        setGreen(
          !_.isEmpty(
            value.data
              .filter((el) => el.bet.color === 'green' && el.user === login)
              .map((el) => el.bet.value)
          )
            ? value.data
                .filter((el) => el.bet.color === 'green' && el.user === login)
                .map((el) => el.bet.value)
            : 0
        );
        setBlack(
          !_.isEmpty(
            value.data
              .filter((el) => el.bet.color === 'black' && el.user === login)
              .map((el) => el.bet.value)
          )
            ? value.data
                .filter((el) => el.bet.color === 'black' && el.user === login)
                .map((el) => el.bet.value)
            : 0
        );
      });
  }, []);

  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.subscribe('game/bet');
    client.on('message', (topic, message) => {
      axios
        .get(`https://localhost:5000/bets/${Cookies.get('gameId')}`)
        .then((value) => {
          setRed(
            !_.isEmpty(
              value.data
                .filter((el) => el.bet.color === 'red' && el.user === login)
                .map((el) => el.bet.value)
            )
              ? value.data
                  .filter((el) => el.bet.color === 'red' && el.user === login)
                  .map((el) => el.bet.value)
              : 0
          );
          setGreen(
            !_.isEmpty(
              value.data
                .filter((el) => el.bet.color === 'green' && el.user === login)
                .map((el) => el.bet.value)
            )
              ? value.data
                  .filter((el) => el.bet.color === 'green' && el.user === login)
                  .map((el) => el.bet.value)
              : 0
          );
          setBlack(
            !_.isEmpty(
              value.data
                .filter((el) => el.bet.color === 'black' && el.user === login)
                .map((el) => el.bet.value)
            )
              ? value.data
                  .filter((el) => el.bet.color === 'black' && el.user === login)
                  .map((el) => el.bet.value)
              : 0
          );
        });
    });
    return () => {
      client.end();
    };
  }, []);

  return (
    <Container
      style={{
        border: '1px solid rgb(245, 0, 87)',
        position: 'absolute',
        top: '80px',
        left: '10px',
        width: '300px',
        height: 'auto',
        borderRadius: '20px',
      }}
    >
      <Snackbar
        open={cannotDelete}
        autoHideDuration={6000}
        onClose={() => setCannotDelete(false)}
      >
        <Alert
          onClose={() => setCannotDelete(false)}
          severity='error'
          sx={{ width: '100%' }}
        >
          Too late!
        </Alert>
      </Snackbar>
      <Typography style={{ color: 'rgb(245, 0, 87)' }} variant='h5'>
        {' '}
        Your bets:
      </Typography>
      <Typography
        style={{ color: 'red', textAlign: 'start', display: 'inline-block' }}
      >
        Red: {red}
      </Typography>
      {red !== 0 ? (
        <Button
          onClick={() => deleteBet('red')}
          style={{ margin: '5px' }}
          variant='outlined'
          color='secondary'
        >
          delete bet
        </Button>
      ) : (
        ''
      )}{' '}
      <br />
      <Typography
        style={{ color: 'green', textAlign: 'start', display: 'inline-block' }}
      >
        Green: {green}
      </Typography>
      {green !== 0 ? (
        <Button
          onClick={() => deleteBet('green')}
          style={{ margin: '5px' }}
          variant='outlined'
          color='secondary'
        >
          delete bet
        </Button>
      ) : (
        ''
      )}
      <br />
      <Typography
        style={{ color: 'black', textAlign: 'start', display: 'inline-block' }}
      >
        Black: {black}
      </Typography>
      {black !== 0 ? (
        <Button
          onClick={() => deleteBet('black')}
          style={{ margin: '5px' }}
          variant='outlined'
          color='secondary'
        >
          delete bet
        </Button>
      ) : (
        ''
      )}
      <br />
    </Container>
  );
}

export default ActualBets;
