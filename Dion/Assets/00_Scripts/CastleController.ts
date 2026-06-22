// ============================================================
// CastleController.ts
// ============================================================

import { Animation } from "./Animation";
import { Delay } from "./Animation";
import { Easing } from "./Easing";

@component
export class CastleController extends BaseScriptComponent {

  @input camera: Camera;
  @input castleParent: SceneObject;
  @input towerAnimated: SceneObject;
  @input towerStatic: SceneObject;
  @input flagIreland: SceneObject;
  @input flagLGBT: SceneObject;

  @ui.separator
  @ui.group_start("Placement")
  @input('float') placementHeight:   number = -20;  

  @ui.separator
  @input('boolean') alwaysFollowing: boolean = false;
  @input('float') @showIf("alwaysFollowing") followDistance: number = 150;   
  
  @input('float') smoothPositionFactor: number = 5;    

  @ui.separator

  @input('boolean') isPlacementRelativeMarker: boolean = false;
  @input('float') @showIf("isPlacementRelativeMarker") distMarker: number = 150;   
  @ui.group_end 
  

  @ui.separator
  @input('float') fadeInDuration: number = 1.5;
  @input('float') alphaMid: number = 0.2;
  @input animationPlayer: AnimationPlayer;   

  @ui.separator
  @input('vec3', '{1,1,1}') 
  @widget(new ColorWidget())
  baseColor: vec3;

  @input('Asset.Material[]') meshesMat: Material[];

  //0 : castle modern
  //1 : castle modern tower

  //castle medieval
  @input('Asset.Material') meshMatMedievalCastle: Material;

  @ui.separator

  @input('float') maxSizeFlags



  // --- Private ---

  private castleParentTransform: Transform;
  private cameraTransform: Transform;
  private targetPosition: vec3;

  private clip : AnimationClip;

  onAwake(): void {
    let eventUpdate = this.createEvent('UpdateEvent');
    eventUpdate.bind(this.onUpdate.bind(this));

    this.castleParentTransform = this.castleParent.getTransform();
    this.cameraTransform = this.camera.getTransform();

    this.targetPosition = this.getPosFrontUser();

    this.clip = this.animationPlayer.getClip("BaseLayer");

    // castles invisibles on start
    this.towerStatic.enabled = false; //towerStatic
    this.meshesMat[1].mainPass.baseColor = new vec4(1,1,1,1);
    this.meshesMat[0].mainPass.baseColor = new vec4(1,1,1,1);//modern castle
    this.meshMatMedievalCastle.mainPass.baseColor = new vec4(1, 1, 1, 0); //medieval castle
  
    //flag invisibles
    this.flagIreland.getTransform().setLocalScale(new vec3(0, 0, 0));
    this.flagLGBT.getTransform().setLocalScale(new vec3(0, 0, 0));

  
  }

  onUpdate(): void {
    if(this.alwaysFollowing){
      this.targetPosition = this.getPosFrontUser();
    }

    this.updateFollow();
  }

  // ----------------------------------------------------------
  // Placement
  // ----------------------------------------------------------

  //FOLLOWING USER 
  private updateFollow(): void {
    const current = this.castleParentTransform.getWorldPosition();
    const deltaTime = getDeltaTime();
    const lerpFactor = Math.min(this.smoothPositionFactor * deltaTime, 1);

    const smoothed = vec3.lerp(current, this.targetPosition, lerpFactor);
    this.castleParentTransform.setWorldPosition(smoothed);
  }

  private getPosFrontUser(): vec3 {
    const camPos     = this.cameraTransform.getWorldPosition();
    const camForward = this.cameraTransform.forward;

    return new vec3(
      camPos.x + camForward.x * this.followDistance,
      this.placementHeight,
      camPos.z + camForward.z * this.followDistance
    );
  }

  //PLACED IN FRONT OF THE MARKER
  public updatePositionMarker(markerTr:Transform) : void{
    //if we want between user and marker
    /*const camPos = this.cameraTransform.getWorldPosition();
    const direction = new vec3(
      markerPos.x - camPos.x,
      0,
      markerPos.z - camPos.z
    ).normalize(); */

    //If we want only in front of marker
    const direction = markerTr.forward
    direction.y = 0;
    direction.normalize();
    const markerPos = markerTr.getWorldPosition();
    
    const targetPos = new vec3(
      markerPos.x + direction.x * this.distMarker,
      this.placementHeight,
      markerPos.z + direction.z * this.distMarker
    );

    //this.castleParentTransform.setWorldPosition(targetPos);
    this.targetPosition = targetPos;

    this.updateRotationMarker(targetPos);
  }

  private updateRotationMarker(castlePos): void {
    const camPos    = this.cameraTransform.getWorldPosition();

    // Direction from castle toward camera
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
  // Animation FBX 
  // ----------------------------------------------------------

  public playAnimationShow(): void {
    if (!this.animationPlayer) {
      print("[CastleController] Aucun AnimationPlayer assigné !");
      return;
    }

    print("SHOW CASTLE");

    //fade in castle
    this.fadeModernCastle(0,1,1,() => {})

    //play anim
    this.animationPlayer.playClip("BaseLayer");
  }

  public playAnimationHide(withTower:boolean): void {
    print("HIDE CASTLE");
    if (!this.animationPlayer) {
      print("[CastleController] Aucun AnimationPlayer assigné !");
      return;
    }

    this.towerAnimated.enabled = withTower;
    this.towerStatic.enabled = !withTower;

    print("HIDE CASTLE  :" + this.towerStatic.enabled);

    const durationClip = this.clip.end - this.clip.begin;

    this.clip.playbackSpeed = -1;
    this.animationPlayer.playClipAt("BaseLayer", durationClip);

    //fade out materials according to the hide animation
    const delayFadeOut = new Delay({
        duration: durationClip - 1,
        onComplete: () => {
            this.fadePart(0, 1, 0, 1);
            if(withTower){
              this.fadePart(1, 1, 0, 1);
            }
            
        }
    });
    delayFadeOut.play();
  }

  public stopAnimation(): void {
    this.animationPlayer?.stopAll();
  }

  // ----------------------------------------------------------
  // Fade
  // ----------------------------------------------------------

  public fadePart(id: number,from: number,to: number,duration: number,onComplete?: () => void): void {
    if(this.meshesMat.length <= id){
        print("Wrong id :" + id);
        return;
    }

    const mat = this.meshesMat[id];
    if (!mat) return;

    // Set starting alpha immediately
    mat.mainPass.baseColor = new vec4(
      this.baseColor.x, 
      this.baseColor.y,
      this.baseColor.z, 
      from);

    new Animation({
      duration,
      easing: Easing.easeInOutQuad,
      onUpdate: (progress) => {
        const alpha = from + (to - from) * progress;
        mat.mainPass.baseColor = new vec4(
          this.baseColor.x, 
          this.baseColor.y,
          this.baseColor.z, 
          alpha);
      },
      onComplete,
    }).play();
  }

  public fadeModernCastle(from: number,to: number,duration: number,onComplete?: () => void){
    this.meshesMat[0].mainPass.baseColor = new vec4(
        this.baseColor.x, 
        this.baseColor.y,
        this.baseColor.z, 
        from);

    new Animation({
      duration,
      easing: Easing.easeInOutQuad,
      onUpdate: (progress) => {
        const alpha = from + (to - from) * progress;
        this.meshesMat[0].mainPass.baseColor = new vec4(
          this.baseColor.x, 
          this.baseColor.y,
          this.baseColor.z, 
          alpha);
      },
      onComplete,
    }).play();
  }

  public fadeMedievalCastle(from: number,to: number,duration: number,onComplete?: () => void){
    // Set starting alpha immediately
    this.meshMatMedievalCastle.mainPass.baseColor = new vec4(
      this.baseColor.x, 
      this.baseColor.y,
      this.baseColor.z, 
      from);

    //show static tower if medieval castle fade out
    if(from === 1){
      this.towerStatic.enabled = true;
    }

    new Animation({
      duration,
      easing: Easing.easeInOutQuad,
      onUpdate: (progress) => {
        const alpha = from + (to - from) * progress;
        this.meshMatMedievalCastle.mainPass.baseColor = new vec4(
          this.baseColor.x, 
          this.baseColor.y,
          this.baseColor.z, 
          alpha);
      },
      onComplete: () => {
        //hide static tower if medieval castle fade in
        if(to === 1){
          this.towerStatic.enabled = false;
        }
        if(onComplete){
          onComplete();
        }
      }
            
    }).play();
  }

  // ----------------------------------------------------------
  // Flags
  // ----------------------------------------------------------
  public animFlagIreland(from: number,to: number,duration: number,onComplete?: () => void){
    this.flagIreland.getTransform().setLocalScale(new vec3(from, from, from));

    new Animation({
      duration,
      easing: Easing.easeInOutQuad,
      onUpdate: (progress) => {
        const alpha = (from + (to - from) * progress) * this.maxSizeFlags;
        this.flagIreland.getTransform().setLocalScale(new vec3(alpha, alpha, alpha));
      },
      onComplete,
    }).play();
  }

  public animFlagLGBT(from: number,to: number,duration: number,onComplete?: () => void){
    this.flagLGBT.getTransform().setLocalScale(new vec3(from, from, from));

    new Animation({
      duration,
      easing: Easing.easeInOutQuad,
      onUpdate: (progress) => {
        const alpha = (from + (to - from) * progress) * this.maxSizeFlags;
        this.flagLGBT.getTransform().setLocalScale(new vec3(alpha, alpha, alpha));
      },
      onComplete,
    }).play();
  }

  // ----------------------------------------------------------
  // Utils
  // ----------------------------------------------------------

  private setMeshesAlpha(alpha: number): void {
    this.meshesMat[0].mainPass.baseColor = new vec4(
      this.baseColor.x, 
      this.baseColor.y,
      this.baseColor.z, 
      alpha);
  }
}