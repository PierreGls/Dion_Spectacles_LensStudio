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
import { InfoController } from "./InfoController";
 
@component
export class GameController extends BaseScriptComponent {

    @input debug_state: number;
    @input debug_trackingText: Text;
    @input activateSkipMarkerDebug: boolean;
    @input debug_skipMarkerButton: SceneObject;

    @ui.separator

    @input hotelController: HotelController
    @input castleController: CastleController
    @input frameController: FrameInteractionDetector
    @input compassController: CompassController
    @input markerController: MarkerController
    @input audioController: AudioController
    @input infoController: InfoController

    @ui.separator

    @input() textIntro: Text;
    @input() imgIntroMat: Material;
    @input() img1Mat: Material;
    @input() img2Mat: Material;
    @input() img3Mat: Material;


    @ui.separator

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

    @input delayImg1: number;
    @input durationFadeImg1: number;
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
    
    @input delayHotel: number;
    @input delayHotel2: number;
    @input delayHotel3: number;

    @ui.separator

    @input delayCastle1: number;
    @ui.label('<span style="color: #60A5FA;">Modern Castle Show</span>')
    @input delayCastle2: number;
    @ui.label('<span style="color: #60A5FA;">Tower Castle Show</span>')
    @input delayCastle3: number;
    @ui.label('<span style="color: #60A5FA;">Modern Castle Hide</span>')
    @input delayCastle4: number;
    @ui.label('<span style="color: #60A5FA;">Medieval Castle Show</span>')
    @input delayCastle5: number;
    @ui.label('<span style="color: #60A5FA;">Medieval Castle Hide</span>')
    @input delayCastle6: number;
    @ui.label('<span style="color: #60A5FA;">Modern Castle Show</span>')
    @input delayCastle7: number;
    @ui.label('<span style="color: #60A5FA;">Modern Castle Hide</span>')
    @input delayCastle8: number;
    @ui.label('<span style="color: #60A5FA;">Show compass</span>')


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
        //DEBUG
        if(this.debug_state > 0){
            this.onSetState(this.debug_state);
            if(this.debug_state === 3){
                this.onSetState(4);
                this.compassController.onStart();
            }
            else if(this.debug_state === 4){
                this.onShowHotel();
            }
            else if(this.debug_state === 6){
                this.onShowCastle();
            }
            else if(this.debug_state === 7){
                this.castleController.playAnimationHide();
            }

            this.debug_state = -1;
            return;
        }

        //this.debug_trakingText.text = "" + Math.ceil(getTime());
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
        print("onMarkerFound : " + id);
        this.debug_trackingText.text = "Marker Status : found";

        //id 0 = debug id 1 = intro
        if((id == 0 || id == 1) && this.state === 0){
            this.onHideImgIntro();
            //Update compass for next target : dublin castle
            const markerpos = this.markerController.nextMarkerPos;
            this.compassController.setTarget(markerpos);
        }

        //id 0 = debug id 2 = castle
        if(id == 0 || id == 2){
            //Update compass for next target : christchurch
            const markerpos = this.markerController.nextMarkerPos;
            this.compassController.setTarget(markerpos);
            //Update castle placement
            const markerTr = this.markerController.targetTr;
            this.castleController.updatePositionMarker(markerTr.getWorldPosition());
            if(this.state === 5){
                this.onShowCastle();
            }
        }
    }

    public onMarkerLost(id:number) {
        print("onMarkerLost");
        this.debug_trackingText.text = "Marker Status : lost";
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
            duration: this.durationFadeImg1,
            easing: Easing.getEasing(this.easing_firstImg),
            onUpdate: (progress) => {
                this.img1Mat.mainPass.baseColor = new vec4(1,1,1,progress);
            },
            onComplete: () => {
                delayVisibleImg1.play();
            },
        });

        const delayVisibleImg1 = new Delay({
            duration: this.delayImg1,
            onComplete: () => {
                animFadeOutImg1.play();
            }
        }); 

        const animFadeOutImg1 = new Animation({
            duration: this.durationFadeImg1,
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
                this.onShowImg3();
            },
        });

        this.onSetState(2);
        animFadeInImg2.play();
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
                this.debug_trackingText.text = "Marker Status : waiting for the sticker";
                if(this.activateSkipMarkerDebug){
                    this.debug_skipMarkerButton.enabled = true;
                }

                this.onShowHotel();
            },
        });

        this.onSetState(3);
        animFadeIn.play();
    }

    // ----------------------------------------------------------
    // Anims Hotel
    // ----------------------------------------------------------
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
                this.onSetState(5);
                this.compassController.onStart();
            },
        });

        this.onSetState(4);
        this.hotelController.playAnimation();

        delayHotel.play();
    }

    // ----------------------------------------------------------
    // Anims Castle
    // ----------------------------------------------------------

    private onShowCastle(){
        //set state
        this.onSetState(6);

        //debug
        this.debug_skipMarkerButton.enabled = false;

        //play new audio
        this.audioController.playAudio(1);
        
        //hide compass
        this.compassController.onStop();

        //Hide frame
        this.frameController.onHideFrame();

        //place castle
        const markerTr = this.markerController.targetTr;
        this.castleController.updatePositionMarker(markerTr.getWorldPosition());
        
        const delayCastle1 = new Delay({
            duration: this.delayCastle1,
            onComplete: () => {
                this.castleController.playAnimationShow();

                delayCastle2.play();
            },
        });

        //Show tower
        const delayCastle2 = new Delay({
            duration: this.delayCastle2,
            onComplete: () => {
                //hide partly castle modern
                const alphaMid = 0.6;
                this.castleController.fadePart(0, 1, alphaMid, 1);

                //show info plane
                this.infoController.fadeInPlane(0,1);

                delayCastle3.play();
            }
        });

        //Hide modern castle
        const delayCastle3 = new Delay({
            duration: this.delayCastle3,
            onComplete: () => {
                //hide info text
                this.infoController.fadeOutPlane(0,1);
                //hide castle modern
                this.castleController.playAnimationHide();

                delayCastle4.play();
            },
        });

        //Show medieval Castle
        const delayCastle4 = new Delay({
            duration: this.delayCastle4,
            onComplete: () => {
                this.castleController.fadeMedievalCastle(0,1,1);
                this.infoController.fadeInPlane(1,1);

                delayCastle5.play();
            },
        });

        //Hide medieval Castle
        const delayCastle5 = new Delay({
            duration: this.delayCastle5,
            onComplete: () => {
                this.castleController.fadeMedievalCastle(1,0,1);
                this.infoController.fadeOutPlane(1,1);

                delayCastle6.play();
            },
        });

        //Show Modern Castle
        const delayCastle6 = new Delay({
            duration: this.delayCastle6,
            onComplete: () => {
                this.castleController.playAnimationShow();

                delayCastle7.play();
            },
        });

        //hide modern castle
        const delayCastle7 = new Delay({
            duration: this.delayCastle7,
            onComplete: () => {
                this.castleController.playAnimationHide();
                delayCastle8.play();
            },
        });

        //Show compass
        const delayCastle8 = new Delay({
            duration: this.delayCastle8,
            onComplete: () => {
                this.compassController.setTextureMarker(2);
                this.compassController.onStart();
            },
        });
        

        delayCastle1.play();
    }
}
