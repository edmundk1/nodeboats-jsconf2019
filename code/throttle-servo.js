const {Board, ESC, Fn, Led, Servo} = require('johnny-five');
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
  const servo = new Servo(10);

  const minDeg = 45;
  const maxDeg = 135;

  // servo.degreeRange([maxLeftDeg, maxRightDeg]);

  let speedIncrement = 0;
  let last = null;

  let motorChange = esc.neutral;

  let servoChange = servo.position;

  servo.center(500);
  // just to make sureE the program is running
  led.blink(500);
  function controller(_, key) {

    if (key) {
      console.log(key.name);
      if (!key.shift) {
        motorChange = esc.neutral;
        speedIncrement = 0;
        //Motor control logic
      } else {
        if (key.name === 'up' || key.name === 'down' || key.name === 's' || key.name === 'w') {
          console.log("SPEED INPUT: ", key.name);
          if (key.name === 's') {
            console.log('HARD STOP');
            motorChange = esc.neutral;
          } else if (key.name === 'w') {
            console.log('HARD START');
            motorChange = 1380;
          } else {
            speedIncrement = 1;

            motorChange =
              key.name === 'up' ? motorChange -= speedIncrement : motorChange += speedIncrement;

            console.log("CURRENT SPEED: ", motorChange)
          }
        }

        // Turning logic

        if (key.name === 'left' || key.name === 'right') {
          console.log("TURNING: ", key.name);

          const incrementVal = 5;
          if (servoChange < minDeg || servoChange > maxDeg) {
            servoChange = servo.position;
          }

          if (key.name === 'left' && servoChange >= minDeg) {
            servoChange = servo.position + incrementVal
          } else if (key.name === 'right' && servoChange <= maxDeg) {
            servoChange = servo.position - incrementVal
          } else {
            console.log("MAX DEG LIMIT REACHED")
          }

          console.log('servochange:', servoChange);

          servo.to(servoChange, 100)
        }

        if (key.name === 'a') {
          console.log("HARD LEFT");
          servo.to(maxDeg, 1000)
        }
        if (key.name === 'd') {
          console.log("HARD RIGHT");
          servo.to(minDeg, 1000)
        }

        if (key.name === 'e') {
          console.log('CENTERED');
          // servo.center(500);
          servo.to(70, 500)
          servoChange = servo.position
        }
      }

      if (motorChange) {
        esc.throttle(motorChange);
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
