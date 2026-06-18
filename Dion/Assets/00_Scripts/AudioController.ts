@component
export class AudioController extends BaseScriptComponent {
    @input audios: AudioComponent[];

    onAwake() {
        //Suitable for ambient sounds or background music where slight delays are acceptable.
        this.audios.forEach((audio) => {
            audio.playbackMode = Audio.PlaybackMode.LowPower;
        });
    }

    public playAudio(id:number){
        if(id >= this.audios.length || id < 0){
            print("Wrong id : " + id)
            return;
        }

        //stop playing audios
        this.audios.forEach((audio) => {
            if(audio.isPlaying){
                audio.stop(true);
            }
        });

        this.audios[id].play(1);
    }
}
