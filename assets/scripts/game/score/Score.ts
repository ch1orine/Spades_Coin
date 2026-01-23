import { _decorator, Component, Label, Node } from 'cc';
import { EventBus } from '../../event/EventBus';
import { ScoreEvent } from './ScoreEvent';
const { ccclass, property } = _decorator;

@ccclass('Score')
export class Score extends Component {

    @property(Label)
    label!: Label; 

    private _score: number = 0;
    private _aiScore: number = 0;

    protected onLoad(): void {
        

        
    }

    start() {
        if (this.node.angle === 0 || this.node.angle === -180) {
            this.label.string = this._score + "/4";
            EventBus.instance.on(ScoreEvent.PlayerScoreUpdated, this.updateScore, this);
        }else{
            this.label.string = this._score + "/5";
            EventBus.instance.on(ScoreEvent.AIScoreUpdated, this.updateAIScore, this);
        }
    }

    updateScore() {                
        this._score ++;
        this.label.string = this._score + "/4";
        
    }

    updateAIScore() {
        this._aiScore ++;
        this.label.string = this._aiScore + "/5";
    }
}

