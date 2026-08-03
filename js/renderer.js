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

    render(maze, effects = {}) {

        this.clear();

        const countdown = effects.countdown || null;

        const shake =
            countdown
                ? countdown.shake || 0
                : 0;

        if (shake > 0) {

            const offsetX =
                (Math.random() * 2 - 1) * shake;

            const offsetY =
                (Math.random() * 2 - 1) * shake;

            this.ctx.save();

            this.ctx.translate(offsetX, offsetY);

        }

        // ชั้นที่ 1
        this.drawBackground();

        // ชั้นที่ 2
        this.drawMaze(maze);

        // ชั้นที่ 3
        if (Config.showShortestPath) {

            this.drawShortestPath(maze);

        }

        // ชั้นที่ 4
        this.drawStart(maze, countdown);

        // ชั้นที่ 5
        this.drawGoal(maze);

        // ชั้นที่ 6
        if (typeof players !== "undefined") {

            this.drawPlayers(players);

        }

        if (shake > 0) {

            this.ctx.restore();

        }

        if (countdown) {

            this.drawCountdownFlash(countdown);

        }

        // ชั้นที่ 7
        if (effects.podium) {

            this.drawPodiumSequence(effects.podium);

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

    drawStart(maze, countdown = null) {

        const cell = maze.start;

        const s = this.cellSize;

        const cx = cell.col * s + s / 2;

        const cy = cell.row * s + s / 2;

        const r = s * 0.38;

        const ctx = this.ctx;

        ctx.save();

        const flashBoost =
            countdown
                ? 1 + (countdown.flash || 0) * 1.6
                : 1;

        // glow
        ctx.shadowBlur = 18 * flashBoost;
        ctx.shadowColor = "#69F0AE";

        ctx.beginPath();
        ctx.roundRect(cx - r, cy - r, r * 2, r * 2, r * 0.3);
        ctx.fillStyle =
            countdown
                ? `rgba(27,94,32,${0.78 + (countdown.flash || 0) * 0.2})`
                : "#1B5E20";
        ctx.fill();
        ctx.strokeStyle = "#69F0AE";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.font = `bold ${Math.round(s * 0.38)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("🚦", cx, cy);

        ctx.restore();

    }

    //==================================================
    // Start Countdown Flash
    //==================================================

    drawCountdownFlash(countdown) {

        if (!countdown)
            return;

        const ctx = this.ctx;

        const w = this.canvas.width;

        const h = this.canvas.height;

        const pulse = countdown.flash || 0;

        ctx.save();

        ctx.fillStyle = `rgba(255,255,255,${0.08 + pulse * 0.18})`;
        ctx.fillRect(0, 0, w, h);

        const scale = 1 + pulse * 0.22;

        ctx.translate(w / 2, h * 0.2);
        ctx.scale(scale, scale);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 72px Segoe UI";
        ctx.fillStyle = `rgba(255,255,255,${0.82 + pulse * 0.16})`;
        ctx.strokeStyle = `rgba(16,16,16,${0.45 + pulse * 0.25})`;
        ctx.lineWidth = 5;

        const text = String(countdown.value);

        ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);

        ctx.restore();

    }

    //==================================================

    drawGoal(maze) {

        const cell = maze.end;

        const s = this.cellSize;

        const cx = cell.col * s + s / 2;

        const cy = cell.row * s + s / 2;

        const r = s * 0.38;

        const ctx = this.ctx;

        ctx.save();

        // glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#FFD740";

        ctx.beginPath();
        ctx.roundRect(cx - r, cy - r, r * 2, r * 2, r * 0.3);
        ctx.fillStyle = "#B71C1C";
        ctx.fill();
        ctx.strokeStyle = "#FFD740";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.font = `bold ${Math.round(s * 0.38)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("🏁", cx, cy);

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

        const total = maze.shortestPath.length;

        maze.shortestPath.forEach((cell, i) => {

            // t=0 (start) → เขียว (hue 120), t=1 (end) → แดง (hue 0)
            const t = i / Math.max(total - 1, 1);

            const hue = Math.round(120 - t * 120);

            ctx.fillStyle = `hsla(${hue}, 85%, 60%, 0.4)`;

            ctx.fillRect(cell.col * s, cell.row * s, s, s);

        });

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

        const now = performance.now();

        const bubbleY = y - 38;

        const bubbleW = 34;

        const bubbleH = 22;

        const bubbleR = 9;

        ctx.fillStyle = "rgba(255,255,255,0.95)";

        ctx.strokeStyle = "rgba(50,50,50,0.25)";

        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(
            x - bubbleW / 2,
            bubbleY - bubbleH / 2,
            bubbleW,
            bubbleH,
            bubbleR
        );
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - 6, bubbleY + bubbleH / 2 - 1);
        ctx.lineTo(x - 1, bubbleY + bubbleH / 2 + 8);
        ctx.lineTo(x + 3, bubbleY + bubbleH / 2 - 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const dotSpacing = 8;
        const dotBaseY = bubbleY;

        for (let i = 0; i < 3; i++) {

            const phase = (now * 0.01) - i * 0.8;

            const lift = Math.sin(phase) * 1.7;

            const pulse = 0.65 + (Math.sin(phase) + 1) * 0.175;

            ctx.fillStyle = `rgba(90,90,90,${pulse.toFixed(3)})`;

            ctx.beginPath();
            ctx.arc(
                x + (i - 1) * dotSpacing,
                dotBaseY + lift,
                2.4,
                0,
                Math.PI * 2
            );
            ctx.fill();

        }

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

    //==================================================
    // Finish Podium Sequence
    //==================================================

    drawPodiumSequence(podium) {

        if (!podium || !podium.top3)
            return;

        if (podium.top3.length < 1)
            return;

        const ctx = this.ctx;

        const w = this.canvas.width;

        const h = this.canvas.height;

        const progress =
            Math.min(1, podium.elapsed / 800);

        const rise =
            1 - Math.pow(1 - progress, 3);

        const shimmer =
            0.5 + Math.sin(performance.now() * 0.01) * 0.5;

        ctx.save();

        ctx.fillStyle = "rgba(5,12,20,0.55)";
        ctx.fillRect(0, 0, w, h);

        const titleAlpha =
            Math.min(1, podium.elapsed / 450);

        ctx.globalAlpha = titleAlpha;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fffde7";
        ctx.font = "bold 42px Segoe UI";
        ctx.fillText("Finish Podium", w / 2, h * 0.18);

        ctx.font = "bold 22px Segoe UI";
        ctx.fillStyle = "rgba(255,245,157,0.95)";
        ctx.fillText("Top 3", w / 2, h * 0.24);

        ctx.globalAlpha = 1;

        const layout = [
            { rank: 2, x: w * 0.33, baseHeight: 120, color: "#B0BEC5" },
            { rank: 1, x: w * 0.5,  baseHeight: 170, color: "#FFD54F" },
            { rank: 3, x: w * 0.67, baseHeight: 95,  color: "#CE93D8" }
        ];

        const podiumWidth =
            Math.max(58, Math.min(108, this.cellSize * 1.35));

        const floorY = h * 0.86;

        for (const slot of layout) {

            const winner =
                podium.top3[slot.rank - 1];

            if (!winner)
                continue;

            const columnHeight =
                slot.baseHeight * rise;

            const y = floorY - columnHeight;

            ctx.save();

            ctx.shadowBlur =
                12 + shimmer * 8;
            ctx.shadowColor = slot.color;
            ctx.fillStyle = slot.color;

            ctx.beginPath();
            ctx.roundRect(
                slot.x - podiumWidth / 2,
                y,
                podiumWidth,
                columnHeight,
                10
            );
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(255,255,255,0.45)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = "#1d1d1d";
            ctx.font = "bold 24px Segoe UI";
            ctx.textAlign = "center";
            ctx.fillText(
                String(slot.rank),
                slot.x,
                y + 28
            );

            ctx.font = "42px Segoe UI Emoji";
            ctx.fillText(
                winner.emoji,
                slot.x,
                y - 18
            );

            ctx.font = "bold 18px Segoe UI";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(
                winner.name,
                slot.x,
                y - 56
            );

            ctx.restore();

        }

        ctx.restore();

    }

}

//======================================================

const renderer =
    new MazeRenderer(
        "mazeCanvas"
    );