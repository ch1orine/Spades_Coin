/**
 * 声音管理
 */
import { resources, AudioClip, AudioSource, director, Node } from 'cc';

export class Sound {
    //bgm
    public static music = {
        bgm: "audio/bgm/bgm",
    }
    public static effect = {
        wipe: "audio/effect/wipe",   //擦除
    }

    private static _curMusic: string = "";
    private _noMusic: boolean = false;   //禁止声音
    private _noEffect: boolean = false;    //禁止音效

    private _audioSource: AudioSource;
    private _audioSource2: AudioSource;    //专门播放音乐数组

    private static _ins: Sound;
    public static get ins(): Sound {
        if (this._ins == null) {
            this._ins = new Sound();
        }
        return this._ins;
    }
    constructor() {
        const audioNode = new Node();     //创建一个节点作为 audioMgr
        audioNode.name = '_globalAudioNode';
        director.getScene().addChild(audioNode); //添加节点到场景
        director.addPersistRootNode(audioNode);  //标记为常驻节点
        this._audioSource = audioNode.addComponent(AudioSource);  //添加 AudioSource 组件，用于播放音频。

        const audioNode2 = new Node();     //创建一个节点作为 audioMgr
        audioNode2.name = '_globalAudioNode2';
        director.getScene().addChild(audioNode2); //添加节点到场景
        director.addPersistRootNode(audioNode2);  //标记为常驻节点
        this._audioSource2 = audioNode2.addComponent(AudioSource);  //添加 AudioSource 组件，用于播放音频。
    }

    /**
     * 播放音频
     * @param sound clip or url for the audio
     * @param volume 
     */
    public playOneShot(sound: string, volume: number = 1.0) {
        if (this._noEffect) return;
        resources.load(sound, (err, clip: AudioClip) => {
            if (err) {
                console.log(err);
            }
            else {
                this._audioSource.playOneShot(clip, volume);
            }
        });
    }
    /**
     * 播放长音频 背景音乐
     * @param sound clip or url for the sound
     * @param volume 
     */
    public play(path: string, volume: number = 1.0, loop: boolean = true) {
        // if (this._noMusic) return;
        if (Sound._curMusic === path) {
            if (this._audioSource.clip && !this._audioSource.playing) {
                // this._audioSource.play();

                if (this._noMusic) this._audioSource.pause();
                else this._audioSource.play();
            }
            return;
        }
        Sound._curMusic = path;
        if (this._audioSource.clip) this._audioSource.stop();
        resources.load(path, (err, clip: AudioClip) => {
            if (err) {
                console.log(err);
            }
            else {
                this._audioSource.clip = clip;
                this._audioSource.loop = loop;
                this._audioSource.volume = volume;
                // this._audioSource.play();

                if (this._noMusic) this._audioSource.pause();
                else this._audioSource.play();
            }
        });
    }


    public stop() {
        this._audioSource.stop();
    }

    /**
     * 播放语音 有回调
     * @param path 
     * @param volume 
     * @param cb 
     */
    public playVoice(path: string, cb: Function = null): void {
        resources.load(path, (err, clip: AudioClip) => {
            if (err) console.log(err);
            else {
                this._audioSource2.clip = clip;
                this._audioSource2.loop = false;
                this._audioSource2.volume = 1;
                this._audioSource2.play();
                this._audioSource2.scheduleOnce(() => {
                    if (cb) cb();
                }, this._audioSource2.duration);
            }
        });
    }

    /**
    * 播放长音频数组 背景音乐
    * @param sound clip or url for the sound
    * @param volume 
    */
    public playSounds(paths: string[], volume: number = 1.0) {
        let index: number = 0;
        let playSound = () => {
            let path = paths[index];
            index++;
            resources.load(path, (err, clip: AudioClip) => {
                if (err) console.log(err);
                else {
                    this._audioSource2.clip = clip;
                    this._audioSource2.loop = false;
                    this._audioSource2.volume = volume;
                    this._audioSource2.play();
                    if (index < paths.length) {
                        this._audioSource2.scheduleOnce(() => {
                            playSound();    //播放下一曲
                        }, this._audioSource2.duration);
                    }
                }
            });
        }
        playSound();
    }

    //禁止背景音乐
    public get disableMusic() {
        return this._noMusic;
    }
    public set disableMusic(b: boolean) {
        this._noMusic = b;
        if (b) this._audioSource.pause();
        else this._audioSource.play();
    }
    //音量
    public set volume(volume: number) {
        this._audioSource.volume = volume;
        this._audioSource2.volume = volume;
    }

    //禁止音效
    public get disableEffect() {
        return this._noEffect;
    }
    public set disableEffect(b: boolean) {
        this._noEffect = b;
    }
}