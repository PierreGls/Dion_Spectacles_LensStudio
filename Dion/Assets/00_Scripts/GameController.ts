// ============================================================
// GameController.ts - Manage the steps of the experience 
// ============================================================

import { Animation } from "./Animation";
import { Easing } from "./Easing";    
import { CastleController } from "./CastleController";
import { FrameInteractionDetector } from "./FrameInteractionDetector";
    
let state : number = 0;
 
@component
export class GameController extends BaseScriptComponent {
    @input 
    castleController: CastleController

    @input 
    frameController: FrameInteractionDetector

    @input()
    img1Mat: Material;

    @input()
    img2Mat: Material;

    @ui.separator

    @input 
    delayFirstImg: number;
    @input 
    durationFadeIn_firstImg: number;
    @input('int')
    @widget(
        new ComboBoxWidget([
            new ComboBoxItem('linear', 0), 
            new ComboBoxItem('easeInQuad', 1), 
            new ComboBoxItem('easeOutQuad', 2), 
            new ComboBoxItem('easeInOutQuad', 3), 
            new ComboBoxItem('easeInCubic', 4), 
            new ComboBoxItem('easeOutCubic', 5), 
            new ComboBoxItem('easeInOutCubic', 6)])
    )
    easing_firstImg: number = 0;

    @ui.separator

    @input 
    delayImg2: number;
    @input 
    durationFadeIn_img2: number;
    @input('int')
    @widget(
        new ComboBoxWidget([
            new ComboBoxItem('linear', 0), 
            new ComboBoxItem('easeInQuad', 1), 
            new ComboBoxItem('easeOutQuad', 2), 
            new ComboBoxItem('easeInOutQuad', 3), 
            new ComboBoxItem('easeInCubic', 4), 
            new ComboBoxItem('easeOutCubic', 5), 
            new ComboBoxItem('easeInOutCubic', 6)])
    )
    easing_img2: number = 0;
    

    @ui.separator
    @input 
    delayInitialCastle: number;
    @input 
    delayCastle: number;
    @input
    animPlayerCastle: AnimationPlayer;
    
  // ----------------------------------------------------------
  // Init
  // ----------------------------------------------------------
    onAwake() {
        let eventUpdate = this.createEvent('UpdateEvent');
        eventUpdate.bind(this.onUpdate.bind(this));

        //Init 
        this.img1Mat.mainPass.baseColor = new vec4(1,1,1,0);
        this.img2Mat.mainPass.baseColor = new vec4(1,1,1,0);
    }

  // ----------------------------------------------------------
  // Update
  // ----------------------------------------------------------

    onUpdate(eventData: UpdateEvent) {
        if(state == 0 && getTime() > this.delayFirstImg){
            state = 1;
            this.onShowImg1();
        }
    }

  // ----------------------------------------------------------
  // Clicks
  // ----------------------------------------------------------

    onClickOnFrame(){
        print("OnClickOnFrame");
    }

  // ----------------------------------------------------------
  // Anims
  // ----------------------------------------------------------

    onShowImg1(){
        const animFadeIn = new Animation({
            duration: this.durationFadeIn_firstImg,
            easing: Easing.getEasing(this.easing_firstImg),
            onUpdate: (progress) => {
                this.img1Mat.mainPass.baseColor = new vec4(1,1,1,progress);
            },
            onComplete: () => {
                this.onShowImg2();
            },
        });

        animFadeIn.play();
    }

    onShowImg2(){
        const delayVisibleImg1 = new Animation({
            duration: this.delayFirstImg,
            easing: Easing.linear,
            onUpdate: (progress) => {
                //delay
            },
            onComplete: () => {
                animFadeOutImg1.play();
            },
        });

        const animFadeOutImg1 = new Animation({
            duration: this.durationFadeIn_firstImg,
            easing: Easing.getEasing(this.easing_firstImg),
            onUpdate: (progress) => {
                this.img1Mat.mainPass.baseColor = new vec4(1,1,1,1 - progress);
            },
            onComplete: () => {
                animFadeInImg2.play();
            },
        });

        const animFadeInImg2 = new Animation({
            duration: this.durationFadeIn_img2,
            easing: Easing.getEasing(this.easing_img2),
            onUpdate: (progress) => {
                this.img2Mat.mainPass.baseColor = new vec4(1,1,1, progress);
            },
            onComplete: () => {
                this.onShowCastle();
            },
        });

        delayVisibleImg1.play();
    }

    onShowCastle(){
        const delayCastle = new Animation({
            duration: this.delayCastle,
            easing: Easing.linear,
            onUpdate: (progress) => {
                //delay
            },
            onComplete: () => {
                animFadeOutImg2.play();
            },
        });

        const animFadeOutImg2 = new Animation({
            duration: this.durationFadeIn_img2,
            easing: Easing.getEasing(this.easing_img2),
            onUpdate: (progress) => {
                this.img2Mat.mainPass.baseColor = new vec4(1,1,1, 1 - progress);
            },
            onComplete: () => {
                this.frameController.onHideFrame();
                this.castleController.playAnimation();
                this.onShowPartCastle();
            },
        });

        delayCastle.play();
    }

    onShowPartCastle(){
        const delayCastle = new Animation({
            duration: this.delayInitialCastle,
            easing: Easing.linear,
            onUpdate: (progress) => {
                //delay
            },
            onComplete: () => {
                this.castleController.fadeMidMeshes(1, 0);
                delayCastle2.play()
            },
        });

        const delayCastle2 = new Animation({
            duration: this.delayCastle,
            easing: Easing.linear,
            onUpdate: (progress) => {
                //delay
            },
            onComplete: () => {
                this.castleController.fadePart(0, 1, 0.3, 1);
                this.castleController.fadePart(1, 0.3, 1, 1);
                delayCastle3.play()
            },
        });
        const delayCastle3 = new Animation({
            duration: this.delayCastle,
            easing: Easing.linear,
            onUpdate: (progress) => {
                //delay
            },
            onComplete: () => {
                this.castleController.fadePart(1, 1, 0.3, 1);
                this.castleController.fadePart(2, 0.3, 1, 1);
            },
        });

        delayCastle.play();
    }
}
