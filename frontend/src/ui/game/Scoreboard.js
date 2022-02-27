import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import Navbar from '../Navbar';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Container, Typography } from '@material-ui/core';
import { Bar as BarJS } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react/cjs/react.development';
import * as mqtt from 'mqtt';
import axios from 'axios';
import Cookies from 'js-cookie';
const brokerAddress = 'localhost:8000/mqtt';

function Scoreboard() {
  const { login } = useParams();
  const [usernames, setUsernames] = useState([]);
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.subscribe('game/#');
    client.on('message', (topic, message) => {
      if (
        topic === 'game/bet' ||
        topic === 'game/delete/bet' ||
        (topic === 'game/timer' && message.toString() === '6')
      ) {
        axios.get('https://localhost:5000/users/topBets').then((value) => {
          setUsernames(
            value.data.reduce((prev, curr) => {
              return [...prev, curr.username];
            }, [])
          );
          setCoins(
            value.data.reduce((prev, curr) => {
              return [...prev, curr.money];
            }, [])
          );
        });
      }
    });
    return () => {
      client.end();
    };
  });

  useEffect(() => {
    axios.get('https://localhost:5000/users/topBets').then((value) => {
      setUsernames(
        value.data.reduce((prev, curr) => {
          return [...prev, curr.username];
        }, [])
      );
      setCoins(
        value.data.reduce((prev, curr) => {
          return [...prev, curr.money];
        }, [])
      );
    });
  }, []);

  return (
    <div>
      <Navbar login={login} />
      <Typography variant='h2' color='secondary'>
        Top 10
      </Typography>
      <Typography variant='h4' color='secondary'>
        The highest coins amount
      </Typography>
      <br />
      <Container>
        <Bar
          options={{
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
          data={{
            labels: usernames,
            datasets: [
              {
                data: coins,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(255, 159, 64, 0.2)',
                  'rgba(255, 205, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                ],
                borderColor: 'white',
                borderWidth: 5,
              },
            ],
          }}
        />
      </Container>
    </div>
  );
}

export default Scoreboard;
