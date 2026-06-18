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
import { MarkerController } from "./MarkerController";
 
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
    @input markerController: MarkerController
    @input audioController: AudioController

    @input() textIntro: Text;
    @input() imgIntroMat: Material;
    @input() img1Mat: Material;
    @input() img2Mat: Material;
    @input() img3Mat: Material;

    @ui.separator

    @input castleReference: SceneObject;

    @ui.separator

    @input delayIntro: number;
    @input durationFadeIntro: number;
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
    easing_intro: number = 0;

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

        //Debug
        this.debug_skipMarkerButton.enabled = this.activateSkipMarkerDebug;
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
            else if(this.debug_state === 4){
                this.onSetState(5);
                this.compassController.onStart();
            }
            else if(this.debug_state === 5){
                this.onShowCastle();
            }

            this.debug_state = -1;
            return;
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

    public onMarkerFound(id:number) {
        print("onMarkerFound");
        this.debug_trakingText.text = "Marker Status : found";

        if((id == 0 || id == 1) && this.state === 0){
            this.onHideImgIntro();
            const markerpos = this.markerController.nextMarkerPos;
            this.compassController.setTarget(markerpos);
        }

        //castle
        if(id == 0 || id == 2){
            const markerTr = this.markerController.targetTr;
            this.castleController.updatePositionMarker(markerTr.getWorldPosition());
        }
        
        //id 0 = debug id 1 = good castle
        if((id == 0 || id == 2) && this.state === 5){
            this.onShowCastle();
        }
    }

    public onMarkerLost(id:number) {
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
    private onHideImgIntro(){
        const animFade = new Animation({
            duration: this.durationFadeIntro,
            easing: Easing.getEasing(this.easing_intro),
            onUpdate: (progress) => {
                this.imgIntroMat.mainPass.baseColor = new vec4(1,1,1,1 - progress);
                this.textIntro.textFill.color = new vec4(1,1,1,1 - progress);
                this.textIntro.outlineSettings.fill.color = new vec4(0,0,0,1 - progress);
            },
            onComplete: () => {
                this.onShowImg1();
            },
        });

        this.debug_skipMarkerButton.enabled = false;
        animFade.play();
    }

    private onShowImg1(){
        //State
        this.onSetState(1);

        //audio
        this.audioController.playAudio(0);
        

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
                this.compassController.onStart();
            },
        });

        this.onSetState(4);
        animFadeIn.play();
    }

    private onShowCastle(){
        //set state
        this.onSetState(6);

        //debug
        this.debug_skipMarkerButton.enabled = false;

        //play new audio
        this.audioController.playAudio(1);
        
        //hide compass
        this.compassController.onStop();

        //place castle
        const markerTr = this.markerController.targetTr;
        this.castleController.updatePositionMarker(markerTr.getWorldPosition());

        //fade in
        this.castleController.fadeInMeshes();

        //animation
        const delayCastle = new Delay({
            duration: this.delayCastle2,
            onComplete: () => {
                this.frameController.onHideFrame();
                this.onShowPartCastle();
            }
        });
        delayCastle.play();
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
