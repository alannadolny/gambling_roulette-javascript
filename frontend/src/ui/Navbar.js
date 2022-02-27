import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  Button,
  createTheme,
  MuiThemeProvider,
  TextField,
} from '@material-ui/core';
import { grey } from '@mui/material/colors';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import LogoutIcon from '@mui/icons-material/Logout';
import Cookies from 'js-cookie';
import Chat from '../ui/chat/Chat';
import Popover from '@mui/material/Popover';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';

function Navbar({ login }) {
  const newTheme = createTheme({
    palette: { default: grey },
  });

  const [open, setOpen] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [handleNewPassword, setHandleNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpenChangePassword = () => {
    setOpenChangePassword(true);
  };

  const handleCloseChangePassword = () => {
    setOpenChangePassword(false);
  };

  const deleteAccount = (login) => {
    axios.delete(`https://localhost:5000/users/${login}`).then(() => {
      history.push('/');
    });
  };

  const changePassword = (password) => {
    if (password.length <= 4) setNewPasswordError(true);
    else
      axios
        .put('https://localhost:5000/users/password', {
          username: login,
          password,
        })
        .then(() => {
          setOpenChangePassword(false);
        });
  };

  const history = useHistory();
  return (
    <AppBar position='static' color='secondary'>
      <Dialog
        open={openChangePassword}
        onClose={handleCloseChangePassword}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'New password: '}</DialogTitle>
        <DialogContent>
          {newPasswordError ? 'Password must be longer than 4 characters' : ''}{' '}
          <br />
          <TextField
            onChange={(e) => setHandleNewPassword(e.target.value)}
            value={handleNewPassword}
            style={{
              display: 'inline-block',
              width: '200px',
              position: 'relative',
              top: '10px',
            }}
            type='password'
            color='secondary'
            variant='outlined'
            label='new password'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => changePassword(handleNewPassword)}>
            Change
          </Button>
          <Button onClick={handleCloseChangePassword} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          {'Are you sure you want to delete your account?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            If you click delete, you will delete your account with all your
            coins. This change is <strong>irreversible</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => deleteAccount(login)}>Delete</Button>
          <Button onClick={handleClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <Typography
            variant='h6'
            noWrap
            component='div'
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            <SportsEsportsIcon
              fontSize='large'
              style={{
                position: 'absolute',
                top: '15px',
              }}
            />
          </Typography>
          <Box>
            <MuiThemeProvider theme={newTheme}>
              <Button
                onClick={() => history.push(`/game/${login}`)}
                color='default'
                variant='outlined'
                style={{ marginLeft: '50px' }}
              >
                Roulette
              </Button>
              <Button
                onClick={() => history.push(`/game/${login}/deposit`)}
                color='default'
                variant='outlined'
                style={{ marginLeft: '50px' }}
              >
                Deposit
              </Button>
              <Button
                onClick={() => history.push(`/game/${login}/history`)}
                color='default'
                variant='outlined'
                style={{ marginLeft: '50px' }}
              >
                History
              </Button>
              <Button
                onClick={() => history.push(`/game/${login}/scoreboard`)}
                color='default'
                variant='outlined'
                style={{ marginLeft: '50px' }}
              >
                Scoreboard
              </Button>
            </MuiThemeProvider>
          </Box>
          <PopupState variant='popover' popupId='demo-popup-popover'>
            {(popupState) => (
              <div>
                <Typography
                  {...bindTrigger(popupState)}
                  style={{ position: 'absolute', right: '50px', top: '20px' }}
                >
                  You are logged as <strong>{login}</strong>
                </Typography>
                <Popover
                  {...bindPopover(popupState)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                >
                  <Typography
                    onClick={handleClickOpen}
                    style={{ padding: '10px', cursor: 'pointer' }}
                    sx={{ p: 2 }}
                  >
                    Delete account
                  </Typography>
                  <Typography
                    onClick={handleClickOpenChangePassword}
                    style={{ padding: '10px', cursor: 'pointer' }}
                    sx={{ p: 2 }}
                  >
                    Change password
                  </Typography>
                </Popover>
              </div>
            )}
          </PopupState>
          <LogoutIcon
            onClick={() => {
              history.push('/');
              Cookies.remove(`username${login}`);
              Cookies.remove(`gameId`);
              Cookies.remove(`money${login}`);
            }}
            fontSize='large'
            style={{
              cursor: 'pointer',
              position: 'absolute',
              top: '15px',
              right: '10px',
            }}
          />
        </Toolbar>
      </Container>
      <Chat />
    </AppBar>
  );
}

export default Navbar;
