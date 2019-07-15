import blue from '@material-ui/core/colors/blue';
import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const params = {
  lineWidth: 1.0,
  cellWidth: 10,
  cellHeight: 10
};

const drawForeground = canvas => {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
};

const drawBackground = canvas => {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = blue[50];
  context.fillRect(0, 0, canvas.width, canvas.height);

  // draw the grid
  // first translate half a pixel for pixel accuracy
  // https://stackoverflow.com/questions/13879322/drawing-a-1px-thick-line-in-canvas-creates-a-2px-thick-line
  context.translate(0.5, 0.5);

  // starting at 0, iterate by desired cellWidth
  context.lineWidth = params.lineWidth;
  context.beginPath();
  for (let x = params.cellWidth; x < canvas.width; x += params.cellWidth) {
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
  }

  // same for y
  for (let y = params.cellHeight; y < canvas.height; y += params.cellHeight) {
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
  }

  context.stroke();

  // restore translation
  context.setTransform(1, 0, 0, 1, 0, 0);
};

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
    drawBackground(b);
    drawForeground(c);
  };

  useEffect(() => {
    const c = foregroundRef.current;
    const b = backgroundRef.current;
    resizeCanvas(c);
    resizeCanvas(b);
    drawBackground(b);
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
