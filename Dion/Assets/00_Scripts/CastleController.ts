// ============================================================
// CastleController.ts
// ============================================================

import { Animation } from "./Animation";
import { Easing } from "./Easing";

@component
export class CastleController extends BaseScriptComponent {

  @input camera: Camera;
  @input castleParent: SceneObject;

  @ui.separator
  @input('float') followDistance: number = 150;   
  @input('float') followHeight:   number = -20;  
  @input('float') followSmooth:   number = 5;     

  @ui.separator
  @input('float') fadeInDuration: number = 1.5;
  @input('float') alphaMid: number = 0.2;
  @input animationPlayer: AnimationPlayer;       

  @ui.separator
  @input('Component.MeshVisual[]') meshesMat: Material[];

  // --- Private ---

  private castleParentTransform: Transform;
  private cameraTransform: Transform;
  private targetPosition: vec3;

  onAwake(): void {
    let eventUpdate = this.createEvent('UpdateEvent');
    eventUpdate.bind(this.onUpdate.bind(this));

    this.castleParentTransform = this.castleParent.getTransform();
    this.cameraTransform = this.camera.getTransform();

    this.targetPosition = this.getTargetPosition();

    this.castleParentTransform.setWorldPosition(this.targetPosition);

    // castle visibles on start
    this.setMeshesAlpha(1);
  }

  onUpdate(): void {
    this.updateFollow();
  }

  // ----------------------------------------------------------
  // Follow camera
  // ----------------------------------------------------------

  private updateFollow(): void {
    this.targetPosition = this.getTargetPosition();

    const current = this.castleParentTransform.getWorldPosition();
    const deltaTime = getDeltaTime();
    const lerpFactor = Math.min(this.followSmooth * deltaTime, 1);

    const smoothed = vec3.lerp(current, this.targetPosition, lerpFactor);
    this.castleParentTransform.setWorldPosition(smoothed);
  }

  private getTargetPosition(): vec3 {
    const camPos     = this.cameraTransform.getWorldPosition();
    const camForward = this.cameraTransform.forward;

    return new vec3(
      camPos.x + camForward.x * this.followDistance,
      this.followHeight,
      camPos.z + camForward.z * this.followDistance
    );
  }

  // ----------------------------------------------------------
  // Fade all meshs
  // ----------------------------------------------------------

  fadeInMeshes(): void {
    this.meshesMat.forEach((mat) => {
      if (!mat) return;

      new Animation({
        duration: this.fadeInDuration,
        easing: Easing.easeInOutQuad,
        onUpdate: (progress) => {
          mat.mainPass.baseColor = new vec4(1, 1, 1, progress);
        },
        onComplete: () => {
          
        },
      }).play();
    });
  }

  fadeOutMeshes(onComplete?: () => void): void {
    let completedCount = 0;

    this.meshesMat.forEach((mat) => {
      if (!mat) return;

      new Animation({
        duration: this.fadeInDuration,
        easing: Easing.easeInOutQuad,
        onUpdate: (progress) => {
          mat.mainPass.baseColor = new vec4(1, 1, 1, 1 - progress);
        },
        onComplete: () => {
          completedCount++;
          if (completedCount === this.meshesMat.length) {
            onComplete?.();
          }
        },
      }).play();
    });
  }

  fadeMidMeshes(from : number, idExclude?: number): void {
    for(let i = 0; i < this.meshesMat.length; i++){
        if(i != idExclude){
            this.fadePart(i, from, this.alphaMid, this.fadeInDuration);
        }
        
    }
  }

  // ----------------------------------------------------------
  // Animation FBX 
  // ----------------------------------------------------------

  playAnimation(): void {
    if (!this.animationPlayer) {
      print("[CastleController] Aucun AnimationPlayer assigné !");
      return;
    }
    this.animationPlayer.playAll();
  }

  stopAnimation(): void {
    this.animationPlayer?.stopAll();
  }

  // ----------------------------------------------------------
  // Fade — single part
  // ----------------------------------------------------------

  fadePart(
    id: number,
    from: number,
    to: number,
    duration: number,
    onComplete?: () => void
  ): void {

    if(this.meshesMat.length <= id){
        print("Wrong id :" + id);
        return;
    }

    const mat = this.meshesMat[id];
    if (!mat) return;

    // Set starting alpha immediately
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

  // ----------------------------------------------------------
  // Utils
  // ----------------------------------------------------------

  setMeshesAlpha(alpha: number): void {
    this.meshesMat.forEach((mat) => {
      if (mat) {
        mat.mainPass.baseColor = new vec4(1, 1, 1, alpha);
      }
    });
  }

  setMeshAlpha(alpha: number, id: number): void {
    if(this.meshesMat.length <= id){return;}
    this.meshesMat[id].mainPass.baseColor = new vec4(1, 1, 1, alpha);
  }
}