/**
 * 人物的播放阶段；待机循环、离场单次播放，隐藏后可重新召回待机。
 */
export type CharacterPhase = 'idle' | 'leaving' | 'hidden';
