@component
export class PlacementController extends BaseScriptComponent {
    
    @input camera: Camera;
    @input objsParent: SceneObject;

    @ui.separator
    @input('float') placementHeight: number = -20;  
    @input('float') smoothPositionFactor: number = 5; 
    @input('float') distMarker: number = 20;   

    @input('boolean') alwaysFollowing: boolean = false;
    @input('float') @showIf("alwaysFollowing") followDistance: number = 150;


    private objsParentTr: Transform;
    private cameraTransform: Transform;
    private targetPosition: vec3;

    onAwake() {
        let eventUpdate = this.createEvent('UpdateEvent');
        eventUpdate.bind(this.onUpdate.bind(this));

        this.objsParentTr = this.objsParent.getTransform();
        this.cameraTransform = this.camera.getTransform();

        this.targetPosition = this.getPosFrontUser();
    }

    onUpdate(): void {
        if(this.alwaysFollowing){
            this.targetPosition = this.getPosFrontUser();
        }

        this.updateFollow();
    }

  // ----------------------------------------------------------
  // Placement
  // ----------------------------------------------------------

  //FOLLOWING USER 
  private updateFollow(): void {
    const current = this.objsParentTr.getWorldPosition();
    const deltaTime = getDeltaTime();
    const lerpFactor = Math.min(this.smoothPositionFactor * deltaTime, 1);

    const smoothed = vec3.lerp(current, this.targetPosition, lerpFactor);
    this.objsParentTr.setWorldPosition(smoothed);
  }

  private getPosFrontUser(): vec3 {
    const camPos     = this.cameraTransform.getWorldPosition();
    const camForward = this.cameraTransform.forward;

    return new vec3(
      camPos.x + camForward.x * this.followDistance,
      this.placementHeight,
      camPos.z + camForward.z * this.followDistance
    );
  }

  //PLACED IN FRONT OF THE MARKER
  public updatePositionMarker(markerTr:Transform) : void{
    //If we want in front of marker
    const direction = markerTr.forward
    direction.y = 0;
    direction.normalize();
    const markerPos = markerTr.getWorldPosition();
    
    const targetPos = new vec3(
      markerPos.x + direction.x * this.distMarker,
      this.placementHeight,
      markerPos.z + direction.z * this.distMarker
    );

    //this.castleParentTransform.setWorldPosition(targetPos);
    this.targetPosition = targetPos;

    this.updateRotationMarker(targetPos);
  }

  private updateRotationMarker(castlePos): void {
    const camPos    = this.cameraTransform.getWorldPosition();

    // Direction from castle toward camera
    const dir = new vec3(
      camPos.x - castlePos.x,
      0,
      camPos.z - castlePos.z
    ).normalize();

    // Compute Y angle toward camera
    const angle = Math.atan2(dir.x, dir.z);

    this.objsParentTr.setWorldRotation(
      quat.fromEulerAngles(0, angle, 0)
    );
  }
}
