"use client";

import { MCDemo } from "./MCDemo";
import { DragDropDemo } from "./DragDropDemo";
import { MatchingDemo } from "./MatchingDemo";
import { SliderDemo } from "./SliderDemo";
import { FillInDemo } from "./FillInDemo";
import { FreetextDemo } from "./FreetextDemo";
import { TrueFalseDemo } from "./TrueFalseDemo";
import { ImageChoiceDemo } from "./ImageChoiceDemo";
import { SortingDemo } from "./SortingDemo";
import { TimerDemo } from "./TimerDemo";

export function DemoRenderer({ id, isPaused, hue }: { id: string; isPaused: boolean; hue: string }) {
  switch (id) {
    case "mc": return <MCDemo isPaused={isPaused} />;
    case "dragdrop": return <DragDropDemo isPaused={isPaused} />;
    case "matching": return <MatchingDemo isPaused={isPaused} />;
    case "slider": return <SliderDemo isPaused={isPaused} hue={hue} />;
    case "fillin": return <FillInDemo isPaused={isPaused} />;
    case "freetext": return <FreetextDemo isPaused={isPaused} />;
    case "truefalse": return <TrueFalseDemo isPaused={isPaused} />;
    case "image": return <ImageChoiceDemo isPaused={isPaused} />;
    case "sorting": return <SortingDemo isPaused={isPaused} />;
    case "timer": return <TimerDemo isPaused={isPaused} />;
    default: return null;
  }
}
