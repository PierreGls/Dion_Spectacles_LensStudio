// ============================================================
// CastleController.ts
// ============================================================

import { Animation } from "./Animation";
import { Delay } from "./Animation";
import { Easing } from "./Easing";

@component
export class CastleController extends BaseScriptComponent {

  @input castleParent: SceneObject;
  @input towerAnimated: SceneObject;
  @input towerStatic: SceneObject;
  @input flagIreland: SceneObject;
  @input flagLGBT: SceneObject;
  

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

  private clip : AnimationClip;

  onAwake(): void {
    //let eventUpdate = this.createEvent('UpdateEvent');
    //eventUpdate.bind(this.onUpdate.bind(this));

    this.clip = this.animationPlayer.getClip("BaseLayer");

    // castles invisibles on start
    this.towerStatic.enabled = false; //towerStatic
    this.meshesMat[1].mainPass.baseColor = new vec4(1,1,1,1);
    this.meshesMat[0].mainPass.baseColor = new vec4(1,1,1,0);//modern castle
    this.meshMatMedievalCastle.mainPass.baseColor = new vec4(1, 1, 1, 0); //medieval castle
  
    //flag invisibles
    this.flagIreland.getTransform().setLocalScale(new vec3(0, 0, 0));
    this.flagLGBT.getTransform().setLocalScale(new vec3(0, 0, 0));
  }

  onUpdate(): void {
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
}