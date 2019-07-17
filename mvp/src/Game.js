import React, { useEffect, useRef, useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useAnimationFrame from './useAnimationFrame';

const useStyles = makeStyles(theme => ({
  wrapper: {
    position: 'relative'
  },
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
    border: '1px solid black'
  },
  foreground: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,
    border: '1px solid black'
  }
}));

const params = {
  lineWidth: 1,
  cellWidth: 20,
  cellHeight: 20,
  widthInCells: 20,
  heightInCells: 20
};

const initalCells = Array(params.widthInCells * params.heightInCells).fill(0);

const drawForeground = (canvas, cells) => {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  // context.beginPath();
  if (cells !== undefined) {
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] === 1) {
        const x = (i % params.widthInCells) * params.cellWidth;
        const y = Math.floor(i / params.widthInCells) * params.cellHeight;
        context.fillRect(x, y, params.cellWidth, params.cellHeight);
      }
    }
  }
};

const getIndexForGridCoords = (row, col) => {
  if (row < 0 || row > params.heightInCells - 1) {
    return null;
  }

  if (col < 0 || col > params.widthInCells - 1) {
    return null;
  }

  return row * params.widthInCells + col;
};

// calculate the next cycle
const calculateNextState = cells => {
  const newCells = Array(cells.length).fill(0);
  let cellsChanged = false;

  // iterate over the array of given cells
  // count their neighbors
  for (let i = 0; i < cells.length; i++) {
    let neighborCount = 0;

    const row = Math.floor(i / params.widthInCells);
    const column = i % params.widthInCells;

    // check top row
    for (let j = column - 1; j < column + 2; j++) {
      const index = getIndexForGridCoords(row - 1, j);
      if (cells[index] === 1) {
        neighborCount += 1;
      }
    }

    // check left and right
    const leftIndex = getIndexForGridCoords(row, column - 1);
    neighborCount += leftIndex !== null && cells[leftIndex] === 1 ? 1 : 0;

    const rightIndex = getIndexForGridCoords(row, column + 1);
    neighborCount += rightIndex !== null && cells[rightIndex] === 1 ? 1 : 0;

    // check bottom row
    // check top row
    for (let j = column - 1; j < column + 2; j++) {
      const index = getIndexForGridCoords(row + 1, j);
      if (cells[index] === 1) {
        neighborCount += 1;
      }
    }

    // Check the rules
    if (
      (cells[i] === 1 && (neighborCount === 2 || neighborCount === 3)) ||
      (cells[i] === 0 && neighborCount === 3)
    ) {
      newCells[i] = 1;
    }

    // was there a change?
    if (newCells[i] !== cells[i]) {
      cellsChanged = true;
    }
  }

  // return false if nothing changed
  if (!cellsChanged) {
    return false;
  }

  return newCells;
};

const drawBackground = canvas => {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  // context.fillStyle = blue[50];
  // context.fillRect(0, 0, canvas.width, canvas.height);

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

  // restore translation
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.stroke();
};

const resizeCanvas = canvas => {
  const { cellWidth, cellHeight, widthInCells, heightInCells } = params;
  canvas.width = cellWidth * widthInCells;
  canvas.height = cellHeight * heightInCells;
};

const Game = () => {
  // initialize with an empty board
  const [cells, setCells] = useState(initalCells);
  const [previousFrameTime, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const classes = useStyles();
  const backgroundRef = useRef(null);
  const foregroundRef = useRef(null);

  // handle for window resize event
  const resizeHandler = useCallback(() => {
    const c = foregroundRef.current;
    const b = backgroundRef.current;
    resizeCanvas(c);
    resizeCanvas(b);
    const wrapper = c.parentNode;
    const paper = wrapper.parentNode;

    // set some heights to account for overlayed canvases
    // and their borders
    paper.style.height = `${c.height + 34}px`;
    wrapper.style.width = `${c.width}px`;
    wrapper.style.height = `${c.height + 2}px`;
    drawBackground(b);
    drawForeground(c);
  }, []);

  // handle canvas click
  const canvasClickHandler = useCallback(
    e => {
      const { clientY: clickY, clientX: clickX } = e;
      const canvas = foregroundRef.current;
      const rect = canvas.getBoundingClientRect();
      const canvasX = clickX - rect.left;
      const canvasY = clickY - rect.top;

      // how many rows down did we click?
      const row = Math.floor(canvasY / params.cellHeight);
      const column = Math.floor(canvasX / params.cellWidth);

      // get the cell for those coordinates
      const index = params.widthInCells * row + column;

      // copy and mutate before setting new state
      const nextCells = [...cells];
      nextCells[index] = nextCells[index] === 0 ? 1 : 0;
      setCells(nextCells);
    },
    [cells]
  );

  // resize on Mount
  useEffect(() => {
    const fgCanvas = foregroundRef.current;
    resizeHandler();
    window.addEventListener('resize', resizeHandler);
    fgCanvas.addEventListener('click', canvasClickHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      fgCanvas.removeEventListener('click', canvasClickHandler);
    };
  }, [resizeHandler, canvasClickHandler]);

  // rerender foreground on cells change
  useEffect(() => {
    const canvas = foregroundRef.current;
    drawForeground(canvas, cells);
  }, [cells]);

  useAnimationFrame(() => {
    if (running && Date.now() - previousFrameTime > 1000 / 5) {
      setTime(Date.now());
      const nextCells = calculateNextState(cells);
      if (nextCells) {
        setCells(nextCells);
      } else {
        setRunning(false);
      }
    }
  });

  return (
    <div>
      <div className={classes.wrapper}>
        <canvas className={classes.background} ref={backgroundRef} />
        <canvas className={classes.foreground} ref={foregroundRef} />
      </div>
      <button onClick={() => setCells(initalCells)}>clear</button>
      <button
        onClick={() => {
          const nextCells = calculateNextState(cells);
          if (nextCells) {
            setCells(nextCells);
          }
        }}
      >
        step
      </button>
      <button onClick={() => (running ? setRunning(false) : setRunning(true))}>
        {running ? 'pause' : 'continuous'}
      </button>
    </div>
  );
};

export default Game;
