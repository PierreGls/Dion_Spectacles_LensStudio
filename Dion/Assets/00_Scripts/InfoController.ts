// ============================================================
// InfoController.ts
// Manages an array of 3D info planes that:
// - Always face the camera (Y axis rotation only, billboard)
// - Can be faded in/out individually
// ============================================================

import { Animation } from "./Animation";
import { Easing } from "./Easing";

@component
export class InfoController extends BaseScriptComponent {

  // --- Inspector ---

  @input('SceneObject[]') infoPlanes: SceneObject[];
  @input('Asset.Material[]') infoPlaneMats: Material[];

  @input('float') fadeDuration: number = 1.0;

  // --- Private ---

  onAwake(): void {
    //Start Opacity
    this.infoPlaneMats.forEach((mat) => {
      mat.mainPass.baseColor = new vec4(1, 1, 1, 0);
    });
  }


  // ----------------------------------------------------------
  // Fade — single plane (by index)
  // ----------------------------------------------------------

  fadeInPlane(index: number, duration?: number, onComplete?: () => void): void {
    this.fadePlane(index, 0, 1, duration ?? this.fadeDuration, onComplete);
  }

  fadeOutPlane(index: number, duration?: number, onComplete?: () => void): void {
    this.fadePlane(index, 1, 0, duration ?? this.fadeDuration, onComplete);
  }

  private fadePlane(
    index: number,
    from: number,
    to: number,
    duration: number,
    onComplete?: () => void
  ): void {
    const mat = this.infoPlaneMats[index];

    if (!mat) {
      print(`[InfoController] No material found at index: ${index}`);
      return;
    }

    mat.mainPass.baseColor = new vec4(1, 1, 1, from);

    new Animation({
      duration,
      easing: Easing.easeInOutQuad,
      onUpdate: (progress) => {
        const alpha = from + (to - from) * progress;
        mat.mainPass.baseColor = new vec4(1, 1, 1, alpha);
      },
      onComplete,
    }).play();
  }
}