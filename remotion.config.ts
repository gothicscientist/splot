import { Config } from "@remotion/cli/config";

// WebGL in headless Chrome on Windows: ANGLE is the reliable backend (swangle = software fallback).
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setConcurrency(4);
Config.setOverwriteOutput(true);
