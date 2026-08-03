// =====================================================
// player.js
// =====================================================

class Player {

    constructor(name, startCell) {

        this.name = name.trim();

        this.cell = startCell;

        const pos = renderer.getCellCenter(startCell);

        this.x = pos.x;
        this.y = pos.y;

        this.targetX = pos.x;
        this.targetY = pos.y;

        this.radius = Config.playerRadius;

        this.baseRadius = Config.playerRadius;

        this.color =
            Config.colors[
                Math.floor(Math.random() * Config.colors.length)
            ];

        this.emoji = "🙂";

        this.speed = this.randomSpeed();

        this.speedTimer = 0;

        this.finished = false;

        this.rank = 0;

        this.state = "waiting";

        this.bounce = Math.random() * Math.PI * 2;

        this.wiggle = Math.random() * Math.PI * 2;

        this.trail = [];

        this.maxTrail = Config.trailLength;

        this.glow = 0;

        this.finishAnimation = 0;

        this.waitTimer = 0;

    }

    randomSpeed() {

        return (
            Config.speedMin +
            Math.random() *
            (Config.speedMax - Config.speedMin)
        );

    }

    setTarget(cell) {

        this.cell = cell;

        const p = renderer.getCellCenter(cell);

        this.targetX = p.x;
        this.targetY = p.y;

    }

    update(dt) {

        if (this.finished) {

            this.updateFinish(dt);

            return;

        }

        this.updateSpeed(dt);

        this.move(dt);

        this.animate(dt);

        this.updateTrail();

    }

    updateSpeed(dt) {

        this.speedTimer += dt;

        if (this.speedTimer > 800 + Math.random() * 1200) {

            this.speedTimer = 0;

            this.speed = this.randomSpeed();

        }

    }

    move(dt) {

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;

        const dist = Math.hypot(dx, dy);

        if (dist < 0.5)
            return;

        const move =
            this.speed * dt * 0.05;

        this.x += dx / dist * Math.min(move, dist);

        this.y += dy / dist * Math.min(move, dist);

    }

    animate(dt) {

        this.bounce += dt * 0.012;

        this.wiggle += dt * 0.01;

        this.glow =
            0.5 +
            Math.sin(this.bounce * 2) * 0.5;

    }

    updateTrail() {

        this.trail.push({

            x: this.x,

            y: this.y,

            life: 1

        });

        while (
            this.trail.length >
            this.maxTrail
        ) {

            this.trail.shift();

        }

        for (const t of this.trail) {

            t.life -= 0.02;

        }

        this.trail =
            this.trail.filter(t => t.life > 0);

    }

    updateFinish(dt) {

        this.finishAnimation += dt * 0.01;

        this.radius =
            this.baseRadius +
            Math.sin(this.finishAnimation) * 4;

    }

    getRenderX() {

        return (
            this.x +
            Math.sin(this.wiggle) *
            Config.wiggle
        );

    }

    getRenderY() {

        return (
            this.y -
            Math.abs(
                Math.sin(this.bounce)
            ) *
            Config.bounceHeight
        );

    }

    think(ms) {

        this.state = "thinking";

        this.waitTimer = ms;

    }

    updateThinking(dt) {

        if (this.waitTimer <= 0)
            return;

        this.waitTimer -= dt;

        if (this.waitTimer <= 0) {

            this.state = "running";

        }

    }

    finish(rank) {

        this.finished = true;

        this.rank = rank;

        this.state = "finished";

    }

}
// =====================================================
// player.js (Part 2/2)
// =====================================================

let players = [];

class PlayerManager {

    constructor() {

        this.players = players;

    }

    createPlayers(names, startCell) {

        players.length = 0;

        const usedColors = [];

        for (const rawName of names) {

            const name = rawName.trim();

            if (!name)
                continue;

            const p = new Player(name, startCell);

            // พยายามไม่ให้สีซ้ำติดกัน
            let retry = 0;

            while (
                usedColors.includes(p.color) &&
                retry < 20
            ) {

                p.color =
                    Config.colors[
                        Math.floor(
                            Math.random() *
                            Config.colors.length
                        )
                    ];

                retry++;

            }

            usedColors.push(p.color);

            p.state = "running";

            players.push(p);

        }

        this.assignUniqueEmojis(players);

        this.players = players;

        return players;

    }

    shuffle(list) {

        for (let i = list.length - 1; i > 0; i--) {

            const j =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );

            const temp = list[i];

            list[i] = list[j];

            list[j] = temp;

        }

        return list;

    }

    assignUniqueEmojis(targetPlayers) {

        if (!targetPlayers || targetPlayers.length === 0)
            return;

        const emojiPool =
            this.shuffle([...Config.faceEmojis]);

        for (let i = 0; i < targetPlayers.length; i++) {

            targetPlayers[i].emoji =
                emojiPool[i] ||
                Config.faceEmojis[
                    i %
                    Config.faceEmojis.length
                ];

        }

    }

    reshufflePlayerEmojis() {

        this.assignUniqueEmojis(players);

    }

    update(dt) {

        for (const p of players) {

            p.updateThinking(dt);

            p.update(dt);

        }

    }

    draw(renderer) {

        const ctx = renderer.ctx;

        for (const p of players) {

            this.drawTrail(ctx, p);

        }

        for (const p of players) {

            this.drawPlayer(renderer, p);

        }

    }

    drawTrail(ctx, player) {

        if (player.trail.length < 2)
            return;

        ctx.save();

        ctx.lineWidth = 4;

        ctx.lineCap = "round";

        for (let i = 1; i < player.trail.length; i++) {

            const a = player.trail[i - 1];
            const b = player.trail[i];

            ctx.beginPath();

            ctx.strokeStyle =
                this.hexToRGBA(
                    player.color,
                    b.life * 0.35
                );

            ctx.moveTo(a.x, a.y);

            ctx.lineTo(b.x, b.y);

            ctx.stroke();

        }

        ctx.restore();

    }

    drawPlayer(renderer, player) {

        const ctx = renderer.ctx;

        const x = player.getRenderX();

        const y = player.getRenderY();

        this.drawGlow(
            ctx,
            x,
            y,
            player
        );

        ctx.save();

        ctx.beginPath();

        ctx.fillStyle = player.color;

        ctx.arc(
            x,
            y,
            player.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.lineWidth = 2;

        ctx.strokeStyle = "#ffffff";

        ctx.stroke();

        ctx.restore();

        this.drawName(
            ctx,
            player,
            x,
            y
        );

        if (player.state === "thinking") {

            this.drawThinking(
                ctx,
                x,
                y
            );

        }

    }

    drawGlow(ctx, x, y, player) {

        ctx.save();

        ctx.shadowBlur =
            15 + player.glow * 15;

        ctx.shadowColor = player.color;

        ctx.beginPath();

        ctx.fillStyle = player.color;

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

    drawName(ctx, player, x, y) {

        ctx.save();

        ctx.font = `${Config.playerNameFontSize}px Segoe UI`;

        ctx.textAlign = "center";

        ctx.fillStyle = "#111";

        ctx.fillText(
            player.name,
            x,
            y - 18
        );

        ctx.restore();

    }

    drawThinking(ctx, x, y) {

        ctx.save();

        ctx.fillStyle = "#444";

        ctx.font = "16px sans-serif";

        ctx.textAlign = "center";

        ctx.fillText(
            "...",
            x,
            y - 32
        );

        ctx.restore();

    }

    finish(player, rank) {

        player.finish(rank);

    }

    hexToRGBA(hex, alpha) {

        const r =
            parseInt(
                hex.substring(1, 3),
                16
            );

        const g =
            parseInt(
                hex.substring(3, 5),
                16
            );

        const b =
            parseInt(
                hex.substring(5, 7),
                16
            );

        return `rgba(${r},${g},${b},${alpha})`;

    }

}

const playerManager = new PlayerManager();