/**
 * Specs Inc. 2026
 * Marker tracking callback handler that responds to marker found/lost events. Demonstrates
 * animation control based on marker tracking state for augmented reality experiences.
 */
import { Logger } from "Utilities.lspkg/Scripts/Utils/Logger";
import { bindStartEvent, bindUpdateEvent, bindLateUpdateEvent, bindDestroyEvent } from "SnapDecorators.lspkg/decorators";
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
  private hasMarkerBeenFound = false;

  onAwake(): void {
    this.parentToFollow.enabled = false;

    this.objectAttachedTr = this.objectAttached.getTransform();
    this.parentToFollowTr = this.parentToFollow.getTransform();

    //let eventUpdate = this.createEvent('UpdateEvent');
    //eventUpdate.bind(this.onUpdate.bind(this));
  }

  onUpdate(): void {
    
  }

  onUpdatePosition(){
    this.targetPosition = this.objectAttachedTr.getWorldPosition();
    const current = this.parentToFollowTr.getWorldPosition();
    const lerpFactor = Math.min(this.followSmooth * getDeltaTime(), 1);

    const smoothed = vec3.lerp(current, this.targetPosition, lerpFactor);
    this.parentToFollowTr.setWorldPosition(smoothed);
  }

  onMarkerFound() {
    this.parentToFollow.enabled = true;
    this.gameController.onMarkerFound();
    ///this.onUpdatePosition();
  }

  onMarkerLost() {
    //this.parentToFollow.enabled = false;
    this.gameController.onMarkerLost();
  }
}
