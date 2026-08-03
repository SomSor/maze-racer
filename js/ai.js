// =====================================================
// ai.js
// =====================================================

class MazeAI {

    constructor(player) {

        this.player = player;

        this.lastDirection = null;

        this.isWaiting = false;

        this.visitedCells = new Set();

        this.visitedCells.add(player.cell);

        this.pathStack = [];

        this.lastThinkCellKey = null;

    }

    update(dt) {

        if (this.player.finished)
            return;

        if (this.player.state === "thinking")
            return;

        if (!this.reachedTarget())
            return;

        this.chooseNextMove();

    }

    reachedTarget() {

        return (
            Math.abs(this.player.x - this.player.targetX) < 1 &&
            Math.abs(this.player.y - this.player.targetY) < 1
        );

    }

    chooseNextMove() {

        if (
            this.player.cell === maze.end
        ) {

            if (!this.player.finished) {

                this.player.finish(
                    players.filter(p => p.finished).length + 1
                );

            }

            return;

        }

        const allDirs =
            maze.getAvailableDirections(
                this.player.cell
            );

        let dirs;

        if (Config.noRevisit) {

            const unvisited = allDirs.filter(d => {
                const nb = maze.getNeighbor(this.player.cell, d);
                return nb && !this.visitedCells.has(nb);
            });

            if (unvisited.length > 0) {

                const shouldThink =
                    unvisited.length >= 3 ||
                    (
                        unvisited.length === 2 &&
                        Math.random() < 0.5
                    );

                const currentCellKey =
                    maze.key(this.player.cell);

                if (
                    shouldThink &&
                    this.lastThinkCellKey !== currentCellKey
                ) {

                    this.lastThinkCellKey = currentCellKey;

                    this.player.think(

                        Config.thinkingMin +
                        Math.random() *
                        (
                            Config.thinkingMax -
                            Config.thinkingMin
                        )

                    );

                    // คิดก่อน แล้วค่อยเลือกทางใน tick ถัดไป
                    return;

                }

                // เดินไปยัง cell ใหม่ พร้อม push cell ปัจจุบันลง stack
                const dir = unvisited[Math.floor(Math.random() * unvisited.length)];

                const next = maze.getNeighbor(this.player.cell, dir);

                if (!next) return;

                this.pathStack.push(this.player.cell);

                this.visitedCells.add(next);

                this.lastThinkCellKey = null;

                this.lastDirection = dir;

                this.player.setTarget(next);

            } else if (this.pathStack.length > 0) {

                // ทางตัน -> backtrack ผ่าน stack (ไม่ใช้ lastDirection)
                const prev = this.pathStack.pop();

                for (const d of allDirs) {
                    if (maze.getNeighbor(this.player.cell, d) === prev) {
                        this.lastDirection = d;
                        this.player.setTarget(prev);
                        break;
                    }
                }

            }

            return;

        }

        dirs = allDirs;

        // ไม่ย้อนกลับทันที ถ้ายังมีทางอื่น
        if (
            this.lastDirection &&
            dirs.length > 1
        ) {

            const back =
                this.getOpposite(
                    this.lastDirection
                );

            dirs =
                dirs.filter(d => d !== back);

        }

        // ทางแยกใหญ่คิดเสมอ, ทางเลือก 2 ทางคิด 50%
        const shouldThink =
            dirs.length >= 3 ||
            (
                dirs.length === 2 &&
                Math.random() < 0.5
            );

        const currentCellKey =
            maze.key(this.player.cell);

        if (
            shouldThink &&
            this.lastThinkCellKey !== currentCellKey
        ) {

            this.lastThinkCellKey = currentCellKey;

            this.player.think(

                Config.thinkingMin +
                Math.random() *
                (
                    Config.thinkingMax -
                    Config.thinkingMin
                )

            );

            // คิดก่อน แล้วค่อยตัดสินใจใน tick ถัดไป
            return;

        }

        const dir =
            dirs[
                Math.floor(
                    Math.random() *
                    dirs.length
                )
            ];

        this.lastDirection = dir;

        const next =
            maze.getNeighbor(
                this.player.cell,
                dir
            );

        if (!next)
            return;

        // ออกจากช่องนี้แล้ว จึงอนุญาตให้ช่องถัดไปคิดได้อีกครั้ง
        this.lastThinkCellKey = null;

        this.player.setTarget(next);

    }

    getOpposite(dir) {

        switch (dir) {

            case "top":
                return "bottom";

            case "bottom":
                return "top";

            case "left":
                return "right";

            case "right":
                return "left";

        }

        return null;

    }

}

class AIManager {

    constructor() {

        this.list = [];

    }

    create(players) {

        this.list = [];

        for (const p of players) {

            this.list.push(
                new MazeAI(p)
            );

        }

    }

    update(dt) {

        for (const ai of this.list) {

            ai.update(dt);

        }

    }

}

const aiManager = new AIManager();