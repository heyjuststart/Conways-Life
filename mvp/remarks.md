### How I Went about Creating This:

In order to implement Conway's Game of Life, I chose to go with
Polya's Problem Solving Technique.

#### Preparation
The gist seemed to be to create an interface which allows users to set initial values for a grid of cells, then click a
button which starts producing and displaying the next generations until the grid of cells stops changing.  It was also
apparent that I'd be dealing with potentially large grids of cells, so efficiency was a big consideration as each cell
had to check each of its 8 neighbors, so at best I envisioned my solution being O(8n), or for each cell in my grid, I'd
have to check 8 other cells.

### Devise a plan
Given this initial consideration, along with Conway's Rules, I decided to choose a 1 dimensional array as my data
structure for the grid, and
to use the value 0 to indicate a dead cell and 1 to indicate a living cell.  This would lead to a bit of awkwardness
inferring neighbors, but seemed like it would keep me in at Constant Time for accessing those neighbors.

In order to create the interface and display the cell generations as a visual grid that a user can interact with, I
chose to go with ReactJS and material-ui for the buttons and layout.  I chose to go with a canvas element for display of
the cell data.

I made these choices primarily for performance at the cost of familiarity (in terms of the canvas interface and storing
a 2d grid as a 1d array).

### Implementation
The hard parts for me were redrawing the grid, inferring a clicked cell from a mouse click on the grid, and accessing
neighbor cells from a given cell index.

#### Grid
For drawing the grid, I chose to layer two canvases on top of eachother.  This lets you draw the grid lines once on the
background canvas and not have to draw them again.  You can then draw to the foreground canvas and clear it without
effecting the grid lines.  I redrew the grid each time the cell array changed.

For inferring from a mouse click on the canvas to the cell index, I used a mouseClick prop on the canvas element along
with a `ref` prop and `useRef` hook usage.  This reference let me access the canvas element, and calculate from its
dimensions to where the user clicked from the mouse event's `clientX` and `clientY` coordinates.


Finally, for finding a cell's neighbors from its index, I had to use what turned out to be simple arithmetic using
`cellsPerRow`, and `cellsPerColumn` to get the cell's `row` and `column` coordinates.  From there I'd just check cells
in a range from `column - 1` to `column + 1` for each row in `row - 1` to `row + 1`.  This gave me a liveNeighbor count
for each cell with which I could apply Conway's rules and decide whether they die or not for the next iteration.  It was
heavily suggested that we use Double Buffering for this, but it seemed like we automatically do that with React's
pattern.  The previous buffer is the last cell state and the new buffer is the next state of the cells array.  Each time
I setState to a new set of cells, I am swapping the buffers.

### Future Improvements
If I'm storing cells in react state, I am likely not double buffering properly.  I feel like I'm creating new arrays
each time and allocating / de-allocating large chunks of memory each cycle instead of switching reference pointers to
each array and skipping re-allocating this memory.  I feel like there's room for improvement there.

Also, there's likely room for improvement in my hook usage to improve code quality and readability.
