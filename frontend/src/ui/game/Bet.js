import {
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Container,
  Button,
  ButtonGroup,
  makeStyles,
  createTheme,
  MuiThemeProvider,
  Snackbar,
} from '@material-ui/core/';
import MuiAlert from '@mui/material/Alert';
import { red, green, grey } from '@mui/material/colors';
import { useState, useEffect } from 'react/cjs/react.development';
import { useParams } from 'react-router-dom';
import * as mqtt from 'mqtt';
import Cookies from 'js-cookie';
import axios from 'axios';
import { forwardRef } from 'react';

const useStyles = makeStyles({
  dsplInput: {
    display: 'block',
    marginTop: '5px',
  },
  dsplRadio: {
    display: 'inline-block',
  },
});

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

function Bet({ timer }) {
  const [betColor, setBetColor] = useState(null);
  const [coins, setCoins] = useState(0);
  const [focus, setFocus] = useState(false);
  const [newBet, setNewBet] = useState(null);
  const { login } = useParams();
  const classes = useStyles();
  const [open, setOpen] = useState({
    coinsHigherThan0: false,
    pickedColor: false,
    succesfullyPlacedBet: false,
    betPlacedTooLate: false,
    notEnoughCoins: false,
  });

  const addCoins = (value) => {
    !coins
      ? setCoins(parseInt(value))
      : setCoins(parseInt(coins) + parseInt(value));
    setFocus(true);
  };

  const newTheme = createTheme({
    palette: { primary: red, secondary: green, default: grey },
  });
  const brokerAddress = 'localhost:8000/mqtt';

  const placeBet = () => {
    if (coins === undefined || coins === 0)
      setOpen({ ...open, coinsHigherThan0: true });
    else {
      if (betColor === null) setOpen({ ...open, pickedColor: true });
      else {
        if (timer === 'losowanie...')
          setOpen({ ...open, betPlacedTooLate: true });
        else {
          if (coins > Cookies.get(`money${login}`))
            setOpen({ ...open, notEnoughCoins: true });
          else {
            axios
              .post(
                `https://localhost:5000/bets/${Cookies.get(
                  `username${login}`
                )}/game/${Cookies.get('gameId')}`,
                {
                  color: betColor,
                  value: coins,
                }
              )
              .then((value) => {
                setNewBet({ ...value.data, value: coins });
                axios
                  .put('https://localhost:5000/users/', {
                    username: login,
                    money:
                      parseInt(Cookies.get(`money${login}`)) - parseInt(coins),
                  })
                  .then(() => {
                    Cookies.set(
                      `money${login}`,
                      parseInt(Cookies.get(`money${login}`)) - parseInt(coins)
                    );
                  });
              });
            setOpen({ ...open, succesfullyPlacedBet: true });
            setBetColor(null);
            setCoins(0);
          }
        }
      }
    }
  };

  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.subscribe('game/roundHash');
    client.on('message', (topic, message) => {
      Cookies.set('gameId', message.toString());
      axios.get(`https://localhost:5000/users/${login}`).then((value) => {
        Cookies.set(`money${login}`, value.data.money);
      });
    });
    return () => {
      client.end();
    };
  }, []);

  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    if (newBet !== null) {
      client.publish(
        'game/bet',
        JSON.stringify({
          username: Cookies.get(`username${login}`),
          color: newBet.color,
          coins: newBet.value,
        })
      );
    }
    return () => {
      client.end();
    };
  }, [newBet]);

  return (
    <Container>
      <RadioGroup
        className={classes.dsplRadio}
        value={betColor}
        onChange={(event) => setBetColor(event.target.value)}
      >
        <MuiThemeProvider theme={newTheme}>
          <FormControlLabel
            value='red'
            control={<Radio color='primary' />}
            label={`Red X2`}
          />
          <FormControlLabel
            value='green'
            control={<Radio color='secondary' />}
            label='Green X11'
          />
          <FormControlLabel
            value='black'
            control={<Radio color='default' />}
            label='Black X2'
          />
        </MuiThemeProvider>
      </RadioGroup>
      <FormControlLabel
        className={classes.dsplInput}
        control={
          <TextField
            value={coins}
            type='number'
            color='secondary'
            onChange={(event) => setCoins(event.target.value)}
            label='Coins'
            variant='outlined'
            required
            fullWidth
            focused={focus}
          />
        }
      />
      <ButtonGroup color='secondary' variant='outlined'>
        <Button onClick={() => addCoins(1)}>+1</Button>
        <Button onClick={() => addCoins(5)}>+5</Button>
        <Button onClick={() => addCoins(10)}>+10</Button>
        <Button onClick={() => addCoins(100)}>+100</Button>
        <Button onClick={() => addCoins(500)}>+500</Button>
        <Button onClick={() => addCoins(1000)}>+1000</Button>
      </ButtonGroup>
      <ButtonGroup className={classes.dsplInput}>
        <Button
          onClick={() => {
            placeBet();
          }}
          color='secondary'
          variant='contained'
        >
          Place bet
        </Button>
      </ButtonGroup>
      <Snackbar
        open={open.coinsHigherThan0}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, coinsHigherThan0: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, coinsHigherThan0: false })}
          severity='error'
          sx={{ width: '100%' }}
        >
          Coins amount should be higher than 0
        </Alert>
      </Snackbar>
      <Snackbar
        open={open.pickedColor}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, pickedColor: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, pickedColor: false })}
          severity='error'
          sx={{ width: '100%' }}
        >
          You should pick a color before betting
        </Alert>
      </Snackbar>
      <Snackbar
        open={open.succesfullyPlacedBet}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, succesfullyPlacedBet: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, succesfullyPlacedBet: false })}
          severity='success'
          sx={{ width: '100%' }}
        >
          You've successfully placed your bet
        </Alert>
      </Snackbar>
      <Snackbar
        open={open.betPlacedTooLate}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, betPlacedTooLate: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, betPlacedTooLate: false })}
          severity='error'
          sx={{ width: '100%' }}
        >
          Too late!
        </Alert>
      </Snackbar>
      <Snackbar
        open={open.notEnoughCoins}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, notEnoughCoins: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, notEnoughCoins: false })}
          severity='error'
          sx={{ width: '100%' }}
        >
          You don't have enough coins
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Bet;
