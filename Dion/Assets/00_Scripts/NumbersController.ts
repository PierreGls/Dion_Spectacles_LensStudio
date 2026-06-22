import { Animation } from "./Animation";
import { Delay } from "./Animation";
import { Easing } from "./Easing";

@component
export class NumbersController extends BaseScriptComponent {

    @ui.group_start("Obj")
    @input camera: Camera;
    @input numbersParent: SceneObject;
    @ui.group_end 

    @ui.separator

    @ui.group_start("Placement")
    @input('float') followSmooth: number = 5;    
    @ui.group_end 

    @ui.group_start("Animation")
    @input('float') fadeDuration: number = 0.5;
    @input('float') delayBetween: number = 0.2;
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
    easingFade: number = 0;
    @ui.group_end 



    private cameraTransform: Transform;
    private numbersTr: Transform[] = [];
    private childMaterials: Material[] = [];

    // ----------------------------------------------------------
    // Init
    // ----------------------------------------------------------

    onAwake() {
        let eventUpdate = this.createEvent('UpdateEvent');
        eventUpdate.bind(this.onUpdate.bind(this));

        this.cameraTransform = this.camera.getTransform();

        const childCount = this.numbersParent.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = this.numbersParent.getChild(i);
            this.numbersTr.push(child.getTransform());

            const visual = child.getChild(0).getComponent("Component.RenderMeshVisual") as RenderMeshVisual;
            const mat = visual ? visual.getMaterial(0) : null;
            this.childMaterials.push(mat);

            // Start hidden
            if (mat) {
                mat.mainPass.baseColor = new vec4(1, 1, 1, 0);
            }
        }
    }

    // ----------------------------------------------------------
    // Update
    // ----------------------------------------------------------

    onUpdate(): void {
        const camPos = this.cameraTransform.getWorldPosition();

        this.numbersTr.forEach((childTransform) => {
            const childPos = childTransform.getWorldPosition();
            const direction = camPos.sub(childPos).normalize();
            const lookRotation = quat.lookAt(direction, vec3.up());
            childTransform.setWorldRotation(lookRotation);
        });
    }

    // ----------------------------------------------------------
    // Animation
    // ----------------------------------------------------------
    public showNumbers(onComplete?: () => void){
        const total = this.childMaterials.length;
        this.playRecursiveFadeIn(0, total, onComplete)
    }

    public hideNumbers(onComplete?: () => void){
        const fadeOut = new Animation({
            duration: this.fadeDuration,
            easing: Easing.getEasing(this.easingFade),
            onUpdate: (progress) => {
                this.childMaterials.forEach((mat) => {
                    mat.mainPass.baseColor = new vec4(1,1,1,1 - progress);
                });
            },
            onComplete: onComplete,
        });
        fadeOut.play();
    }

    private playRecursiveFadeIn(id: number, total:number, onComplete?: () => void): void {
        if(id >= total){
            if(onComplete){
                onComplete();
            }
            return;
        }

        //anim current number
        const fadeIn = new Animation({
            duration: this.fadeDuration,
            easing: Easing.getEasing(this.easingFade),
            onUpdate: (progress) => {
                this.childMaterials[id].mainPass.baseColor = new vec4(1,1,1,progress);
            },
            onComplete: () => {},
        });
        fadeIn.play();

        //next number
        const startDelayNext = id * this.delayBetween;
        const delayFadeNext = new Delay({
            duration: startDelayNext,
            onComplete: () => {
                this.playRecursiveFadeIn(id+1, total, onComplete);
            },
        });
        delayFadeNext.play();
    }

    

    resetVisibility(): void {
        this.childMaterials.forEach((mat) => {
            if (mat) {
                mat.mainPass.baseColor = new vec4(1, 1, 1, 0);
            }
        });
    }
}
