// =====================================================
// maze.js (Part 1/2)
// Perfect Maze Generator (DFS)
// =====================================================

class Cell {

    constructor(row, col) {

        this.row = row;
        this.col = col;

        // Top Right Bottom Left
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true
        };

        this.visited = false;
    }

}

class MazeGenerator {

    constructor(size) {

        this.size = size;

        this.grid = [];

        this.start = null;
        this.end = null;
        this.shortestPath = [];

        this.generate();

    }

    generate() {

        this.createGrid();

        this.generateDFS();

        this.randomStartEnd();

        this.shortestPath =
            this.findShortestPath(
                this.start,
                this.end
            );

    }

    createGrid() {

        this.grid = [];

        for (let r = 0; r < this.size; r++) {

            const row = [];

            for (let c = 0; c < this.size; c++) {

                row.push(new Cell(r, c));

            }

            this.grid.push(row);

        }

    }

    generateDFS() {

        const stack = [];

        const first = this.grid[0][0];

        first.visited = true;

        stack.push(first);

        while (stack.length > 0) {

            const current = stack[stack.length - 1];

            const neighbors = this.getUnvisitedNeighbors(current);

            if (neighbors.length === 0) {

                stack.pop();

                continue;

            }

            const next =
                neighbors[Math.floor(Math.random() * neighbors.length)];

            this.removeWall(current, next);

            next.visited = true;

            stack.push(next);

        }

        // reset visited

        for (const row of this.grid) {

            for (const cell of row) {

                cell.visited = false;

            }

        }

    }

    getCell(row, col) {

        if (row < 0) return null;
        if (col < 0) return null;
        if (row >= this.size) return null;
        if (col >= this.size) return null;

        return this.grid[row][col];

    }

    getUnvisitedNeighbors(cell) {

        const list = [];

        const top = this.getCell(cell.row - 1, cell.col);

        const right = this.getCell(cell.row, cell.col + 1);

        const bottom = this.getCell(cell.row + 1, cell.col);

        const left = this.getCell(cell.row, cell.col - 1);

        if (top && !top.visited)
            list.push(top);

        if (right && !right.visited)
            list.push(right);

        if (bottom && !bottom.visited)
            list.push(bottom);

        if (left && !left.visited)
            list.push(left);

        return list;

    }

    removeWall(a, b) {

        const dx = b.col - a.col;

        const dy = b.row - a.row;

        // Right

        if (dx === 1) {

            a.walls.right = false;

            b.walls.left = false;

            return;

        }

        // Left

        if (dx === -1) {

            a.walls.left = false;

            b.walls.right = false;

            return;

        }

        // Bottom

        if (dy === 1) {

            a.walls.bottom = false;

            b.walls.top = false;

            return;

        }

        // Top

        if (dy === -1) {

            a.walls.top = false;

            b.walls.bottom = false;

            return;

        }

    }
        randomStartEnd() {

        // เริ่มจากมุมซ้ายบน
        this.start = this.grid[0][0];

        // หา cell ที่ไกลที่สุดด้วย BFS
        const queue = [this.start];
        const visited = new Set();
        const distance = new Map();

        visited.add(this.key(this.start));
        distance.set(this.key(this.start), 0);

        let farthest = this.start;

        while (queue.length > 0) {

            const current = queue.shift();

            const currentDistance = distance.get(this.key(current));

            if (
                currentDistance >
                distance.get(this.key(farthest))
            ) {
                farthest = current;
            }

            const neighbors = this.getConnectedNeighbors(current);

            for (const next of neighbors) {

                const k = this.key(next);

                if (visited.has(k))
                    continue;

                visited.add(k);

                distance.set(
                    k,
                    currentDistance + 1
                );

                queue.push(next);

            }

        }

        this.end = farthest;

    }

    key(cell) {

        return `${cell.row},${cell.col}`;

    }

    getConnectedNeighbors(cell) {

        const result = [];

        if (!cell.walls.top) {

            const c = this.getCell(
                cell.row - 1,
                cell.col
            );

            if (c) result.push(c);

        }

        if (!cell.walls.right) {

            const c = this.getCell(
                cell.row,
                cell.col + 1
            );

            if (c) result.push(c);

        }

        if (!cell.walls.bottom) {

            const c = this.getCell(
                cell.row + 1,
                cell.col
            );

            if (c) result.push(c);

        }

        if (!cell.walls.left) {

            const c = this.getCell(
                cell.row,
                cell.col - 1
            );

            if (c) result.push(c);

        }

        return result;

    }

    canMove(cell, direction) {

        switch (direction) {

            case "top":
                return !cell.walls.top;

            case "right":
                return !cell.walls.right;

            case "bottom":
                return !cell.walls.bottom;

            case "left":
                return !cell.walls.left;

        }

        return false;

    }

    getNeighbor(cell, direction) {

        switch (direction) {

            case "top":
                return this.getCell(
                    cell.row - 1,
                    cell.col
                );

            case "right":
                return this.getCell(
                    cell.row,
                    cell.col + 1
                );

            case "bottom":
                return this.getCell(
                    cell.row + 1,
                    cell.col
                );

            case "left":
                return this.getCell(
                    cell.row,
                    cell.col - 1
                );

        }

        return null;

    }

    getAvailableDirections(cell) {

        const dirs = [];

        if (!cell.walls.top)
            dirs.push("top");

        if (!cell.walls.right)
            dirs.push("right");

        if (!cell.walls.bottom)
            dirs.push("bottom");

        if (!cell.walls.left)
            dirs.push("left");

        return dirs;

    }

    findShortestPath(fromCell, toCell) {

        if (!fromCell || !toCell)
            return [];

        const queue = [fromCell];

        const visited = new Set();

        const parent = new Map();

        const startKey = this.key(fromCell);

        const goalKey = this.key(toCell);

        visited.add(startKey);

        while (queue.length > 0) {

            const current = queue.shift();

            const currentKey = this.key(current);

            if (currentKey === goalKey)
                break;

            const neighbors =
                this.getConnectedNeighbors(current);

            for (const next of neighbors) {

                const nextKey = this.key(next);

                if (visited.has(nextKey))
                    continue;

                visited.add(nextKey);

                parent.set(nextKey, currentKey);

                queue.push(next);

            }

        }

        if (!visited.has(goalKey))
            return [];

        const path = [];

        let walkKey = goalKey;

        while (walkKey) {

            const parts = walkKey.split(",");

            const row = Number(parts[0]);

            const col = Number(parts[1]);

            const cell = this.getCell(row, col);

            if (cell)
                path.push(cell);

            if (walkKey === startKey)
                break;

            walkKey = parent.get(walkKey);

        }

        path.reverse();

        return path;

    }

    reset() {

        this.generate();

    }

}

// =====================================================
// Global Maze Instance
// =====================================================

let maze = null;

function createMaze() {

    maze = new MazeGenerator(Config.mazeSize);

    return maze;

}