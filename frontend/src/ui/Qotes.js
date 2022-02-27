import { Container, Typography } from '@material-ui/core';
import { useState, useEffect } from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const useEventSource = (url) => {
  const [data, updateData] = useState(null);

  useEffect(() => {
    const source = new EventSource(url);

    source.onmessage = function logEvents(event) {
      updateData(event.data);
    };
    return () => {
      source.close();
    };
  }, []);

  return data;
};

function Qotes() {
  const data = useEventSource('https://localhost:5000/quotes/');
  if (!data) {
    return <div />;
  }

  return (
    <Container
      style={{
        border: '1px solid rgb(245, 0, 87)',
        width: '50%',
        height: '200px',
        borderRadius: '20px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Typography
        color='secondary'
        variant='h4'
        style={{ alignSelf: 'center' }}
      >
        {data}
      </Typography>
    </Container>
  );
}

export default Qotes;
