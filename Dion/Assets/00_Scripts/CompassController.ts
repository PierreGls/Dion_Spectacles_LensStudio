import { Animation } from "./Animation";
import { Delay } from "./Animation";
import { Easing } from "./Easing";  

@component
export class CompassController extends BaseScriptComponent {

  @input camera: Camera;

  @ui.separator

  @input arrowObj: SceneObject;
  @input compassObj: SceneObject;

  @ui.separator

  @input iconMat: Material;
  @input arrowMat: Material;

  @ui.separator

  @input('Asset.Texture[]') texturesMarkers: Texture[];

  @ui.separator

  @input('float') distanceFromCam = 2;
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

  private compassTransform: Transform;
  private arrowTransform: Transform;
  private cameraTransform: Transform;
  private targetPos: vec3;

  onAwake(): void {
    let eventUpdate = this.createEvent('UpdateEvent');
    eventUpdate.bind(this.onUpdate.bind(this));

    this.compassTransform = this.compassObj.getTransform();
    this.arrowTransform = this.arrowObj.getTransform();
    this.cameraTransform  = this.camera.getTransform();

    //start hided
    this.iconMat.mainPass.baseColor = new vec4(1,1,1,0);
    this.arrowMat.mainPass.baseColor = new vec4(1,1,1,0);
  }

  onUpdate(): void {
    this.updatePosCompass();
    this.updateArrowRotation();
  }

  private updatePosCompass(){
    const camPos = this.cameraTransform.getWorldPosition();
    const camDir = this.cameraTransform.forward;
    const newPos = camPos.add(camDir.mult(new vec3(this.distanceFromCam, this.distanceFromCam, this.distanceFromCam)))
    this.compassTransform.setWorldPosition(newPos);

    const newRot = quat.lookAt(this.cameraTransform.forward, this.cameraTransform.up);
    this.compassTransform.setWorldRotation(newRot);
  }

  // ----------------------------------------------------------
  // Rotate the arrow around Y axis to point toward the target
  // ----------------------------------------------------------
  private updateArrowRotation(): void {
    if (this.targetPos == null) return;

    const arrowPos  = this.arrowTransform.getWorldPosition();
    const targetPos = this.targetPos;

    // Flat direction on XZ plane (ignore Y)
    const direction = new vec3(
      -(targetPos.x - arrowPos.x),
      0,
      -(targetPos.z - arrowPos.z)
    );

    if (direction.length < 0.001) return; // Avoid NaN if overlapping

    // Absolute angle toward target (world space)
    const targetAngleWorld = Math.atan2(direction.x, direction.z);

    // Camera Y angle (world space) — subtract it to get a camera-relative angle
    const cameraAngleWorld = this.getYAngle(this.cameraTransform.getWorldRotation());
    const targetAngleLocal = targetAngleWorld - cameraAngleWorld;

    // Get current local Y angle
    const currentAngleLocal = this.getYAngle(this.arrowTransform.getLocalRotation());

    // Smooth the angle (handles wrap-around)
    const smoothedAngle = this.lerpAngle(
      currentAngleLocal,
      targetAngleLocal,
      Math.min(this.rotationSmooth * getDeltaTime(), 1)
    );

    // Apply as local rotation around Y only
    this.arrowTransform.setLocalRotation(
      quat.fromEulerAngles(0, smoothedAngle, 0)
    );
  }

  // ----------------------------------------------------------
  // Target
  // ----------------------------------------------------------
  public setTarget(newTarget: vec3){
    this.targetPos = newTarget;
  }

  public removeTarget(){
    this.targetPos = null;
  }

  // ----------------------------------------------------------
  // Animations
  // ----------------------------------------------------------
  public onStart(){
    //fade in
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
  // Texture
  // ----------------------------------------------------------
  public setTextureMarker(id:number){
    if(id < 0 || id>= this.texturesMarkers.length){
      print("Wrong id : " + id);
      return;
    }

    print("setTextureMarker " + id);

    this.iconMat.mainPass.baseTex = this.texturesMarkers[id];
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