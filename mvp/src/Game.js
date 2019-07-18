import React, { useEffect, useRef, useState } from 'react';
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
  cellWidth: 10,
  cellHeight: 10,
  widthInCells: 80,
  heightInCells: 80
};

const initialCells = Array(params.widthInCells * params.heightInCells).fill(0);

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

// generate random cells
const randomizeCells = cells => {
  const newCells = Array(cells.length).fill(0);
  for (let i = 0; i < cells.length; i++) {
    newCells[i] = Math.floor(Math.random() * 2);
  }

  return newCells;
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
  const { cellWidth, cellHeight, heightInCells } = params;
  // canvas.width = cellWidth * widthInCells;
  canvas.height = cellHeight * heightInCells;
  const paper = canvas.parentNode.parentNode.parentNode;
  const computedStyle = getComputedStyle(paper);
  const paperWidth =
    paper.clientWidth -
    (parseFloat(computedStyle.paddingLeft) +
      parseFloat(computedStyle.paddingRight));
  const maxWidthInCells = Math.floor(paperWidth / params.cellWidth);
  canvas.width = maxWidthInCells * cellWidth;
  params.widthInCells = maxWidthInCells;
};

const Game = () => {
  // initialize with an empty board
  const [cells, setCells] = useState(initialCells);
  const [previousFrameTime, setTime] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [running, setRunning] = useState(false);
  const [mirroring, setMirroring] = useState(false);
  const classes = useStyles();
  const backgroundRef = useRef(null);
  const foregroundRef = useRef(null);
  const savedDrawHandler = useRef(null);

  // handle for window resize event
  const resizeHandler = () => {
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
    setCells(Array(params.widthInCells * params.heightInCells).fill(0));
  };

  useEffect(resizeHandler, []);

  // handle canvas click
  const handleMouseDown = e => {
    // const { clientY: clickY, clientX: clickX } = e;
    // const canvas = foregroundRef.current;
    // const rect = canvas.getBoundingClientRect();
    // const canvasX = clickX - rect.left;
    // const canvasY = clickY - rect.top;
    //
    // // how many rows down did we click?
    // const row = Math.floor(canvasY / params.cellHeight);
    // const column = Math.floor(canvasX / params.cellWidth);
    //
    // // get the cell for those coordinates
    // const index = params.widthInCells * row + column;
    //
    // // copy and mutate before setting new state
    // const nextCells = [...cells];
    // nextCells[index] = nextCells[index] === 0 ? 1 : 0;
    setDrawing(true);
    setRunning(false);
    savedDrawHandler.current(e)
    // setCells(nextCells);
  };

  useEffect(() => {
    // handler for drawing
    const drawingHandler = e => {
      const { clientY, clientX } = e;
      const canvas = foregroundRef.current;
      const rect = canvas.getBoundingClientRect();
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;

      // how many rows down did we click?
      const row = Math.floor(canvasY / params.cellHeight);
      const column = Math.floor(canvasX / params.cellWidth);

      // get the cell for those coordinates
      const index = params.widthInCells * row + column;
      if (cells[index] === 1) {
        return;
      }

      // copy and mutate before setting new state
      const nextCells = [...cells];
      nextCells[index] = 1;

      // check if we're mirroring
      if (mirroring) {
        const halfWidth = Math.floor(params.widthInCells / 2);
        const halfHeight = Math.floor(params.heightInCells / 2);
        const distanceToMiddle = Math.abs(column - halfWidth);
        const distanceToMiddleHeight = Math.abs(row - halfHeight);
        if (column > halfWidth) {
          if (row > halfHeight) {
            // bottom right
            nextCells[
              getIndexForGridCoords(row, halfWidth - distanceToMiddle)
            ] = 1;
            nextCells[
              getIndexForGridCoords(halfHeight - distanceToMiddleHeight, column)
            ] = 1;
            nextCells[
              getIndexForGridCoords(
                halfHeight - distanceToMiddleHeight,
                halfWidth - distanceToMiddle
              )
            ] = 1;
          } else {
            // top right
            nextCells[
              getIndexForGridCoords(row, halfWidth - distanceToMiddle)
            ] = 1;
            nextCells[
              getIndexForGridCoords(halfHeight + distanceToMiddleHeight, column)
            ] = 1;
            nextCells[
              getIndexForGridCoords(
                halfHeight + distanceToMiddleHeight,
                halfWidth - distanceToMiddle
              )
            ] = 1;
          }
        } else {
          if (row > halfHeight) {
            // bottom left
            nextCells[
              getIndexForGridCoords(row, halfWidth + distanceToMiddle)
            ] = 1;
            nextCells[
              getIndexForGridCoords(halfHeight - distanceToMiddleHeight, column)
            ] = 1;
            nextCells[
              getIndexForGridCoords(
                halfHeight - distanceToMiddleHeight,
                halfWidth + distanceToMiddle
              )
            ] = 1;
          } else {
            // top left
            nextCells[
              getIndexForGridCoords(row, halfWidth + distanceToMiddle)
            ] = 1;
            nextCells[
              getIndexForGridCoords(halfHeight + distanceToMiddleHeight, column)
            ] = 1;
            nextCells[
              getIndexForGridCoords(
                halfHeight + distanceToMiddleHeight,
                halfWidth + distanceToMiddle
              )
            ] = 1;
          }
        }
      }
      setCells(nextCells);
    };
    savedDrawHandler.current = drawingHandler;
  });

  useEffect(() => {
    if (drawing === true) {
      window.addEventListener('mousemove', savedDrawHandler.current);
    } else {
      window.removeEventListener('mousemove', savedDrawHandler.current);
    }

    return () => {
      window.removeEventListener('mousemove', savedDrawHandler.current);
    };
  }, [drawing, cells, mirroring]);

  // resize on Mount
  useEffect(() => {
    // const fgCanvas = foregroundRef.current;
    window.addEventListener('resize', resizeHandler);
    // fgCanvas.addEventListener('mousedown', canvasClickHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      // fgCanvas.removeEventListener('mousedown', canvasClickHandler);
    };
  }, [cells]);

  // rerender foreground on cells change
  useEffect(() => {
    const canvas = foregroundRef.current;
    drawForeground(canvas, cells);
  }, [cells]);

  useAnimationFrame(() => {
    if (running) {
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
        <canvas
          className={classes.foreground}
          ref={foregroundRef}
          onMouseDown={handleMouseDown}
          onMouseOut={() => setDrawing(false)}
          onMouseUp={() => setDrawing(false)}
        />
      </div>
      <button onClick={() => setCells(initialCells)}>clear</button>
      <button
        onClick={() => (mirroring ? setMirroring(false) : setMirroring(true))}
      >
        {mirroring ? 'stop mirroring' : 'mirror'}
      </button>
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
      <button onClick={() => setCells(randomizeCells(cells))}>randomize</button>
      <button onClick={() => (running ? setRunning(false) : setRunning(true))}>
        {running ? 'pause' : 'continuous'}
      </button>
    </div>
  );
};

export default Game;
