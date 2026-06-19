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

  @input camera: Camera;

  @input('SceneObject[]') infoPlanes: SceneObject[];
  @input('Asset.Material[]') infoPlaneMats: Material[];

  @input('float') fadeDuration: number = 1.0;

  // --- Private ---

  private cameraTransform: Transform;
  private planeTransforms: Transform[] = [];

  onAwake(): void {
    let eventUpdate = this.createEvent('UpdateEvent');
      eventUpdate.bind(this.onUpdate.bind(this));

    this.cameraTransform = this.camera.getTransform();

    //store tr
    this.infoPlanes.forEach((plane) => {
      this.planeTransforms.push(plane.getTransform());
    });
    
    //Start Opacity
    this.infoPlaneMats.forEach((mat) => {
      mat.mainPass.baseColor = new vec4(1, 1, 1, 0);
    });
  }

  onUpdate(): void {
    this.updateBillboards();
  }

  // ----------------------------------------------------------
  // Billboard — make every plane face the camera (Y axis only)
  // ----------------------------------------------------------

  private updateBillboards(): void {
    const camPos = this.cameraTransform.getWorldPosition();

    this.planeTransforms.forEach((planeTransform) => {
      const planePos = planeTransform.getWorldPosition();

      // Flat direction toward camera (ignore Y)
      const dir = new vec3(
        camPos.x - planePos.x,
        0,
        camPos.z - planePos.z
      );

      if (dir.length < 0.001) return; // Avoid NaN if overlapping

      const angle = Math.atan2(dir.x, dir.z);

      planeTransform.setWorldRotation(
        quat.fromEulerAngles(0, angle, 0)
      );
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