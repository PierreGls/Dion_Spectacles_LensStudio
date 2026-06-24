// ============================================================
// FrameInteractionDetector.ts
// ============================================================

import { Interactable } from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';
import { InteractorEvent } from 'SpectaclesInteractionKit.lspkg/Core/Interactor/InteractorEvent';
import { SIK } from 'SpectaclesInteractionKit.lspkg/SIK';
import { GameController } from "./GameController";    
import { Frame } from 'SpectaclesUIKit.lspkg/Scripts/Components/Frame/Frame';

@component
export class FrameInteractionDetector extends BaseScriptComponent {
    @input 
    gameController: GameController

    @input 
    frameObj: SceneObject;

    @input 
    frame: Frame;

    private interactable;

    onAwake() {
        this.createEvent('OnStartEvent').bind(() => {
            this.onStart();
        });
    }

    onStart() {
        let interactionManager = SIK.InteractionManager;

        // This script assumes that an Interactable (and Collider) component have already been instantiated on the SceneObject.
        let interactable = this.frameObj.getComponent(
            Interactable.getTypeName()
        );

        // You could also retrieve the Interactable component like this:
        interactable = interactionManager.getInteractableBySceneObject(
            this.frameObj
        );

        // Define the desired callback logic for the relevant Interactable event.
        let onTriggerStartCallback = (event: InteractorEvent) => {
            //print( `The Interactable has been triggered by an Interactor with input type: ${event.interactor.inputType} at position: ${event.interactor.targetHitInfo.hit.position}`);
            //this.gameController.onClickOnFrame();
        };

        interactable.onInteractorTriggerStart(onTriggerStartCallback);
    }

    onHideFrame(){
        this.frame.hideVisual();
        this.frame.autoShowHide = false;
    }
}
