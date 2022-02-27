import Cookies from 'js-cookie';
import * as mqtt from 'mqtt';
import { useState } from 'react';
import { useEffect } from 'react/cjs/react.development';
import Bet from './Bet';
import PlacedBets from './PlacedBets';
import { useParams } from 'react-router-dom';
import Roulette from './Roulette';
import Navbar from '../Navbar';
import { Chip } from '@material-ui/core';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import ActualBets from './ActualBets';

function Game() {
  const brokerAddress = 'localhost:8000/mqtt';
  const [timer, setTimer] = useState(null);
  const [winningColor, setWinnigColor] = useState(null);
  const [winningNumber, setWinningNumber] = useState(null);
  const { login } = useParams();

  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.subscribe('game/#', () => {
      client.on('message', (topic, message) => {
        if (topic === 'game/timer') setTimer(message.toString());
      });
    });
    client.on('message', (topic, message) => {
      if (topic === 'game/result') {
        setWinnigColor(JSON.parse(message.toString()).color);
        setWinningNumber(JSON.parse(message.toString()).number);
      }
    });
    return () => {
      client.end();
    };
  });

  return (
    <div>
      <ActualBets timer={timer} />
      <Navbar login={login} />
      <Chip
        color='secondary'
        style={{ margin: '10px' }}
        label={`Round hash: ${Cookies.get('gameId')}`}
      />
      <Roulette timer={timer} number={winningNumber} />
      <Chip
        color='secondary'
        style={{ margin: '10px', fontSize: '20px', padding: '5px' }}
        label={`Next round: ${
          timer === 'losowanie...' ? 'Wait for result' : timer + 's'
        }`}
      />
      <br />
      <Chip
        style={{
          padding: '10px',
          border: '1px solid rgb(245, 0, 87)',
          color: 'rgb(245, 0, 87)',
        }}
        avatar={
          <MonetizationOnOutlinedIcon
            fontSize='large'
            style={{ color: 'rgb(245, 0, 87)' }}
          />
        }
        variant='outlined'
        label={`${Cookies.get(`money${login}`)}`}
      />
      <Bet timer={timer} />
      <PlacedBets />
    </div>
  );
}

export default Game;
