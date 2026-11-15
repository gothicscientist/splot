// The timeline contract between the pipeline scripts (scripts/timeline.mjs writes it) and every scene.
// All times are FRAMES at timeline.fps unless a field says seconds.

export type TWord = {
  i: number;
  beat: string;
  text: string; // exactly as written in the script (captions show this)
  start: number; // seconds
  end: number; // seconds
  s: number; // frame the word starts
  e: number; // frame the word ends
  emph: boolean; // *starred* in the script: the boxed keyword
};

export type TBeat = {
  id: string;
  shot: string;
  role: string | null;
  text: string;
  s: number;
  speechEnd: number;
  e: number;
  words: [number, number];
  transition: string | null;
};

export type TransitionKind =
  | "cut"
  | "dissolve"
  | "whip"
  | "whip-left"
  | "whip-right"
  | "whip-up"
  | "whip-down"
  | "push"
  | "zoom-out"
  | "flash"
  | "dip"
  | "iris"
  | "slide-up";

export type TShot = { id: string; beats: string[]; s: number; e: number; transitionIn: TransitionKind | null };

export type TCaption = { text: string; words: number[]; s: number; e: number; emph: boolean; beat: string };

export type CaptionStyle = {
  preset?: string; // bold-pop | boxed | pixel | marker | clean | karaoke | none
  mode?: "single" | "phrase";
  font?: string;
  size?: number; // px at 1080 wide (auto-fit shrinks it)
  y?: number; // centre of the caption block as a fraction of the height (0.64-0.74 is the safe sweet spot)
  color?: string;
  keywordColor?: string;
  keywordBox?: string; // background of the boxed keyword
  keywordText?: string; // text colour inside the box
  stroke?: number; // outline px
  uppercase?: boolean;
  hidden?: boolean;
};

export type Timeline = {
  version: number;
  slug: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  style: string;
  mode: string;
  captionStyle: CaptionStyle;
  hook: { shot: string; variants: number };
  audio: { mix: string; voice: string; hasMix?: boolean };
  words: TWord[];
  beats: TBeat[];
  shots: TShot[];
  captions: TCaption[];
};

export type Vec3 = [number, number, number];
