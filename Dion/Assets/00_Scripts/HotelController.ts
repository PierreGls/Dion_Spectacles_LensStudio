// ============================================================
// CastleController.ts
// ============================================================

import { Animation } from "./Animation";
import { Delay } from "./Animation";
import { Easing } from "./Easing";

@component
export class HotelController extends BaseScriptComponent {
  
  @input hotelParent: SceneObject;
  @input hotelStatic: SceneObject;
  @input animationPlayer: AnimationPlayer;   

  @ui.separator
  @input('float') fadeInDuration: number = 1.5;
  @input('float') fadeOutDuration: number = 1.0; 
  @input('float') alphaMax: number = 0.95;

  @ui.separator
  @input('Asset.Material[]') meshesMat: Material[];

  // --- Private ---

  private clip : AnimationClip;

  onAwake(): void {
    this.clip = this.animationPlayer.getClip("BaseLayer");

    // hotel not visible on start
    this.setMeshesAlpha(0); 
    this.hotelStatic.enabled = false;
  }

  onUpdate(): void {
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
          mat.mainPass.baseColor = new vec4(1, 1, 1, progress * this.alphaMax);
        },
        onComplete: () => {
        },
      }).play();
    });
  }

  fadeOutMeshes(): void {
    this.meshesMat.forEach((mat) => {
      if (!mat) return;

      new Animation({
        duration: this.fadeInDuration,
        easing: Easing.easeInOutQuad,
        onUpdate: (progress) => {
          mat.mainPass.baseColor = new vec4(1, 1, 1, (1 - progress) * this.alphaMax);
        },
        onComplete: () => {
        },
      }).play();
    });
  }

  // ----------------------------------------------------------
  // Animation FBX 
  // ----------------------------------------------------------

  playAnimationShow(onComplete?: () => void): void {
    //Fade In Everything
    this.fadeInMeshes();

    //Play animation Show
    print('Show hotel')
    this.playShowFBX(onComplete);
  }

  playAnimationHide(onComplete?: () => void): void {
    //this.fadeOutMeshes();

    //Play animation Hide
    print('Hide hotel')
    this.playHideFBX(onComplete);
  }

  private playShowFBX(onComplete?: () => void){
    const durationClip = this.clip.end - 0.1;
    this.clip.playbackSpeed = -1;
    this.animationPlayer.playClipAt("BaseLayer", durationClip);


    const delayOnComplete = new Delay({
        duration: durationClip,
        onComplete: () => {
            this.hotelStatic.enabled = true;
            onComplete?.();
        }
    }); 
    delayOnComplete.play();
  }

  private playHideFBX(onComplete?: () => void){
    this.hotelStatic.enabled = false;
    this.clip.playbackSpeed = 1;
    this.animationPlayer.playClipAt("BaseLayer", 0);

    const durationClip = this.clip.end - 0.1;
    const delayOnComplete = new Delay({
        duration: durationClip,
        onComplete: () => {
          if(onComplete){
            onComplete();
          }
        }
    }); 
    delayOnComplete.play();
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