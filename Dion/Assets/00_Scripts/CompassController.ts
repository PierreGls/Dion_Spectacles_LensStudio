import { Animation } from "./Animation";
import { Delay } from "./Animation";
import { Easing } from "./Easing";  

@component
export class CompassController extends BaseScriptComponent {

  @input camera: Camera;

  @ui.separator

  // The arrow plane (child of compass plane)
  @input arrowObject: SceneObject;

  @ui.separator

  @input iconMat: Material;
  @input arrowMat: Material;

  @ui.separator

  // Arrow rotation smoothing
  @input('float') rotationSmooth: number = 8;

  @input durationFade: number;
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

  // --- Private ---

  private arrowTransform: Transform;
  private cameraTransform: Transform;
  private targetTransform: Transform;

  onAwake(): void {
    let eventUpdate = this.createEvent('UpdateEvent');
    eventUpdate.bind(this.onUpdate.bind(this));

    this.arrowTransform   = this.arrowObject.getTransform();
    this.cameraTransform  = this.camera.getTransform();

    //start hided
    this.iconMat.mainPass.baseColor = new vec4(1,1,1,0);
    this.arrowMat.mainPass.baseColor = new vec4(1,1,1,0);
  }

  onUpdate(): void {
    this.updateArrowRotation();
  }

  // ----------------------------------------------------------
  // Rotate the arrow around Y axis to point toward the target
  // ----------------------------------------------------------

  private updateArrowRotation(): void {
    if(this.targetTransform == null){return;}

    const arrowPos  = this.arrowTransform.getWorldPosition();
    const targetPos = this.targetTransform.getWorldPosition();

    // Flat direction on XZ plane (ignore Y)
    const direction = new vec3(
      -(targetPos.x - arrowPos.x),
      0,
      -(targetPos.z - arrowPos.z)
    );

    if (direction.length < 0.001) return; // Avoid NaN if overlapping

    // Compute target angle around Y axis
    const targetAngle = Math.atan2(direction.x, direction.z);

    // Get current Y rotation
    //const currentRot   = this.arrowTransform.getLocalRotation();
    const currentRot   = this.arrowTransform.getWorldRotation();
    const currentAngle = this.getYAngle(currentRot);

    // Smooth the angle (handles wrap-around)
    const smoothedAngle = this.lerpAngle(
      currentAngle,
      targetAngle,
      Math.min(this.rotationSmooth * getDeltaTime(), 1)
    );

    // Apply rotation around Y only
    //this.arrowTransform.setLocalRotation(
    this.arrowTransform.setWorldRotation(
      quat.fromEulerAngles(0, smoothedAngle, 0)
    );
  }

  // ----------------------------------------------------------
  // Target
  // ----------------------------------------------------------
  public setTarget(newTarget: Transform){
    this.targetTransform = newTarget;
  }

  public removeTarget(){
    this.targetTransform = null;
  }

  // ----------------------------------------------------------
  // Animations
  // ----------------------------------------------------------
  public onStart(newTarget:Transform){
    this.setTarget(newTarget);

    //+ fade in
    const animFadeIn = new Animation({
        duration: this.durationFade,
        easing: Easing.getEasing(this.easingFade),
        onUpdate: (progress) => {
            this.iconMat.mainPass.baseColor = new vec4(1,1,1,progress);
            this.arrowMat.mainPass.baseColor = new vec4(1,1,1,progress);
        },
        onComplete: () => {}
    });
    animFadeIn.play();
  }

  public onStop(){
    this.removeTarget();

    //fade out
    const animFadeOut = new Animation({
        duration: this.durationFade,
        easing: Easing.getEasing(this.easingFade),
        onUpdate: (progress) => {
            this.iconMat.mainPass.baseColor = new vec4(1,1,1,1 - progress);
            this.arrowMat.mainPass.baseColor = new vec4(1,1,1,1 - progress);
        },
        onComplete: () => {}
    });
    animFadeOut.play();
  }

  // ----------------------------------------------------------
  // Utils
  // ----------------------------------------------------------

  // Extract Y angle (in radians) from a quaternion
  private getYAngle(q: quat): number {
    const sinY = 2 * (q.w * q.y - q.z * q.x);
    const cosY = 1 - 2 * (q.y * q.y + q.x * q.x);
    return Math.atan2(sinY, cosY);
  }

  // Lerp between two angles with wrap-around handling
  private lerpAngle(from: number, to: number, t: number): number {
    let delta = to - from;

    // Wrap delta to [-PI, PI]
    while (delta >  Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;

    return from + delta * t;
  }
}