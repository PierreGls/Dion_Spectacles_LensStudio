import { GameController } from "./GameController";

@component
export class MarkerController extends BaseScriptComponent {
  @input gameController: GameController;

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Attached object</span>')

  @input markerObjs: SceneObject[];

  @input placementRelativeMarkerDebug: SceneObject;
  @input placementRelativeMarkers: SceneObject[];

  @input followSmooth:number;

  public targetPosition: vec3;
  public targetTr: Transform;

  public nextMarkerPos:vec3;

  onAwake(): void {
    this.targetTr = this.markerObjs[0].getTransform();
  }


  // ----------------------------------------------------------
  // DEBUG
  // ----------------------------------------------------------
  public onMarkerFound_DEBUG() {
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
