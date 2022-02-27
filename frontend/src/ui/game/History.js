import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@material-ui/core/';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react/cjs/react.development';
import Navbar from '../Navbar';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { v4 as uuidv4 } from 'uuid';
import * as mqtt from 'mqtt';
import * as _ from 'lodash';
const brokerAddress = 'localhost:8000/mqtt';

function History() {
  const { login } = useParams();
  const [betHistory, setBetHistory] = useState([]);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editedBetColor, setEditedBetColor] = useState('');
  const [editedBetNumber, setEditedBetNumber] = useState('');
  const [editedRoundHash, setEditedRoundHash] = useState('');
  const [editedWindow, setEditedWindow] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCloseDisagree = () => {
    setOpen(false);
  };

  const handleClickOpenEdit = () => {
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };
  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.subscribe('game/clear/history');
    client.on('message', (topic, message) => {
      setBetHistory([]);
    });
    return () => {
      client.end();
    };
  });

  const handleCloseAgree = () => {
    axios.delete('https://localhost:5000/game/result/').then((value) => {
      if (value.data === 'OK') {
        const client = mqtt.connect(`mqtt://${brokerAddress}`);
        client.publish('game/clear/history', 'clear');
        setOpen(false);
        setBetHistory([]);
      }
    });
  };

  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.subscribe('game/history/refresh/new');
    client.on('message', (topic, message) => {
      axios.get('https://localhost:5000/game/result/').then((value) => {
        setBetHistory(
          value.data
            .map((el) => {
              return {
                ...el,
                id: uuidv4(),
              };
            })
            .reverse()
        );
        return () => {
          client.end();
        };
      });
    });
  });

  useEffect(() => {
    axios.get(`https://localhost:5000/users/${login}`).then((value) => {
      if (value.data.admin === 'TRUE') setIsAdmin(true);
    });
  }, []);

  useEffect(() => {
    axios.get('https://localhost:5000/game/result/').then((value) => {
      setBetHistory(
        value.data
          .map((el) => {
            return {
              ...el,
              id: uuidv4(),
            };
          })
          .reverse()
      );
    });
  }, []);

  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.subscribe('game/timer');
    client.on('message', (topic, message) => {
      if (message.toString() === '28') {
        axios.get('https://localhost:5000/game/result/').then((value) => {
          setBetHistory(
            value.data
              .map((el) => {
                return {
                  ...el,
                  id: uuidv4(),
                };
              })
              .reverse()
          );
        });
      }
    });
    return () => {
      client.end();
    };
  });

  const columns = [
    {
      field: 'gameId',
      headerName: 'Round hash',
      width: 300,
    },
    {
      field: 'color',
      headerName: 'Color',
      width: 130,
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
      field: 'number',
      headerName: 'Number',
      width: 130,
    },
  ];

  return (
    <div>
      <Navbar login={login} />
      <Container>
        <Typography style={{ margin: '10px' }} color='secondary' variant='h5'>
          History
        </Typography>
        {isAdmin ? (
          <div>
            <Button
              onClick={handleClickOpen}
              variant='outlined'
              color='secondary'
              style={{ marginRight: '20px' }}
            >
              Clear history
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              onClick={handleClickOpenEdit}
            >
              Edit history
            </Button>
          </div>
        ) : (
          ''
        )}
        <Dialog
          open={open}
          onClose={handleCloseDisagree}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>
            {'Are you sure to clear all history?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              If you confirm deleting, all records from history will be
              pemanently deleted. This change is <strong>IRREVERSIBLE</strong>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDisagree}>Disagree</Button>
            <Button onClick={handleCloseAgree} autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
        <Box>
          <DataGrid
            style={{ height: '600px', width: '100%', marginTop: '10px' }}
            rows={betHistory}
            columns={columns}
          />
        </Box>
        <Dialog
          open={openEdit}
          onClose={handleCloseEdit}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>{'Edit history'}</DialogTitle>
          <DialogContent>
            {betHistory.map((el) => {
              return (
                <div
                  key={el.gameId}
                  style={{
                    fontSize: '15px',
                    margin: '10px',
                    borderBottom: '1px solid gray',
                  }}
                >
                  <strong>{el.gameId}</strong>{' '}
                  <strong
                    style={{
                      color: el.color,
                      marginLeft: '10px',
                      marginRight: '10px',
                    }}
                  >
                    {el.color}
                  </strong>{' '}
                  <strong>{el.number}</strong>
                  <Button
                    onClick={() => {
                      setEditedBetColor(el.color);
                      setEditedBetNumber(el.number);
                      setEditedRoundHash(el.gameId);
                      setEditedWindow(true);
                    }}
                    style={{ marginLeft: '10px', marginBottom: '10px' }}
                    variant='outlined'
                    color='secondary'
                  >
                    Edit
                  </Button>
                </div>
              );
            })}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={editedWindow}
          onClose={() => setEditedWindow(false)}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>
            {'Edit round result'}
          </DialogTitle>
          <DialogContent>
            <Typography color='secondary'>Number:</Typography>
            <TextField
              onChange={(e) => setEditedBetNumber(e.target.value)}
              value={editedBetNumber}
              style={{
                display: 'inline-block',
                width: '200px',
              }}
              type='text'
              color='secondary'
              variant='outlined'
            />
            <Typography color='secondary'>Color:</Typography>
            <TextField
              onChange={(e) => setEditedBetColor(e.target.value)}
              value={editedBetColor}
              style={{
                display: 'inline-block',
                width: '200px',
              }}
              type='text'
              color='secondary'
              variant='outlined'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditedWindow(false)}>Cancel</Button>
            <Button
              autoFocus
              onClick={() => {
                axios
                  .put(
                    `https://localhost:5000/game/result/${editedRoundHash}`,
                    {
                      color: editedBetColor,
                      number: editedBetNumber,
                    }
                  )
                  .then(() => {
                    const client = mqtt.connect(`mqtt://${brokerAddress}`);
                    client.publish('game/history/refresh', 'refresh');
                    setEditedWindow(false);
                  });
              }}
            >
              Edit
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
}

export default History;
