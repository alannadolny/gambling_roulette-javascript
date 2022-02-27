import { useParams } from 'react-router-dom';
import * as axios from 'axios';
import * as _ from 'lodash';
import { useState, forwardRef } from 'react';
import Cookies from 'js-cookie';
import { useHistory } from 'react-router-dom';
import { TextField, Typography, Button, Snackbar } from '@material-ui/core';
import MuiAlert from '@mui/material/Alert';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
function UserForm() {
  const history = useHistory();
  const { action } = useParams();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [similar, setSimilar] = useState([]);
  const [open, setOpen] = useState({
    UsernameLongerThan4: false,
    PasswordLongerThan4: false,
    PasswordIsRequired: false,
    LoginIsRequired: false,
    LoginDoesntExists: false,
    PasswordIsIncorrect: false,
    UsernameIsTaken: false,
  });

  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
  });
  const SubmitWithValidation = async (login, password) => {
    if (login === '') setOpen({ ...open, LoginIsRequired: true });
    else {
      if (password === '') setOpen({ ...open, PasswordIsRequired: true });
      else {
        if (password.length < 4)
          setOpen({ ...open, PasswordLongerThan4: true });
        else {
          if (login.length < 4) setOpen({ ...open, UsernameLongerThan4: true });
          else {
            action === 'login'
              ? await axios
                  .get(`https://localhost:5000/users/${login}`)
                  .then((v) => {
                    if (!v.data.password) {
                      setOpen({ ...open, LoginDoesntExists: true });
                      axios
                        .get(`https://localhost:5000/users/contains/${login}`)
                        .then((v2) => {
                          setSimilar(v2.data.map((el) => el.username));
                        });
                    } else {
                      if (v.data.password === password) {
                        Cookies.set(`username${login}`, login);
                        Cookies.set(`money${login}`, v.data.money);
                        Cookies.set(`chatRoom${login}`, 'US');
                        history.push(`/game/${login}`);
                      } else setOpen({ ...open, PasswordIsIncorrect: true });
                    }
                  })
              : await axios
                  .post('https://localhost:5000/users', {
                    username: login,
                    password: password,
                  })
                  .then((v) => {
                    if (v.data === 'USERNAME_IS_DUPLICATED')
                      setOpen({ ...open, UsernameIsTaken: true });
                    else {
                      Cookies.set(`username${login}`, login);
                      Cookies.set(`chatRoom${login}`, 'US');
                      history.push(`/game/${login}`);
                    }
                  });
          }
        }
      }
    }
  };

  return (
    <div>
      <Typography variant='h2' color='secondary'>
        {action === 'login' ? 'Sign in' : 'Register'}
      </Typography>
      <TextField
        onChange={(e) => setLogin(e.target.value)}
        style={{ margin: '10px', width: '30%' }}
        label='Username'
        color='secondary'
        variant='outlined'
        name='username'
      />{' '}
      <br />
      <TextField
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '30%' }}
        label='Password'
        color='secondary'
        variant='outlined'
        type='password'
        name='password'
      />{' '}
      <br />
      <Button
        type='submit'
        onClick={() => SubmitWithValidation(login, password)}
        variant='outlined'
        color='secondary'
        style={{ width: '30%', marginTop: '10px' }}
      >
        {action === 'login' ? 'sign in' : 'register'}
      </Button>{' '}
      <br />
      <Button
        type='button'
        onClick={() => history.goBack()}
        variant='outlined'
        color='secondary'
        style={{ width: '30%', marginTop: '10px' }}
      >
        Undo
      </Button>
      {!_.isEmpty(similar) ? (
        <Typography color='secondary' variant='h6'>
          Did you mean: {similar}
        </Typography>
      ) : (
        ''
      )}
      <Snackbar
        open={open.UsernameLongerThan4}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, UsernameLongerThan4: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, UsernameLongerThan4: false })}
          severity='error'
          sx={{ width: '100%' }}
        >
          Username should be longer than 4 characters
        </Alert>
      </Snackbar>
      <Snackbar
        open={open.PasswordLongerThan4}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, PasswordLongerThan4: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, PasswordLongerThan4: false })}
          severity='error'
          sx={{ width: '100%' }}
        >
          Password should be longer than 4 characters
        </Alert>
      </Snackbar>
      <Snackbar
        open={open.PasswordIsRequired}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, PasswordIsRequired: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, PasswordIsRequired: false })}
          severity='error'
          sx={{ width: '100%' }}
        >
          Password is required
        </Alert>
      </Snackbar>
      <Snackbar
        open={open.LoginIsRequired}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, LoginIsRequired: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, LoginIsRequired: false })}
          severity='error'
          sx={{ width: '100%' }}
        >
          Login is required
        </Alert>
      </Snackbar>
      <Snackbar
        open={open.LoginDoesntExists}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, LoginDoesntExists: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, LoginDoesntExists: false })}
          severity='error'
          sx={{ width: '100%' }}
        >
          This login doesn't exists
        </Alert>
      </Snackbar>
      <Snackbar
        open={open.PasswordIsIncorrect}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, PasswordIsIncorrect: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, PasswordIsIncorrect: false })}
          severity='error'
          sx={{ width: '100%' }}
        >
          Password is incorrect
        </Alert>
      </Snackbar>
      <Snackbar
        open={open.UsernameIsTaken}
        autoHideDuration={6000}
        onClose={() => setOpen({ ...open, UsernameIsTaken: false })}
      >
        <Alert
          onClose={() => setOpen({ ...open, UsernameIsTaken: false })}
          severity='error'
          sx={{ width: '100%' }}
        >
          This username is already taken
        </Alert>
      </Snackbar>
    </div>
  );
}

export default UserForm;
