import { GameController } from "./GameController";

@component
export class MarkerController extends BaseScriptComponent {
  @input gameController: GameController;

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Attached object</span>')

  @input objectAttached: SceneObject;
  @input parentToFollow: SceneObject;

  @input followSmooth:number;

  private objectAttachedTr: Transform;
  private parentToFollowTr: Transform;

  private targetPosition: vec3;

  onAwake(): void {
    this.parentToFollow.enabled = false;

    this.objectAttachedTr = this.objectAttached.getTransform();
    this.parentToFollowTr = this.parentToFollow.getTransform();

    //To activate if we want to have the 3D assets in front of the marker
    //let eventUpdate = this.createEvent('UpdateEvent');
    //eventUpdate.bind(this.onUpdate.bind(this));
  }

  private onUpdate(): void {
    
  }

  private onUpdatePosition(){
    this.targetPosition = this.objectAttachedTr.getWorldPosition();
    const current = this.parentToFollowTr.getWorldPosition();
    const lerpFactor = Math.min(this.followSmooth * getDeltaTime(), 1);

    const smoothed = vec3.lerp(current, this.targetPosition, lerpFactor);
    this.parentToFollowTr.setWorldPosition(smoothed);
  }

  // ----------------------------------------------------------
  // DEBUG
  // ----------------------------------------------------------
  public onMarkerFound_DEBUG() {
    this.parentToFollow.enabled = true;
    this.gameController.onMarkerFound();
  }

  public onMarkerLost_DEBUG() {
    this.gameController.onMarkerLost();
  }

  // ----------------------------------------------------------
  // Intro
  // ----------------------------------------------------------
  public onMarkerFound_Intro() {
    this.parentToFollow.enabled = true;
    this.gameController.onMarkerFound();
  }

  public onMarkerLost_Intro() {
    this.gameController.onMarkerLost();
  }

  // ----------------------------------------------------------
  // Dublin Castle
  // ----------------------------------------------------------
  public onMarkerFound_DublinCastle() {
    this.parentToFollow.enabled = true;
    this.gameController.onMarkerFound();
  }

  public onMarkerLost_DublinCastle() {
    this.gameController.onMarkerLost();
  }
}
