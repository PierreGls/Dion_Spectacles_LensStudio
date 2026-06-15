// ============================================================
// GameController.ts - Manage the steps of the experience 
// ============================================================

import { Animation } from "./Animation";
import { Delay } from "./Animation";
import { Easing } from "./Easing";    
import { HotelController } from "./HotelController";
import { CastleController } from "./CastleController";
import { FrameInteractionDetector } from "./FrameInteractionDetector";
    
let state : number = 0;
 
@component
export class GameController extends BaseScriptComponent {

    @input 
    debug_state: number;

    @ui.separator

    @input 
    hotelController: HotelController

    @input 
    castleController: CastleController

    @input 
    frameController: FrameInteractionDetector

    @input() img1Mat: Material;
    @input() img2Mat: Material;
    @input() img3Mat: Material;

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
    
    @input delayHotel: number;
    @input delayHotel2: number;
    @input delayHotel3: number;

    @ui.separator

    @input delayImg3: number;
    @input durationFadeIn_img3: number;
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
    easing_img3: number = 0;

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
        this.img3Mat.mainPass.baseColor = new vec4(1,1,1,0);
    }

  // ----------------------------------------------------------
  // Update
  // ----------------------------------------------------------

    onUpdate(eventData: UpdateEvent) {
        //TO DELETE
        if(this.debug_state > 0){
            this.onSetState(this.debug_state);
            if(this.debug_state === 3){
                this.onShowHotel();
            }

            this.debug_state = -1;
            return;
        }


        if(state == 0 && getTime() > this.delayFirstImg){
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
    // State
    // ----------------------------------------------------------
    onSetState(newState : number){
        state = newState;
        print("New State : " + state);
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
                delayVisibleImg1.play();
            },
        });

        const delayVisibleImg1 = new Delay({
            duration: this.delayFirstImg,
            onComplete: () => {
                animFadeOutImg1.play();
            }
        }); 

        const animFadeOutImg1 = new Animation({
            duration: this.durationFadeIn_firstImg,
            easing: Easing.getEasing(this.easing_firstImg),
            onUpdate: (progress) => {
                this.img1Mat.mainPass.baseColor = new vec4(1,1,1,1 - progress);
            },
            onComplete: () => {
                this.onShowImg2();
            },
        });

        this.onSetState(1);
        animFadeIn.play();
    }

    onShowImg2(){
        const animFadeInImg2 = new Animation({
            duration: this.durationFadeIn_img2,
            easing: Easing.getEasing(this.easing_img2),
            onUpdate: (progress) => {
                this.img2Mat.mainPass.baseColor = new vec4(1,1,1, progress);
            },
            onComplete: () => {
                delayImg2.play();
            },
        });

        const delayImg2 = new Delay({
            duration: this.delayImg2,
            onComplete: () => {
                animFadeOutImg2.play();
            }
        }); 

        const animFadeOutImg2 = new Animation({
            duration: this.durationFadeIn_img2,
            easing: Easing.getEasing(this.easing_img2),
            onUpdate: (progress) => {
                this.img2Mat.mainPass.baseColor = new vec4(1,1,1, 1 - progress);
            },
            onComplete: () => {
                this.onShowHotel();
            },
        });

        this.onSetState(2);
        animFadeInImg2.play();
    }

    onShowHotel(){
        const delayHotel = new Delay({
            duration: this.delayHotel,
            onComplete: () => {
                this.hotelController.playAnimationSecondPart();
                delayHotel2.play();
            }
        }); 

        const delayHotel2 = new Delay({
            duration: this.delayHotel2,
            onComplete: () => {
                this.hotelController.playAnimationThirdPart();
                delayHotel3.play();
            },
        });

        const delayHotel3 = new Delay({
            duration: this.delayHotel3,
            onComplete: () => {
                this.onShowImg3();
            },
        });

        this.onSetState(3);
        this.hotelController.playAnimation();

        delayHotel.play();
    }


    onShowImg3(){
        const animFadeIn = new Animation({
            duration: this.durationFadeIn_img3,
            easing: Easing.getEasing(this.easing_img3),
            onUpdate: (progress) => {
                this.img3Mat.mainPass.baseColor = new vec4(1,1,1,progress);
            },
            onComplete: () => {
                delayVisible.play();
            },
        });

        const delayVisible = new Delay({
            duration: this.delayImg3,
            onComplete: () => {
                animFadeOut.play();
            }
        }); 

        const animFadeOut = new Animation({
            duration: this.durationFadeIn_img3,
            easing: Easing.getEasing(this.easing_img3),
            onUpdate: (progress) => {
                this.img3Mat.mainPass.baseColor = new vec4(1,1,1,1 - progress);
            },
            onComplete: () => {
                print("Waiting for sticker")
            },
        });

        this.onSetState(4);
        animFadeIn.play();
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
