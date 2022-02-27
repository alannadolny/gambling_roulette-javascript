import { Container } from '@material-ui/core/';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react/cjs/react.development';
import Cookies from 'js-cookie';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as mqtt from 'mqtt';

function PlacedBets() {
  const [rows, setRows] = useState([]);
  const brokerAddress = 'localhost:8000/mqtt';
  const columns = [
    {
      field: 'username',
      headerName: 'Username',
      width: 130,
    },
    {
      field: 'color',
      headerName: 'Color',
      width: 80,
      renderCell: (cellValues) => {
        const color =
          cellValues.value === 'red'
            ? 'red'
            : cellValues.value === 'green'
            ? 'green'
            : 'black';
        return (
          <div
            style={{
              color: color,
            }}
          >
            {cellValues.value}
          </div>
        );
      },
    },
    {
      field: 'coins',
      headerName: 'Coins',
      width: 80,
    },
  ];

  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.subscribe('game/bet');
    client.on('message', (topic, message) => {
      const mess = JSON.parse(message.toString());
      setRows((previousRows) => {
        return [
          ...previousRows,
          {
            id: uuidv4(),
            username: mess.username,
            color: mess.color,
            coins: mess.coins,
          },
        ];
      });
    });
    return () => {
      client.end();
    };
  }, []);

  useEffect(() => {
    axios
      .get(`https://localhost:5000/bets/${Cookies.get('gameId')}`)
      .then((value) => {
        setRows(
          value.data.map((el) => {
            return {
              id: uuidv4(),
              username: el.user,
              color: el.bet.color,
              coins: el.bet.value,
            };
          })
        );
      });
    return;
  }, [Cookies.get('gameId')]);

  return (
    <Container style={{ height: 400, width: '100%' }}>
      <br />
      <DataGrid rows={rows} columns={columns} />
    </Container>
  );
}

export default PlacedBets;
