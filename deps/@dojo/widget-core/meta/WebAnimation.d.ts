/// <reference types="web-animations-js" />
import 'web-animations-js/web-animations-next-lite.min';
import { Base } from './Base';
/**
 * Animation controls are used to control the web animation that has been applied
 * to a vdom node.
 */
export interface AnimationControls {
    play?: boolean;
    onFinish?: () => void;
    onCancel?: () => void;
    reverse?: boolean;
    cancel?: boolean;
    finish?: boolean;
    playbackRate?: number;
    startTime?: number;
    currentTime?: number;
}
/**
 * Animation timing properties passed to a new KeyframeEffect.
 */
export interface AnimationTimingProperties {
    duration?: number;
    delay?: number;
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    easing?: string;
    endDelay?: number;
    fill?: 'none' | 'forwards' | 'backwards' | 'both' | 'auto';
    iterations?: number;
    iterationStart?: number;
}
/**
 * Animation propertiues that can be passed as vdom property `animate`
 */
export interface AnimationProperties {
    id: string;
    effects: any[];
    controls?: AnimationControls;
    timing?: AnimationTimingProperties;
}
/**
 * Info returned by the `get` function on WebAnimation meta
 */
export interface AnimationInfo {
    currentTime: number;
    playState: 'idle' | 'pending' | 'running' | 'paused' | 'finished';
    playbackRate: number;
    startTime: number;
}
export interface AnimationPlayer {
    player: Animation;
    used: boolean;
}
export declare class WebAnimations extends Base {
    private _animationMap;
    private _createPlayer(node, properties);
    private _updatePlayer(player, controls);
    animate(key: string, animateProperties: AnimationProperties | AnimationProperties[]): void;
    get(id: string): Readonly<AnimationInfo> | undefined;
    afterRender(): void;
}
export default WebAnimations;
