import blue from '@material-ui/core/colors/blue';
import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const drawForeground = canvas => {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
};

const drawBackground = canvas => {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = blue[50];
  context.fillRect(0, 0, canvas.width, canvas.height);
}

const resizeCanvas = canvas => {
  canvas.height = canvas.parentElement.clientHeight;
  canvas.width = canvas.parentElement.clientWidth;
};

const useStyles = makeStyles(theme => ({
  wrapper: {
    position: 'relative',
    height: '100%',
    width: '100%'
  },
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1
  },
  foreground: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2
  }
}));

const Game = () => {
  const classes = useStyles();
  const backgroundRef = useRef(null);
  const foregroundRef = useRef(null);

  const resizeHandler = () => {
    const c = foregroundRef.current;
    const b = backgroundRef.current;
    resizeCanvas(c);
    resizeCanvas(b);
    drawBackground(b)
    drawForeground(c);
  };

  useEffect(() => {
    const c = foregroundRef.current;
    const b = backgroundRef.current;
    resizeCanvas(c);
    resizeCanvas(b);
    drawBackground(b)
    drawForeground(c);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resizeHandler);

    return () => window.removeEventListener('resize', resizeHandler);
  });

  return (
    <div className={classes.wrapper}>
      <canvas className={classes.background} ref={backgroundRef} />
      <canvas className={classes.foreground} ref={foregroundRef} />
    </div>
  );
};

export default Game;
