// ============================================================
// AnimationManager.ts — Singleton global, to attach to an object
// ============================================================

import { Animation } from "./Animation";

@component
export class AnimationManager extends BaseScriptComponent {

  // Singleton
  private static instance: AnimationManager;

  static getInstance(): AnimationManager {
    return AnimationManager.instance;
  }

  // List current animations
  private activeAnimations: Animation[] = [];
  private pendingAnimations: Animation[] = [];

  onAwake(): void {
    if (AnimationManager.instance) {
      print("[AnimationManager] WARNING : plusieurs instances détectées !");
      return;
    }
    AnimationManager.instance = this;

    let eventUpdate = this.createEvent('UpdateEvent');
    eventUpdate.bind(this.onUpdate.bind(this));
  }

  /** register an animation (called by Animation.play()) */
  register(animation: Animation): void {
    this.pendingAnimations.push(animation);
  }

  onUpdate(): void {
    ///print(this.activeAnimations.length)
    //if (this.activeAnimations.length === 0) return;
    if (this.pendingAnimations.length > 0) {
      this.activeAnimations.push(...this.pendingAnimations);
      this.pendingAnimations = [];
    }

    if (this.activeAnimations.length === 0) return;

    const deltaTime = getDeltaTime();

    // On filtre les animations terminées en même temps qu'on les tick
    this.activeAnimations = this.activeAnimations.filter(
      (anim) => !anim.tick(deltaTime)
    );
  }
}