// =====================================================
// effects.js
// Lightweight procedural SFX (WebAudio)
// =====================================================

class SoundEffects {

	constructor() {

		this.ctx = null;

		this.master = null;

		this.lastMoveAt = 0;

	}

	unlock() {

		if (!this.ctx) {

			const AudioContextClass =
				window.AudioContext || window.webkitAudioContext;

			if (!AudioContextClass)
				return;

			this.ctx = new AudioContextClass();

			this.master = this.ctx.createGain();
			this.master.gain.value = 0.2;
			this.master.connect(this.ctx.destination);

		}

		if (this.ctx.state === "suspended") {

			this.ctx.resume();

		}

	}

	isReady() {

		return !!this.ctx && !!this.master;

	}

	tone({ type = "sine", freq = 440, freqTo = null, duration = 0.12, volume = 0.12, attack = 0.004, release = 0.08 }) {

		if (!this.isReady())
			return;

		const now = this.ctx.currentTime;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = type;
		osc.frequency.setValueAtTime(freq, now);

		if (typeof freqTo === "number") {

			osc.frequency.exponentialRampToValueAtTime(
				Math.max(30, freqTo),
				now + duration
			);

		}

		gain.gain.setValueAtTime(0.0001, now);
		gain.gain.linearRampToValueAtTime(volume, now + attack);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(attack + 0.01, duration - release));

		osc.connect(gain);
		gain.connect(this.master);

		osc.start(now);
		osc.stop(now + duration);

	}

	playMove() {

		if (!this.isReady())
			return;

		const nowMs = performance.now();

		// keep footstep-like ticks from stacking too densely
		if (nowMs - this.lastMoveAt < 30)
			return;

		this.lastMoveAt = nowMs;

		const jitter = (Math.random() - 0.5) * 30;

		this.tone({
			type: "triangle",
			freq: 360 + jitter,
			freqTo: 280 + jitter * 0.3,
			duration: 0.065,
			volume: 0.07,
			attack: 0.002,
			release: 0.045
		});

	}

	playCountdownTick() {

		const jitter = (Math.random() - 0.5) * 14;

		this.tone({
			type: "sine",
			freq: 900 + jitter,
			freqTo: 860 + jitter,
			duration: 0.11,
			volume: 0.11,
			attack: 0.002,
			release: 0.06
		});

	}

	playCountdownStart() {

		if (!this.isReady())
			return;

		const now = this.ctx.currentTime;

		const playOne = (freq, at, vol) => {

			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();

			osc.type = "triangle";
			osc.frequency.setValueAtTime(freq, at);
			osc.frequency.exponentialRampToValueAtTime(freq * 1.08, at + 0.12);

			gain.gain.setValueAtTime(0.0001, at);
			gain.gain.linearRampToValueAtTime(vol, at + 0.008);
			gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);

			osc.connect(gain);
			gain.connect(this.master);

			osc.start(at);
			osc.stop(at + 0.17);

		};

		playOne(980, now, 0.11);
		playOne(1310, now + 0.09, 0.14);

	}

	playWin() {

		if (!this.isReady())
			return;

		const now = this.ctx.currentTime;

		const shimmer = (freq, offset, vol) => {

			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(freq, now + offset);
			osc.frequency.exponentialRampToValueAtTime(freq * 1.34, now + offset + 0.23);

			gain.gain.setValueAtTime(0.0001, now + offset);
			gain.gain.linearRampToValueAtTime(vol, now + offset + 0.014);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.34);

			osc.connect(gain);
			gain.connect(this.master);

			osc.start(now + offset);
			osc.stop(now + offset + 0.35);

		};

		shimmer(760, 0, 0.1);
		shimmer(1140, 0.035, 0.12);

	}

	playPodiumHooray() {

		if (!this.isReady())
			return;

		const now = this.ctx.currentTime;

		const cheerNote = (freq, offset, duration, volume, type = "triangle") => {

			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();

			const at = now + offset;

			osc.type = type;
			osc.frequency.setValueAtTime(freq, at);
			osc.frequency.exponentialRampToValueAtTime(freq * 1.16, at + duration * 0.65);

			gain.gain.setValueAtTime(0.0001, at);
			gain.gain.linearRampToValueAtTime(volume, at + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

			osc.connect(gain);
			gain.connect(this.master);

			osc.start(at);
			osc.stop(at + duration + 0.02);

		};

		// "hooray" feel: short rise + bright chord
		cheerNote(440, 0.00, 0.30, 0.11, "triangle");
		cheerNote(554, 0.06, 0.34, 0.10, "sine");
		cheerNote(659, 0.12, 0.36, 0.11, "triangle");
		cheerNote(880, 0.20, 0.30, 0.09, "sine");

	}

}

const soundFx = new SoundEffects();

