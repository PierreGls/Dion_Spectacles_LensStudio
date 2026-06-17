// ============================================================
// GameController.ts - Manage the steps of the experience 
// ============================================================

import { Animation } from "./Animation";
import { Delay } from "./Animation";
import { Easing } from "./Easing";    
import { HotelController } from "./HotelController";
import { CastleController } from "./CastleController";
import { FrameInteractionDetector } from "./FrameInteractionDetector";
import { AudioController } from "./AudioController";
import { CompassController } from "./CompassController";
 
@component
export class GameController extends BaseScriptComponent {

    @input debug_state: number;
    @input debug_trakingText: Text;
    @input activateSkipMarkerDebug: boolean;
    @input debug_skipMarkerButton: SceneObject;

    @ui.separator

    @input hotelController: HotelController
    @input castleController: CastleController
    @input frameController: FrameInteractionDetector
    @input compassController: CompassController

    @input() img1Mat: Material;
    @input() img2Mat: Material;
    @input() img3Mat: Material;

    @ui.separator

    @input castleReference: SceneObject;

    @ui.separator

    @input delayFirstImg: number;
    @input durationFadeIn_firstImg: number;
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

    @input delayImg2: number;
    @input durationFadeIn_img2: number;
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

    @input delayCastle1: number;
    @input delayCastle2: number;

    private state : number = 0;
    
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

        this.debug_skipMarkerButton.enabled = false;
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
            if(this.debug_state === 5){
                this.onShowCastle();
            }

            this.debug_state = -1;
            return;
        }


        if(this.state == 0 && getTime() > 1.0){
            this.onShowImg1();
        }
    }

    // ----------------------------------------------------------
    // Clicks
    // ----------------------------------------------------------

    public onClickOnFrame(){
        print("OnClickOnFrame");
    }

    // ----------------------------------------------------------
    // Marker
    // ----------------------------------------------------------

    public onMarkerFound() {
        this.debug_trakingText.text = "Marker Status : found";

        print("onMarkerFound");
        if(this.state === 5){
            this.onShowCastle()
        }
    }

    public onMarkerLost() {
        print("onMarkerLost");
        this.debug_trakingText.text = "Marker Status : lost";

    }

    // ----------------------------------------------------------
    // State
    // ----------------------------------------------------------
    private onSetState(newState : number){
        this.state = newState;
        print("New State : " + this.state);
    }

    // ----------------------------------------------------------
    // Anims
    // ----------------------------------------------------------

    private onShowImg1(){
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

        //this.audioController.playAudio(0);
        this.onSetState(1);
        animFadeIn.play();
    }

    private onShowImg2(){
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

    private onShowHotel(){
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


    private onShowImg3(){
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
                this.debug_trakingText.text = "Marker Status : waiting for the sticker";
                if(this.activateSkipMarkerDebug){
                    this.debug_skipMarkerButton.enabled = true;
                }

                this.onSetState(5);
                this.compassController.onStart(this.castleReference.getTransform());
            },
        });

        this.onSetState(4);
        animFadeIn.play();
    }


    private onShowCastle(){
        const delayCastle = new Delay({
            duration: this.delayCastle2,
            onComplete: () => {
                this.frameController.onHideFrame();
                this.onShowPartCastle();
            }
        });

        //this.audioController.playAudio(1);
        this.onSetState(6);
        this.compassController.onStop();
        //this.castleController.playAnimation();
        this.castleController.fadeInMeshes();
        delayCastle.play();

        this.debug_skipMarkerButton.enabled = false;
    }

    private onShowPartCastle(){
        const alphaMid = 0.6;
        const delayCastle = new Delay({
            duration: this.delayCastle1,
            onComplete: () => {
                this.castleController.fadeMidMeshes(1, 1);
                delayCastle2.play()
            },
        });

        const delayCastle2 = new Delay({
            duration: this.delayCastle2,
            onComplete: () => {
                this.castleController.fadePart(1, 1, 0, 1);
                this.castleController.fadePart(0, alphaMid, 0, 1);
                this.castleController.fadeMedievalCastle(0,1,1);
            },
        });

        delayCastle.play();
    }
}
