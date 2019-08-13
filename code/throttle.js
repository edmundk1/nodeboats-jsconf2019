const {Board, ESC, Fn, Led} = require('johnny-five');
const keypress = require('keypress');

const board = new Board({
  port: '/dev/tty.guppy-DevB', // path to bluetooth connection, i.e. /dev/tty.ROBOT_NAME-SPPDev or COMX
});

board.on('ready', () => {
  const led = new Led(13);
  const esc = new ESC({
    device: 'FORWARD_REVERSE',
    pin: 11,
  });
  let speed = 0;
  let last = null;

  // just to make sure the program is running
  led.blink(500);

  function controller(_, key) {
    let change = 0;

    if (key) {
      console.log('key pressed:', key.name);
      if (!key.shift) {
        change = esc.neutral;
        speed = 0;
      } else {
        console.log('else statement');
        if (key.name === 'up' || key.name === 'down') {
          if (last !== key.name) {
            change = esc.neutral;
            speed = 0;
          } else {
            speed += 5;

            change =
              key.name === 'up' ? esc.neutral + speed : esc.neutral - speed;
          }
          last = key.name;
        }
      }

      if (change) {
        esc.throttle(change);
      }
    }
  }

  keypress(process.stdin);

  process.stdin.on('keypress', controller);
  process.stdin.setRawMode(true);
  process.stdin.resume();
});

board.on('error', error => {
  console.error(error);
  process.exit(1);
});
