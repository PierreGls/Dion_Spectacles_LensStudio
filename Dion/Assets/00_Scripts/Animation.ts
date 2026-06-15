// ============================================================
// Animation.ts — Object Animation
// ============================================================

import { Easing } from "./Easing";

export type EasingFunction = (t: number) => number;

export class Animation {
  private elapsed: number = 0;
  private isPlaying: boolean = false;
  private isFinished: boolean = false;

  readonly duration: number;
  readonly easing: EasingFunction;
  readonly onUpdate: (progress: number) => void;
  readonly onComplete?: () => void;

  constructor(config: {
    duration: number;
    easing?: EasingFunction;
    onUpdate: (progress: number) => void;
    onComplete?: () => void;
  }) {
    this.duration = config.duration;
    this.easing = config.easing ?? Easing.linear;
    this.onUpdate = config.onUpdate;
    this.onComplete = config.onComplete;
  }

  play(): void {
    this.elapsed = 0;
    this.isPlaying = true;
    this.isFinished = false;
    AnimationManager.getInstance().register(this);
  }

  stop(): void {
    this.isPlaying = false;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsFinished(): boolean {
    return this.isFinished;
  }

  /** Called by AnimationManager each frame */
  tick(deltaTime: number): boolean {
    if (!this.isPlaying) return true; //true = to delete

    this.elapsed += deltaTime;
    const rawProgress = Math.min(this.elapsed / this.duration, 1);
    const easedProgress = this.easing(rawProgress);

    this.onUpdate(easedProgress);

    if (rawProgress >= 1) {
      this.isPlaying = false;
      this.isFinished = true;
      this.onComplete?.();
      return true;
    }

    return false;
  }
}

export class Delay{
  private animation: Animation;
  constructor(config: {
    duration: number;
    onComplete?: () => void;
  }) {
    this.animation = new Animation({
        duration : config.duration,
        easing: Easing.linear,
        onUpdate: (progress) => {},
        onComplete: config.onComplete
      });
  }

  play(): void {
    this.animation.play();
  }

  stop(): void {
    this.animation.stop();
  }
}

import { AnimationManager } from "./AnimationManager";