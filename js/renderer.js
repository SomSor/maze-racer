// =====================================================
// renderer.js v2 (Part 1/2)
// =====================================================

class MazeRenderer {

    constructor(canvasId) {

        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = Config.canvasSize;
        this.canvas.height = Config.canvasSize;

        this.cellSize = Config.cellSize;

    }

    //==================================================

    render(maze) {

        this.clear();

        // ชั้นที่ 1
        this.drawBackground();

        // ชั้นที่ 2
        this.drawMaze(maze);

        // ชั้นที่ 3
        if (Config.showShortestPath) {

            this.drawShortestPath(maze);

        }

        // ชั้นที่ 4
        this.drawStart(maze);

        // ชั้นที่ 5
        this.drawGoal(maze);

        // ชั้นที่ 6
        if (typeof players !== "undefined") {

            this.drawPlayers(players);

        }

    }

    //==================================================

    clear() {

        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

    }

    //==================================================

    drawBackground() {

        const ctx = this.ctx;

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

    }

    //==================================================

    drawMaze(maze) {

        const ctx = this.ctx;

        const s = this.cellSize;

        ctx.save();

        ctx.strokeStyle = "#202020";

        ctx.lineWidth = Config.wallWidth;

        ctx.lineCap = "round";

        for (const row of maze.grid) {

            for (const cell of row) {

                const x = cell.col * s;

                const y = cell.row * s;

                ctx.beginPath();

                if (cell.walls.top) {

                    ctx.moveTo(x, y);
                    ctx.lineTo(x + s, y);

                }

                if (cell.walls.right) {

                    ctx.moveTo(x + s, y);
                    ctx.lineTo(x + s, y + s);

                }

                if (cell.walls.bottom) {

                    ctx.moveTo(x, y + s);
                    ctx.lineTo(x + s, y + s);

                }

                if (cell.walls.left) {

                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + s);

                }

                ctx.stroke();

            }

        }

        ctx.restore();

    }

    //==================================================

    drawStart(maze) {

        const cell = maze.start;

        const s = this.cellSize;

        const x = cell.col * s;

        const y = cell.row * s;

        const ctx = this.ctx;

        ctx.save();

        ctx.fillStyle = "#43A047";

        ctx.fillRect(
            x + 6,
            y + 6,
            s - 12,
            s - 12
        );

        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 16px sans-serif";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(
            "S",
            x + s / 2,
            y + s / 2
        );

        ctx.restore();

    }

    //==================================================

    drawGoal(maze) {

        const cell = maze.end;

        const s = this.cellSize;

        const x = cell.col * s;

        const y = cell.row * s;

        const ctx = this.ctx;

        ctx.save();

        ctx.fillStyle = "#E53935";

        ctx.fillRect(
            x + 6,
            y + 6,
            s - 12,
            s - 12
        );

        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 16px sans-serif";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(
            "G",
            x + s / 2,
            y + s / 2
        );

        ctx.restore();

    }

    //==================================================

    drawShortestPath(maze) {

        if (!maze.shortestPath)
            return;

        if (maze.shortestPath.length < 1)
            return;

        const ctx = this.ctx;

        const s = this.cellSize;

        ctx.save();

        ctx.fillStyle = "rgba(33, 150, 243, 0.22)";

        for (const cell of maze.shortestPath) {

            const x = cell.col * s;

            const y = cell.row * s;

            ctx.fillRect(
                x,
                y,
                s,
                s
            );

        }

        ctx.restore();

    }

    //==================================================

    getCellCenter(cell) {

        return {

            x:
                cell.col * this.cellSize +
                this.cellSize / 2,

            y:
                cell.row * this.cellSize +
                this.cellSize / 2

        };

    }

    //==================================================

    hexToRGBA(hex, alpha) {

        const r =
            parseInt(hex.substring(1, 3), 16);

        const g =
            parseInt(hex.substring(3, 5), 16);

        const b =
            parseInt(hex.substring(5, 7), 16);

        return `rgba(${r},${g},${b},${alpha})`;

    }

    //==================================================

    drawCircle(x, y, radius, color) {

        const ctx = this.ctx;

        ctx.beginPath();

        ctx.fillStyle = color;

        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }
    //==================================================
    // วาดผู้เล่นทั้งหมด
    //==================================================

    drawPlayers(players) {

        if (!players || players.length === 0)
            return;

        // วาด Trail ก่อน
        for (const player of players) {

            this.drawTrail(player);

        }

        // แล้วค่อยวาด Player
        for (const player of players) {

            this.drawPlayer(player);

        }

    }

    //==================================================
    // Trail
    //==================================================

    drawTrail(player) {

        const ctx = this.ctx;

        if (!player.trail)
            return;

        if (player.trail.length < 2)
            return;

        ctx.save();

        ctx.lineCap = "round";

        for (let i = 1; i < player.trail.length; i++) {

            const p1 = player.trail[i - 1];
            const p2 = player.trail[i];

            const alpha = p2.life * 0.35;

            ctx.strokeStyle =
                this.hexToRGBA(
                    player.color,
                    alpha
                );

            ctx.lineWidth =
                player.radius * alpha;

            ctx.beginPath();

            ctx.moveTo(
                p1.x,
                p1.y
            );

            ctx.lineTo(
                p2.x,
                p2.y
            );

            ctx.stroke();

        }

        ctx.restore();

    }

    //==================================================
    // Glow
    //==================================================

    drawGlow(player, x, y) {

        const ctx = this.ctx;

        ctx.save();

        ctx.shadowBlur =
            20 + player.glow * 20;

        ctx.shadowColor =
            player.color;

        ctx.fillStyle =
            player.color;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            player.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    }

    //==================================================
    // ชื่อผู้เล่น
    //==================================================

    drawName(player, x, y) {

        const ctx = this.ctx;

        ctx.save();

        ctx.font =
            `bold ${Config.playerNameFontSize}px Segoe UI`;

        ctx.textAlign = "center";

        ctx.fillStyle =
            "#222";

        ctx.fillText(

            player.name,

            x,

            y - 18

        );

        ctx.restore();

    }

    //==================================================
    // Thinking
    //==================================================

    drawThinking(player, x, y) {

        if (
            player.state !== "thinking"
        )
            return;

        const ctx = this.ctx;

        ctx.save();

        const frame =
            Math.floor(
                performance.now() / 250
            ) % 4;

        let text = "";

        for (let i = 0; i < frame; i++) {

            text += ".";

        }

        ctx.font =
            "16px monospace";

        ctx.textAlign = "center";

        ctx.fillStyle =
            "#555";

        ctx.fillText(

            text,

            x,

            y - 35

        );

        ctx.restore();

    }

    //==================================================
    // Winner Effect
    //==================================================

    drawWinner(player, x, y) {

        if (!player.finished)
            return;

        const ctx = this.ctx;

        const r =
            player.radius +
            Math.sin(
                performance.now() * 0.01
            ) * 3;

        ctx.save();

        ctx.strokeStyle =
            "#FFD700";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.arc(

            x,

            y,

            r + 4,

            0,

            Math.PI * 2

        );

        ctx.stroke();

        ctx.restore();

    }

    //==================================================
    // Player
    //==================================================

    drawPlayer(player) {

        const x =
            player.getRenderX();

        const y =
            player.getRenderY();

        this.drawEmoji(
            player,
            x,
            y
        );

        this.drawWinner(
            player,
            x,
            y
        );

        this.drawName(
            player,
            x,
            y
        );

        this.drawThinking(
            player,
            x,
            y
        );

    }

    drawEmoji(player, x, y) {

        const ctx = this.ctx;

        ctx.save();

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.font =
            `${Config.playerEmojiFontSize}px Segoe UI Emoji`;

        ctx.fillText(
            player.emoji || "🙂",
            x,
            y + 1
        );

        ctx.restore();

    }

}

//======================================================

const renderer =
    new MazeRenderer(
        "mazeCanvas"
    );