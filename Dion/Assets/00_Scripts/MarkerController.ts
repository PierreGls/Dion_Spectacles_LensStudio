import { GameController } from "./GameController";

@component
export class MarkerController extends BaseScriptComponent {
  @input gameController: GameController;

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Attached object</span>')

  @input objectAttached: SceneObject;
  @input parentToFollow: SceneObject;
  @input markerObjs: SceneObject[];

  @input placementRelativeMarkerDebug: SceneObject;
  @input placementRelativeMarkers: SceneObject[];

  @input followSmooth:number;

  private objectAttachedTr: Transform;
  private parentToFollowTr: Transform;

  public targetPosition: vec3;
  public targetTr: Transform;

  public nextMarkerPos:vec3;

  onAwake(): void {
    this.parentToFollow.enabled = false;

    this.objectAttachedTr = this.objectAttached.getTransform();
    this.parentToFollowTr = this.parentToFollow.getTransform();

    this.targetTr = this.markerObjs[0].getTransform();

    let eventUpdate = this.createEvent('UpdateEvent');
    eventUpdate.bind(this.onUpdate.bind(this));
  }

  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------

  private onUpdate(): void {
    //this.targetPosition = this.objectAttachedTr.getWorldPosition();
    //this.onUpdatePosition();
  }

  private onUpdatePosition(){
    this.targetPosition = this.objectAttachedTr.getWorldPosition();
    const current = this.parentToFollowTr.getWorldPosition();

    //already very close 
    if (this.targetPosition.sub(current).length < 0.01) return;

    const lerpFactor = Math.min(this.followSmooth * getDeltaTime(), 1);

    const smoothed = vec3.lerp(current, this.targetPosition, lerpFactor);
    this.parentToFollowTr.setWorldPosition(smoothed);
  }

  // ----------------------------------------------------------
  // DEBUG
  // ----------------------------------------------------------
  public onMarkerFound_DEBUG() {
    this.parentToFollow.enabled = true;
    this.nextMarkerPos = this.placementRelativeMarkerDebug.getTransform().getWorldPosition();
    this.gameController.onMarkerFound(0);
    this.targetTr = this.markerObjs[0].getTransform();
  }

  public onMarkerLost_DEBUG() {
    this.gameController.onMarkerLost(0);
  }

  // ----------------------------------------------------------
  // Intro
  // ----------------------------------------------------------
  public onMarkerFound_Intro() {
    this.parentToFollow.enabled = true;
    this.targetTr = this.markerObjs[1].getTransform();
    this.nextMarkerPos = this.placementRelativeMarkers[0].getTransform().getWorldPosition(); //Dublin Castle
    this.gameController.onMarkerFound(1);
  }

  public onMarkerLost_Intro() {
    this.gameController.onMarkerLost(1);
  }

  // ----------------------------------------------------------
  // Dublin Castle
  // ----------------------------------------------------------
  public onMarkerFound_DublinCastle() {
    this.parentToFollow.enabled = true;
    this.targetTr = this.markerObjs[2].getTransform();
    this.nextMarkerPos = this.placementRelativeMarkers[1].getTransform().getWorldPosition(); //Christchurch
    this.gameController.onMarkerFound(2);
  }

  public onMarkerLost_DublinCastle() {
    this.gameController.onMarkerLost(2);
  }

  // ----------------------------------------------------------
  // Christchurch
  // ----------------------------------------------------------
  public onMarkerFound_Christchurch() {
    this.gameController.onMarkerFound(3);
  }
}
