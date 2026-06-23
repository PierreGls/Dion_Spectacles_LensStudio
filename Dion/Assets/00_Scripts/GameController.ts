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
import { NumbersController } from "./NumbersController";
 
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
    @input numbersController: NumbersController

    @ui.separator

    @input() textIntro: Text;
    @input() imgIntroMat: Material;
    @input() dublin360Mat: Material;
    @input() seeDublinMat: Material;
    @input() skylineMat: Material;
    @input() topViewMap: Material;
    @input() castleMarker: Material;
    @input() bankInfo1: Material;
    @input() bankInfo2: Material;
    @input() topViewMapFinal: Material;

    @ui.separator

    @input castleMat: Material[];

    @ui.separator

    @input durationFadeMedievalCastle: number;
    @input durationFadeImgs: number;
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
    easingImgs: number = 0;

    @ui.separator

    @input delayImg1: number;
    @ui.label('<span style="color: #60A5FA;">Show 360 dublin</span>')
    @input delayImg2: number;
    @ui.label('<span style="color: #60A5FA;">Show See dublin</span>')
    @input delayImg3: number;
    @ui.label('<span style="color: #60A5FA;">Show Skyline</span>')
    @input delayImg4: number;
    @ui.label('<span style="color: #60A5FA;">Show Top view map</span>')
    @input delayImg5: number;
    @ui.label('<span style="color: #60A5FA;">Show Look for marker</span>')
    @input delayImg5bis: number;
    @ui.label('<span style="color: #60A5FA;">Wait</span>')
    @input delayImg6: number;
    @ui.label('<span style="color: #60A5FA;">Show bank infos 1</span>')
    @input delayImg7: number;
    @ui.label('<span style="color: #60A5FA;">Show bank infos 2</span>')
    @input delayImg8: number;
    @ui.label('<span style="color: #60A5FA;">Show top view final</span>')

    @ui.separator
    
    @input delayHotel: number;

    @ui.separator

    @input delayCastle1: number;
    @ui.label('<span style="color: #60A5FA;">Modern Castle Show</span>')
    @input delayCastle2: number;
    @ui.label('<span style="color: #60A5FA;">Show img castle 1</span>')
    @input delayCastle3: number;
    @ui.label('<span style="color: #60A5FA;">Show img info 1</span>')
    @input delayCastle3bis: number;
    @ui.label('<span style="color: #60A5FA;">Hide Modern Castle Except Tower</span>')
    @input delayCastle4: number;
    @ui.label('<span style="color: #60A5FA;">Medieval Castle Show</span>')
    @input delayCastle5: number;
    @ui.label('<span style="color: #60A5FA;">Show img castle 2</span>')
    @input delayCastle6: number;
    @ui.label('<span style="color: #60A5FA;">Medieval Castle Hide</span>')
    @input delayCastle7: number;
    @ui.label('<span style="color: #60A5FA;">Modern Castle Show</span>')
    @input delayCastle8: number;
    @ui.label('<span style="color: #60A5FA;">Show img castle 3</span>')
    @input delayCastle9: number;
    @ui.label('<span style="color: #60A5FA;">Show img castle 4</span>')
    @input delayCastle10: number;
    @ui.label('<span style="color: #60A5FA;">Show Flags</span>')
    @input delayCastle11: number;
    @ui.label('<span style="color: #60A5FA;">Show img castle 5</span>')
    @input delayCastle12: number;
    @ui.label('<span style="color: #60A5FA;">Hide all</span>')
    @input delayCastle13: number;
    @ui.label('<span style="color: #60A5FA;">Show compass</span>')
    
    @input delayCastleImg1: number;
    @input delayCastleImg2: number;
    @input delayCastleImg3: number;
    @input delayCastleImg4: number;
    @input delayCastleImg5: number;


    private state : number = 0;
    
    // ----------------------------------------------------------
    // Init
    // ----------------------------------------------------------
    onAwake() {
        let eventUpdate = this.createEvent('UpdateEvent');
        eventUpdate.bind(this.onUpdate.bind(this));

        //Init 
        this.dublin360Mat.mainPass.baseColor = new vec4(1,1,1,0);
        this.seeDublinMat.mainPass.baseColor = new vec4(1,1,1,0);
        this.skylineMat.mainPass.ratio = -0.1;
        this.topViewMap.mainPass.baseColor = new vec4(1,1,1,0);
        this.castleMarker.mainPass.baseColor = new vec4(1,1,1,0);
        this.bankInfo1.mainPass.baseColor = new vec4(1,1,1,0);
        this.bankInfo2.mainPass.baseColor = new vec4(1,1,1,0);
        this.topViewMapFinal.mainPass.baseColor = new vec4(1,1,1,0);

        this.castleMat.forEach((mat) => {
            mat.mainPass.baseColor = new vec4(1,1,1,0);
        });

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
            else if(this.debug_state === 5){
                this.onShowImg5();
            }
            else if(this.debug_state === 7){
                this.onShowImg8();
            }
            else if(this.debug_state === 8){
                this.onShowCastle();
            }
            else if(this.debug_state === 9){
                this.castleController.playAnimationHide(true);
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
            this.castleController.updatePositionMarker(markerTr);
            if(this.state === 9){
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
    // Anims Utils 
    // ----------------------------------------------------------

    private onFadeInImg(mat:Material, onComplete?: () => void){
        this.onFadeImg(mat, 0, 1, onComplete);
    }

    private onFadeOutImg(mat:Material, onComplete?: () => void){
        this.onFadeImg(mat, 1, 0, onComplete);
    }

    private onFadeImg(mat:Material, from:number, to:number, onComplete?: () => void){
        mat.mainPass.baseColor = new vec4(1,1,1,from);
        const animFade = new Animation({
            duration: this.durationFadeImgs,
            easing: Easing.getEasing(this.easingImgs),
            onUpdate: (progress) => {
                const alpha = from + (to - from) * progress;
                mat.mainPass.baseColor = new vec4(1,1,1,alpha);
            },
            onComplete
        });
        animFade.play();
    }

    /*Factorisation of 3 steps:
        -fade in
        -delay
        -fade out
    */
    private onFadeInOutWithDelay(mat:Material, delayBetween:number, onComplete?: () => void){
        this.onFadeInImg(
            mat, 
            () => {
                delay.play();
            }
        );

        const delay = new Delay({
            duration: delayBetween,
            onComplete: () => {
                this.onFadeOutImg(mat, onComplete);
            }
        }); 
    }

    // ----------------------------------------------------------
    // Anims Text 
    // ----------------------------------------------------------
    private onFadeInText(onComplete?: () => void){
        this.onFadeText(0, 1, onComplete);
    }

    private onFadeOutText(onComplete?: () => void){
        this.onFadeText(1, 0, onComplete);
    }

    private onFadeText(from:number, to:number, onComplete?: () => void){
        this.setAlphaText(from);
        const animFade = new Animation({
            duration: this.durationFadeImgs,
            easing: Easing.getEasing(this.easingImgs),
            onUpdate: (progress) => {
                const alpha = from + (to - from) * progress;
                this.setAlphaText(alpha);
            },
            onComplete
        });
        animFade.play();
    }

    private setAlphaText(newAlpha:number){
        this.textIntro.textFill.color = new vec4(1,1,1,newAlpha);
        this.textIntro.outlineSettings.fill.color = new vec4(0,0,0,newAlpha);
    }

    /*Factorisation of 3 steps:
        -fade in
        -delay
        -fade out
    */
    private onFadeInOutTextWithDelay(delayBetween:number, onComplete?: () => void){
        this.onFadeInText(
            () => {
                delay.play();
            }
        );

        const delay = new Delay({
            duration: delayBetween,
            onComplete: () => {
                this.onFadeOutText(onComplete);
            }
        }); 
    }

    // ----------------------------------------------------------
    // Anims
    // ----------------------------------------------------------
    private onHideImgIntro(){
        this.debug_skipMarkerButton.enabled = false;

        this.onFadeOutText();
        this.onFadeOutImg(
            this.imgIntroMat, 
            () => {
                this.onShowImg1();
            }
        );
    }

    private onShowImg1(){
        //State
        this.onSetState(1);

        //audio
        this.audioController.playAudio(0);

        this.onFadeInOutWithDelay(
            this.dublin360Mat, 
            this.delayImg1,
            () => {
                this.onShowImg2();
            }
        );
    }

    private onShowImg2(){
        this.onSetState(2);

        this.onFadeInOutWithDelay(
            this.seeDublinMat, 
            this.delayImg2,
            () => {
                this.onShowImg3();
            }
        );
    }

    private onShowImg3(){
        this.onSetState(3);

        //to avoid line pixel faded
        const minRatio = -0.1;
        const maxRatio = 1;

        const fadeInSkyline = new Animation({
            duration: this.durationFadeImgs,
            easing: Easing.getEasing(this.easingImgs),
            onUpdate: (progress) => {
                const newRatio = (maxRatio - minRatio) * progress + minRatio;
                this.skylineMat.mainPass.ratio = newRatio;
            },
            onComplete: () => {
                delaySkyline.play();
            },
        });

        const delaySkyline = new Delay({
            duration: this.delayImg3,
            onComplete: () => {
                fadeOutSkyline.play();
            },
        });

        const fadeOutSkyline = new Animation({
            duration: this.durationFadeImgs,
            easing: Easing.getEasing(this.easingImgs),
            onUpdate: (progress) => {
                const newRatio = (maxRatio - minRatio) * (1 - progress) + minRatio;
                this.skylineMat.mainPass.ratio = newRatio;
            },
            onComplete: () => {
                this.onShowImg4();
            },
        });

        fadeInSkyline.play();
    }

    private onShowImg4(){
        this.onSetState(4);

        this.onFadeInOutWithDelay(
            this.topViewMap, 
            this.delayImg4,
            () => {
                this.onShowImg5();
            }
        );
    }

    private onShowImg5(){
        this.onSetState(5);

        this.onFadeInOutTextWithDelay(this.delayImg5);
        this.onFadeInOutWithDelay(
            this.castleMarker, 
            this.delayImg5,
            () => {
                delayBeforeShowHotel.play();
            }
        );

        const delayBeforeShowHotel = new Delay({
            duration: this.delayImg5bis,
            onComplete: () => {
                this.onSetState(6);
                this.onShowImg6();

                //In parallele, play hotel anim
                this.onPlayHotelAnimation();
            },
        });
    }

    private onShowImg6(){
        this.onSetState(7);

        this.onFadeInOutWithDelay(
            this.bankInfo1, 
            this.delayImg6,
            () => {
                this.onShowImg7();
            }
        );
    }

    private onShowImg7(){
        this.onSetState(8);

        this.onFadeInOutWithDelay(
            this.bankInfo2, 
            this.delayImg7,
            () => {
                this.onShowImg8();
            }
        );
    }

    private onShowImg8(){
        this.onSetState(9);

        //show numbers in hotel
        this.numbersController.showNumbers();

        //show img end 
        this.onFadeInOutWithDelay(
            this.topViewMapFinal, 
            this.delayImg8,
            () => {
                print("Waiting for sticker : castle")
                this.debug_trackingText.text = "Marker Status : waiting for the sticker";
                if(this.activateSkipMarkerDebug){
                    this.debug_skipMarkerButton.enabled = true;
                }

                //Show compass
                this.compassController.onStart();

                //hide castle
                this.hotelController.playAnimationHide();

                //hide numbers
                this.numbersController.hideNumbers();
            }
        );
    }

    // ----------------------------------------------------------
    // Anims Hotel
    // ----------------------------------------------------------
    // fade in ==> fade out ==> fade in
    private onPlayHotelAnimation(onComplete?: () => void){
        const delayHotel = new Delay({
            duration: this.delayHotel,
            onComplete: () => {
                this.hotelController.playAnimationShow(
                    () => {
                        delayHotel2.play();
                    }
                );
            },
        });

        const delayHotel2 = new Delay({
            duration: this.delayHotel,
            onComplete: () => {
                this.hotelController.playAnimationHide(
                    () => {
                        delayHotel3.play();
                    }
                );
            },
        });

        const delayHotel3 = new Delay({
            duration: this.delayHotel,
            onComplete: () => {
                this.hotelController.playAnimationShow(onComplete);
            },
        });

        delayHotel.play();
    }



    // ----------------------------------------------------------
    // Anims Castle
    // ----------------------------------------------------------

    private onShowCastle(){
        //set state
        this.onSetState(10);

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
        this.castleController.updatePositionMarker(markerTr);
        
        const delayCastle1 = new Delay({
            duration: this.delayCastle1,
            onComplete: () => {
                //Set State
                this.onSetState(11);
                //Play show animation modern castle
                this.castleController.playAnimationShow();
                //Delay for the following steps 
                delayCastle2.play();
            },
        });
        delayCastle1.play();

        //Show img 1
        const delayCastle2 = new Delay({
            duration: this.delayCastle2,
            onComplete: () => {
                this.onShowImgCastle(0,this.delayCastleImg1);
                delayCastle3.play();
            }
        });

        //Show tower
        const delayCastle3 = new Delay({
            duration: this.delayCastle3,
            onComplete: () => {
                this.onSetState(12);
                //hide modern castle expect tower 
                this.castleController.playAnimationHide(false);
                delayCastle3bis.play();
            }
        });

        //show info plane 1
        const delayCastle3bis = new Delay({
            duration: this.delayCastle3bis,
            onComplete: () => {
                this.infoController.fadeInPlane(0,1);
                delayCastle4.play();
            },
        });

        //Show medieval Castle
        const delayCastle4 = new Delay({
            duration: this.delayCastle4,
            onComplete: () => {
                this.onSetState(13);
                //medieval castle
                this.castleController.fadeMedievalCastle(0,1,this.durationFadeMedievalCastle);
                //hide info plane 1
                this.infoController.fadeOutPlane(0,1);
                //show indo plane 2
                this.infoController.fadeInPlane(1,1);
                delayCastle5.play();
            },
        });

        //Show img 2
        const delayCastle5 = new Delay({
            duration: this.delayCastle5,
            onComplete: () => {
                this.onShowImgCastle(1, this.delayCastleImg2);
                delayCastle6.play();
            }
        });

        //Hide medieval Castle
        const delayCastle6 = new Delay({
            duration: this.delayCastle6,
            onComplete: () => {
                this.onSetState(14);
                this.castleController.fadeMedievalCastle(1,0,this.durationFadeMedievalCastle);
                //hide info plane 2
                this.infoController.fadeOutPlane(1,1);
                delayCastle7.play();
            },
        });

        //Show Modern Castle
        const delayCastle7 = new Delay({
            duration: this.delayCastle7,
            onComplete: () => {
                this.onSetState(15);
                this.castleController.playAnimationShow();
                delayCastle8.play();
            },
        });

        //Show img 3
        const delayCastle8 = new Delay({
            duration: this.delayCastle8,
            onComplete: () => {
                this.onShowImgCastle(2, this.delayCastleImg3);
                delayCastle9.play();
            }
        });

        //Show img 4
        const delayCastle9 = new Delay({
            duration: this.delayCastle9,
            onComplete: () => {
                this.onShowImgCastle(3, this.delayCastleImg4);
                delayCastle10.play();
            }
        });

        //Show flags
        const delayCastle10 = new Delay({
            duration: this.delayCastle10,
            onComplete: () => {
                this.castleController.animFlagIreland(0,1,2);
                delayCastle11.play();
            }
        });

        //Show img 5
        const delayCastle11 = new Delay({
            duration: this.delayCastle11,
            onComplete: () => {
                this.castleController.animFlagLGBT(0,1,2);
                this.onShowImgCastle(4, this.delayCastleImg5);
                delayCastle12.play();
            }
        });


        //Hide Modern Castle
        const delayCastle12 = new Delay({
            duration: this.delayCastle12,
            onComplete: () => {
                this.onSetState(16);
                this.castleController.playAnimationHide(true);
                this.castleController.animFlagIreland(1,0,2);
                this.castleController.animFlagLGBT(1,0,2);
                delayCastle13.play();
            },
        });

        //Show compass
        const delayCastle13 = new Delay({
            duration: this.delayCastle13,
            onComplete: () => {
                this.onSetState(17);
                this.compassController.setTextureMarker(2);
                this.compassController.onStart();
            },
        });
    }

    private onShowImgCastle(id, delayImgShown){
        if(id < 0 || id >= this.castleMat.length){
            print("Wrong id : " + id);
            return;
        }

        this.onFadeInOutWithDelay(
            this.castleMat[id], 
            delayImgShown,
            () => {}
        );
    }
}
