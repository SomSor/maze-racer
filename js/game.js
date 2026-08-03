// =====================================================
// game.js
// =====================================================

class MazeGame {

    constructor() {

        this.running = false;

        this.lastTime = 0;

        this.animationId = null;

        this.finishOrder = [];

        this.previewPairs = [];

        this.originalPairs = [];

        this.goalDistanceMap = new Map();

        this.bindUI();

        this.newMaze();

    }

    bindUI() {

        const mazeSizeInput =
            document.getElementById("mazeSizeInput");

        const toggleShortestPath =
            document.getElementById("toggleShortestPath");

        mazeSizeInput.value =
            String(Config.mazeSize);

        toggleShortestPath.checked =
            !!Config.showShortestPath;

        mazeSizeInput.addEventListener(
            "change",
            () => this.applyMazeSizeFromUI()
        );

        toggleShortestPath.addEventListener(
            "change",
            () => {

                Config.showShortestPath =
                    toggleShortestPath.checked;

                this.render();

            }
        );

        document
            .getElementById("btnRandom")
            .addEventListener(
                "click",
                () => this.newMaze()
            );

        document
            .getElementById("btnStart")
            .addEventListener(
                "click",
                () => this.start()
            );

        document
            .getElementById("btnShuffle")
            .addEventListener(
                "click",
                () => this.shuffleNamesAndEmojis()
            );

        const speedMinInput =
            document.getElementById("speedMinInput");

        const speedMaxInput =
            document.getElementById("speedMaxInput");

        const speedRangeVal =
            document.getElementById("speedRangeVal");

        const speedRangeFill =
            document.getElementById("speedRangeFill");

        const minBound = 1;

        const maxBound = 20;

        const updateSpeedRangeUI = () => {

            speedRangeVal.textContent =
                `${Config.speedMin}-${Config.speedMax}`;

            const span = maxBound - minBound;

            const left =
                ((Config.speedMin - minBound) / span) * 100;

            const right =
                ((Config.speedMax - minBound) / span) * 100;

            speedRangeFill.style.left = `${left}%`;

            speedRangeFill.style.width = `${Math.max(0, right - left)}%`;

        };

        const syncSpeedRange = changed => {

            let min =
                parseInt(speedMinInput.value, 10);

            let max =
                parseInt(speedMaxInput.value, 10);

            if (min > max) {

                if (changed === "min") {

                    max = min;

                } else {

                    min = max;

                }

            }

            Config.speedMin =
                Math.max(minBound, Math.min(maxBound, min));

            Config.speedMax =
                Math.max(minBound, Math.min(maxBound, max));

            speedMinInput.value = String(Config.speedMin);

            speedMaxInput.value = String(Config.speedMax);

            updateSpeedRangeUI();

        };

        speedMinInput.value = String(Config.speedMin);

        speedMaxInput.value = String(Config.speedMax);

        syncSpeedRange("max");

        speedMinInput.addEventListener("input", () => {

            syncSpeedRange("min");

        });

        speedMaxInput.addEventListener("input", () => {

            syncSpeedRange("max");

        });

        const toggleNoRevisit = document.getElementById("toggleNoRevisit");
        toggleNoRevisit.checked = !!Config.noRevisit;

    }

    //--------------------------------------------------

    newMaze() {

        this.stop();

        createMaze();

        this.buildGoalDistanceMap();

        renderer.render(maze);

        this.finishOrder = [];

        this.originalPairs = [];

        this.updateLeaderboard();

    }

    //--------------------------------------------------

    applyMazeSizeFromUI() {

        const input =
            document.getElementById("mazeSizeInput");

        const parsed = Number(input.value);

        const size = Math.max(
            5,
            Math.min(60, Math.floor(parsed || Config.mazeSize))
        );

        input.value = String(size);

        if (size === Config.mazeSize)
            return;

        Config.mazeSize = size;

        Config.cellSize =
            Config.canvasSize / Config.mazeSize;

        renderer.cellSize = Config.cellSize;

        this.newMaze();

    }

    //--------------------------------------------------

    start() {

        this.stop();

        const names =
            document
            .getElementById("playerNames")
            .value
            .split("\n")
            .map(x => x.trim())
            .filter(x => x.length > 0);

        if (names.length === 0)
            return;

        playerManager.createPlayers(
            names,
            maze.start
        );

        const hasPreviewPairing =
            this.previewPairs.length === names.length &&
            names.every(
                (name, index) =>
                    this.previewPairs[index].name === name
            );

        const hasOriginalPairing =
            this.originalPairs.length === names.length &&
            names.every(
                (name, index) =>
                    this.originalPairs[index].name === name
            );

        const selectedPairing =
            hasPreviewPairing
                ? this.previewPairs
                : hasOriginalPairing
                    ? this.originalPairs
                    : null;

        if (selectedPairing) {

            for (let i = 0; i < players.length; i++) {

                players[i].emoji =
                    selectedPairing[i].emoji;

            }

        }

        this.previewPairs = [];

        this.originalPairs =
            players.map(player => ({
                emoji: player.emoji || "🙂",
                name: player.name
            }));

        Config.noRevisit =
            document.getElementById("toggleNoRevisit").checked;

        aiManager.create(players);

        this.finishOrder = [];

        this.running = true;

        this.lastTime = performance.now();

        this.loop(this.lastTime);

    }

    //--------------------------------------------------

    shuffleNamesAndEmojis() {

        const textarea =
            document.getElementById("playerNames");

        const names =
            textarea
            .value
            .split("\n")
            .map(x => x.trim())
            .filter(x => x.length > 0);

        if (names.length === 0)
            return;

        this.shuffleArray(names);

        textarea.value =
            names.join("\n");

        this.previewPairs =
            this.createPreviewPairs(names);

        this.originalPairs =
            this.previewPairs.map(pair => ({
                emoji: pair.emoji,
                name: pair.name
            }));

        if (players.length > 0) {

            const byName = new Map();

            for (const p of players) {

                if (!byName.has(p.name)) {

                    byName.set(p.name, []);

                }

                byName.get(p.name).push(p);

            }

            const reordered = [];

            for (const name of names) {

                const list = byName.get(name);

                const p =
                    list && list.length > 0
                        ? list.shift()
                        : null;

                if (p)
                    reordered.push(p);

            }

            players.length = 0;

            for (const p of reordered) {

                players.push(p);

            }

            for (let i = 0; i < players.length; i++) {

                const pair = this.previewPairs[i];

                if (pair)
                    players[i].emoji = pair.emoji;

            }

            this.finishOrder =
                this.finishOrder
                .filter(p => players.includes(p));

            this.render();

        }

        this.updateLeaderboard();

    }

    //--------------------------------------------------

    buildGoalDistanceMap() {

        this.goalDistanceMap = new Map();

        if (!maze || !maze.end)
            return;

        const queue = [maze.end];

        const startKey = maze.key(maze.end);

        this.goalDistanceMap.set(startKey, 0);

        while (queue.length > 0) {

            const current = queue.shift();

            const currentKey = maze.key(current);

            const baseDistance =
                this.goalDistanceMap.get(currentKey);

            const neighbors =
                maze.getConnectedNeighbors(current);

            for (const next of neighbors) {

                const nextKey = maze.key(next);

                if (this.goalDistanceMap.has(nextKey))
                    continue;

                this.goalDistanceMap.set(
                    nextKey,
                    baseDistance + 1
                );

                queue.push(next);

            }

        }

    }

    //--------------------------------------------------

    getRemainingSteps(player) {

        if (player.finished)
            return -1;

        const key = maze.key(player.cell);

        const steps =
            this.goalDistanceMap.get(key);

        if (typeof steps === "number")
            return steps;

        return Number.MAX_SAFE_INTEGER;

    }

    //--------------------------------------------------

    createPreviewPairs(names) {

        const emojiPool = [
            ...Config.faceEmojis
        ];

        this.shuffleArray(emojiPool);

        return names.map((name, index) => ({

            name,

            emoji:
                emojiPool[index] ||
                Config.faceEmojis[
                    index %
                    Config.faceEmojis.length
                ]

        }));

    }

    //--------------------------------------------------

    shuffleArray(list) {

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

    }

    //--------------------------------------------------

    stop() {

        this.running = false;

        if (this.animationId) {

            cancelAnimationFrame(
                this.animationId
            );

            this.animationId = null;

        }

    }

    //--------------------------------------------------

    loop(now) {

        if (!this.running)
            return;

        const dt = now - this.lastTime;

        this.lastTime = now;

        this.update(dt);

        this.render();

        this.animationId =
            requestAnimationFrame(
                t => this.loop(t)
            );

    }

    //--------------------------------------------------

    update(dt) {

        playerManager.update(dt);

        aiManager.update(dt);

        this.checkFinish();

    }

    //--------------------------------------------------

    render() {

        renderer.render(maze);

    }

    //--------------------------------------------------

    checkFinish() {

        for (const p of players) {

            if (
                p.finished &&
                !this.finishOrder.includes(p)
            ) {

                this.finishOrder.push(p);

            }

        }

        this.updateLeaderboard();

        if (
            players.length > 0 &&
            this.finishOrder.length === players.length
        ) {

            this.running = false;

        }

    }

    //--------------------------------------------------

    updateLeaderboard() {

        const ol =
            document.getElementById(
                "ranking"
            );

        const racerOl =
            document.getElementById(
                "racerList"
            );

        ol.innerHTML = "";

        racerOl.innerHTML = "";

        for (const pair of this.originalPairs) {

            const li =
                document.createElement("li");

            li.textContent =
                `${pair.emoji} ${pair.name}`;

            racerOl.appendChild(li);

        }

        if (
            players.length === 0 &&
            this.previewPairs.length > 0
        ) {

            for (const pair of this.previewPairs) {

                const li =
                    document.createElement("li");

                li.textContent =
                    `${pair.emoji} ${pair.name} (ready)`;

                ol.appendChild(li);

            }

            return;

        }

        const goalCenter =
            renderer.getCellCenter(maze.end);

        const stillRacing =
            players
                .filter(p => !p.finished)
                .sort((a, b) => {

                    const aSteps =
                        this.getRemainingSteps(a);

                    const bSteps =
                        this.getRemainingSteps(b);

                    if (aSteps !== bSteps)
                        return aSteps - bSteps;

                    const aDirect =
                        Math.hypot(
                            a.x - goalCenter.x,
                            a.y - goalCenter.y
                        );

                    const bDirect =
                        Math.hypot(
                            b.x - goalCenter.x,
                            b.y - goalCenter.y
                        );

                    return aDirect - bDirect;

                });

        // คนที่ finish แล้วล็อคลำดับตาม finishOrder ไว้ก่อน
        const ranking = [...this.finishOrder, ...stillRacing];

        ranking.forEach((player, index) => {

            const li =
                document.createElement(
                    "li"
                );

            let text =
                (player.emoji || "🙂") +
                " " +
                player.name;

            if (player.finished) {

                text +=
                    " 🏁";

            } else {

                text +=
                    " (" +
                    player.state +
                    ")";

            }

            li.textContent = text;

            ol.appendChild(li);

        });

    }

}

const game = new MazeGame();