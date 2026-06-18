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
  @ui.group_start("Placement")
  @input('float') placementHeight:   number = -20;  

  @ui.separator
  @input('boolean') alwaysFollowing: boolean = false;
  @input('float') @showIf("alwaysFollowing") followDistance: number = 150;   
  @input('float') @showIf("alwaysFollowing") followSmooth:   number = 5;    

  @ui.separator

  @input('boolean') isPlacementRelativeMarker: boolean = false;
  @input('float') @showIf("isPlacementRelativeMarker") distMarker: number = 150;   
  @ui.group_end 
  

  @ui.separator
  @input('float') fadeInDuration: number = 1.5;
  @input('float') alphaMid: number = 0.2;
  //@input animationPlayer: AnimationPlayer;   
  @input animationMixer: AnimationMixer;

  @ui.separator
  @input('Component.MeshVisual[]') meshesMat: Material[];
  //0 : castle modern
  //1 : castle modern tower

  //castle medieval
  @input('Component.MeshVisual') meshMatMedievalCastle: Material;

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

    // castle visibles on start
    this.setMeshesAlpha(0);
    this.meshMatMedievalCastle.mainPass.baseColor = new vec4(1, 1, 1, 0);
  }

  onUpdate(): void {
    if(this.alwaysFollowing){
      this.updateFollow();
    }
  }

  // ----------------------------------------------------------
  // Placement
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
      this.placementHeight,
      camPos.z + camForward.z * this.followDistance
    );
  }

  public updatePositionMarker(markerPos:vec3) : void{
    const camPos = this.cameraTransform.getWorldPosition();
    const direction = new vec3(
      markerPos.x - camPos.x,
      0,
      markerPos.z - camPos.z
    ).normalize();
    
    const targetPos = new vec3(
      markerPos.x + direction.x * this.distMarker,
      this.placementHeight,
      markerPos.z + direction.z * this.distMarker
    );

    this.castleParentTransform.setWorldPosition(targetPos);

    this.updateRotationMarker(targetPos);
  }

  private updateRotationMarker(castlePos): void {
    const camPos    = this.cameraTransform.getWorldPosition();

    // Direction from castle toward camera (flat)
    const dir = new vec3(
      camPos.x - castlePos.x,
      0,
      camPos.z - castlePos.z
    ).normalize();

    // Compute Y angle toward camera
    const angle = Math.atan2(dir.x, dir.z);

    this.castleParentTransform.setWorldRotation(
      quat.fromEulerAngles(0, angle, 0)
    );
  }

  // ----------------------------------------------------------
  // Fade all meshs
  // ----------------------------------------------------------

  public fadeInMeshes(): void {
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

  public fadeOutMeshes(onComplete?: () => void): void {
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

  public fadeMidMeshes(from : number, idExclude?: number): void {
    for(let i = 0; i < this.meshesMat.length; i++){
      if(i != idExclude){
          this.fadePart(i, from, this.alphaMid, this.fadeInDuration);
      }
    }
  }

  // ----------------------------------------------------------
  // Animation FBX 
  // ----------------------------------------------------------

  public playAnimation(): void {
    //if (!this.animationPlayer) {
    if (!this.animationMixer) {
      print("[CastleController] Aucun AnimationPlayer assigné !");
      return;
    }
    //this.animationPlayer.playAll();
    this.animationMixer.start("BaseLayer", 0, 1);

    //if do not follow user, place it in front just once is played 
    if(!this.alwaysFollowing){
      this.followSmooth = 1000;
      this.updateFollow();
    }
  }

  public stopAnimation(): void {
    //this.animationPlayer?.stopAll();
    this.animationMixer.stop("BaseLayer");
  }

  // ----------------------------------------------------------
  // Fade — single part
  // ----------------------------------------------------------

  public fadePart(id: number,from: number,to: number,duration: number,onComplete?: () => void): void {
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

  public fadeMedievalCastle(from: number,to: number,duration: number,onComplete?: () => void){
    // Set starting alpha immediately
    this.meshMatMedievalCastle.mainPass.baseColor = new vec4(1, 1, 1, from);

    new Animation({
      duration,
      easing: Easing.easeInOutQuad,
      onUpdate: (progress) => {
        const alpha = from + (to - from) * progress;
        this.meshMatMedievalCastle.mainPass.baseColor = new vec4(1, 1, 1, alpha);
      },
      onComplete,
    }).play();
  }

  // ----------------------------------------------------------
  // Utils
  // ----------------------------------------------------------

  private setMeshesAlpha(alpha: number): void {
    this.meshesMat.forEach((mat) => {
      if (mat) {
        mat.mainPass.baseColor = new vec4(1, 1, 1, alpha);
      }
    });
  }

  private setMeshAlpha(alpha: number, id: number): void {
    if(this.meshesMat.length <= id){return;}
    this.meshesMat[id].mainPass.baseColor = new vec4(1, 1, 1, alpha);
  }
}