import {
  Chip,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Snackbar,
} from '@material-ui/core';
import MessageIcon from '@mui/icons-material/Message';
import MuiAlert from '@mui/material/Alert';
import { useState } from 'react';
import Flags from 'country-flag-icons/react/3x2';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useEffect, forwardRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import * as mqtt from 'mqtt';
import * as axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

function Chat() {
  const { login } = useParams();
  const [chat, setChat] = useState(false);
  const [room, setRoom] = useState('US');
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [PL, setPL] = useState([]);
  const [US, setUS] = useState([]);
  const [DE, setDE] = useState([]);
  const [editedMessage, setEditedMessage] = useState(null);
  const [id, setId] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState(false);
  const brokerAddress = 'localhost:8000/mqtt';
  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
  });
  const handleEditedMessage = (value) => {
    setEditedMessage(value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const editMessage = (id, message) => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.publish(`message/edited`, JSON.stringify({ id, message }));
    setOpen(false);
  };

  const showChat = () => {
    if (chat !== false) {
      setChat(false);
    } else {
      setChat(true);
    }
  };

  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.publish(
      `chat/${room}`,
      JSON.stringify({
        username: 'system',
        message: `${login} joined the room`,
      })
    );
    return () => {
      client.end();
    };
  }, [room]);

  useEffect(() => {
    axios.get('https://localhost:5000/chats/US').then((chatsUS) => {
      setUS(chatsUS.data);
    });
    axios.get('https://localhost:5000/chats/PL').then((chatsPL) => {
      setPL(chatsPL.data);
    });
    axios.get('https://localhost:5000/chats/DE').then((chatsDE) => {
      setDE(chatsDE.data);
    });
  }, []);

  const handleMessage = (event) => {
    setMessage(event.target.value);
  };

  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.subscribe('message/edited/signal');
    const update_mqtt = () => {
      client.on('message', (topic, message) => {
        axios.get('https://localhost:5000/chats/US').then((chatsUS) => {
          setUS(chatsUS.data);
        });
        axios.get('https://localhost:5000/chats/PL').then((chatsPL) => {
          setPL(chatsPL.data);
        });
        axios.get('https://localhost:5000/chats/DE').then((chatsDE) => {
          setDE(chatsDE.data);
        });
      });
    };
    update_mqtt();
    return () => {
      client.end();
    };
  }, []);

  useEffect(() => {
    const client = mqtt.connect(`mqtt://${brokerAddress}`);
    client.subscribe('new/messages');
    const update_mqtt = () => {
      client.on('message', (_, message) => {
        const converted = JSON.parse(message);
        converted.channel === 'US'
          ? setUS((prev) => [...prev, converted])
          : converted.channel === 'PL'
          ? setPL((prev) => [...prev, converted])
          : setDE((prev) => [...prev, converted]);
      });
    };
    update_mqtt();
    return () => {
      client.end();
    };
  }, []);

  const sendMessage = (message, room) => {
    if (message === '') setEmptyMessage(true);
    else {
      const client = mqtt.connect(`mqtt://${brokerAddress}`);
      client.on('connect', () => {
        client.publish(
          `chat/${room}`,
          JSON.stringify({ username: login, message })
        );
        client.end();
        setMessage('');
      });
    }
  };

  return (
    <div>
      <Snackbar
        open={emptyMessage}
        autoHideDuration={6000}
        onClose={() => setEmptyMessage(false)}
      >
        <Alert
          onClose={() => setEmptyMessage(false)}
          severity='error'
          sx={{ width: '100%' }}
        >
          You can't send empty message!
        </Alert>
      </Snackbar>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Edit message'}</DialogTitle>
        <DialogContent>
          <TextField
            onChange={(e) => handleEditedMessage(e.target.value)}
            value={editedMessage}
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => editMessage(id, editedMessage)} autoFocus>
            Edit
          </Button>
        </DialogActions>
      </Dialog>
      {chat ? (
        <Card
          style={{
            border: '1px solid rgb(245, 0, 87)',
            zIndex: '2',
            position: 'fixed',
            bottom: '50px',
            left: '10px',
            width: '300px',
            height: '500px',
          }}
        >
          <Typography
            style={{
              paddingTop: '10px',
              color: 'white',
              backgroundColor: 'rgb(245, 0, 87)',
            }}
            variant='h6'
          >
            Current room: {room}
          </Typography>
          <CardContent style={{ backgroundColor: 'rgb(245, 0, 87)' }}>
            <Flags.US
              onClick={() => setRoom('US')}
              title='United States'
              style={{
                cursor: 'pointer',
                width: '40px',
                height: '30px',
              }}
            />
            <Flags.PL
              onClick={() => setRoom('PL')}
              style={{
                cursor: 'pointer',
                marginLeft: '20px',
                width: '40px',
                height: '30px',
              }}
            />
            <Flags.DE
              onClick={() => setRoom('DE')}
              style={{
                cursor: 'pointer',
                marginLeft: '20px',
                width: '40px',
                height: '30px',
              }}
            />
          </CardContent>
          <List style={{ height: '280px', overflow: 'auto' }}>
            {room === 'US'
              ? US.map((el) => {
                  return (
                    <ListItem button key={uuidv4()}>
                      <ListItemText primary={el.from} secondary={el.message} />
                      {el.from === login ? (
                        <Button
                          color='secondary'
                          onClick={() => {
                            setEditedMessage(el.message);
                            setId(el.id);
                            handleClickOpen();
                          }}
                        >
                          edit
                        </Button>
                      ) : (
                        ''
                      )}
                    </ListItem>
                  );
                })
              : room === 'PL'
              ? PL.map((el) => {
                  return (
                    <ListItem button key={uuidv4()}>
                      <ListItemText primary={el.from} secondary={el.message} />
                      {el.from === login ? (
                        <Button
                          color='secondary'
                          onClick={() => {
                            setEditedMessage(el.message);
                            setId(el.id);
                            handleClickOpen();
                          }}
                        >
                          edit
                        </Button>
                      ) : (
                        ''
                      )}
                    </ListItem>
                  );
                })
              : DE.map((el) => {
                  return (
                    <ListItem button key={uuidv4()}>
                      <ListItemText primary={el.from} secondary={el.message} />
                      {el.from === login ? (
                        <Button
                          color='secondary'
                          onClick={() => {
                            setEditedMessage(el.message);
                            setId(el.id);
                            handleClickOpen();
                          }}
                        >
                          edit
                        </Button>
                      ) : (
                        ''
                      )}
                    </ListItem>
                  );
                })}
          </List>
          <CardContent>
            <TextField
              value={message}
              onChange={handleMessage}
              style={{
                display: 'inline-block',
                width: '200px',
              }}
              type='text'
              color='secondary'
              label='Write a message'
              variant='outlined'
            />
            <Button
              onClick={() => sendMessage(message, room)}
              variant='outlined'
              style={{
                display: 'inline-block',
                height: '56px',
              }}
            >
              <SendIcon
                style={{
                  position: 'relative',
                  top: '5px',
                  left: '2px',
                  color: 'rgb(245, 0, 87)',
                }}
              />
            </Button>
          </CardContent>
        </Card>
      ) : (
        ''
      )}
      <Chip
        onClick={() => showChat()}
        style={{
          backgroundColor: 'white',
          zIndex: '2',
          cursor: 'pointer',
          padding: '10px',
          border: '1px solid rgb(245, 0, 87)',
          color: 'rgb(245, 0, 87)',
          position: 'fixed',
          left: '10px',
          bottom: '10px',
        }}
        avatar={
          <MessageIcon fontSize='large' style={{ color: 'rgb(245, 0, 87)' }} />
        }
        variant='outlined'
        label='Chat'
      />
    </div>
  );
}

export default Chat;
