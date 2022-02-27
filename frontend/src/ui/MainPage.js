import { Button, Container, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import Qotes from './Qotes';

function MainPage() {
  const history = useHistory();

  return (
    <Container>
      <Typography style={{ margin: '20px' }} variant='h3' color='secondary'>
        Random quotes
      </Typography>
      <Qotes />
      <Button
        style={{
          width: '50%',
          margin: '20px',
        }}
        color='secondary'
        variant='outlined'
        onClick={() => history.push('/form/login')}
      >
        <LoginIcon
          style={{ margin: '10px', position: 'relative', right: '10px' }}
        />{' '}
        Sign in
      </Button>
      <br />
      <Button
        color='secondary'
        style={{
          width: '50%',
        }}
        variant='outlined'
        onClick={() => history.push('/form/register')}
      >
        <AppRegistrationIcon style={{ margin: '10px' }} /> Register
      </Button>
    </Container>
  );
}

export default MainPage;
