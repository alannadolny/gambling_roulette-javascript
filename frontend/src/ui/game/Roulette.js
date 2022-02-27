import { Container } from '@material-ui/core/';
import { Wheel } from 'react-custom-roulette';

function Roulette({ timer, number }) {
  const startSpinning = (mess) => {
    if (mess === 'losowanie...') return true;
    else return false;
  };

  const getResult = (number, data) => {
    return data.indexOf(
      data.find((el) => parseInt(el.option) === parseInt(number))
    );
  };

  const data = [
    { option: '0', style: { backgroundColor: 'green', textColor: 'white' } },
    { option: '1', style: { backgroundColor: 'red', textColor: 'white' } },
    { option: '8', style: { backgroundColor: 'black', textColor: 'white' } },
    { option: '2', style: { backgroundColor: 'red', textColor: 'white' } },
    { option: '9', style: { backgroundColor: 'black', textColor: 'white' } },
    { option: '3', style: { backgroundColor: 'red', textColor: 'white' } },
    { option: '10', style: { backgroundColor: 'black', textColor: 'white' } },
    { option: '4', style: { backgroundColor: 'red', textColor: 'white' } },
    { option: '11', style: { backgroundColor: 'black', textColor: 'white' } },
    { option: '5', style: { backgroundColor: 'red', textColor: 'white' } },
    { option: '12', style: { backgroundColor: 'black', textColor: 'white' } },
    { option: '6', style: { backgroundColor: 'red', textColor: 'white' } },
    { option: '13', style: { backgroundColor: 'black', textColor: 'white' } },
    { option: '7', style: { backgroundColor: 'red', textColor: 'white' } },
    { option: '14', style: { backgroundColor: 'black', textColor: 'white' } },
  ];

  return (
    <Container
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Wheel
        mustStartSpinning={startSpinning(timer)}
        prizeNumber={getResult(number, data)}
        data={data}
        backgroundColors={['#3e3e3e', '#df3428']}
        textColors={['#ffffff']}
      />
    </Container>
  );
}

export default Roulette;
