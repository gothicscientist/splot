// pileGo! plug devices on one timeline (look-dev): the phone insert through every step, DMs, a comment reply,
// listing cards, the sale-notification stack, the corner bug and the end card.
// Stills: 8 snap, 20 cutouts, 40 drafts, 58 live, 72 sold, 86 delisted, 130 social devices, 165 pings, 190 end card.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PileGoPhone, SoldStack, DMThread, CommentReply, ListingCard, EndCard, PileGoBug, RelistSnap } from "../brands/pilego";
import { SafeZones } from "../core/Reel";

export const PileGoLab: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #4a3c5c, #1a1522)" }}>
      {f < 100 ? (
        <>
          <PileGoPhone at={0} steps={{ cut: 10, list: 25, live: 45, sold: 65, delist: 77 }} pile={[14, 13]} />
          <PileGoBug at={2} />
        </>
      ) : null}
      {f >= 100 && f < 150 ? (
        <>
          <CommentReply at={100} user="@newgen.detector" text="name 3 songs or this fit is a psy-op" />
          <DMThread
            at={104}
            y={1010}
            handle="@lowball.larry"
            msgs={[
              { at: 110, from: "them", text: "is this still available" },
              { at: 118, from: "me", text: "yes" },
              { at: 128, from: "them", text: "would u do $5 shipped" },
            ]}
          />
        </>
      ) : null}
      {f >= 150 && f < 180 ? (
        <>
          <ListingCard at={150} x={300} y={760} title="ARCHIVE BALLHOG GRAIL RARE VINTAGE Y2K (mall brand)" price="$240" likes={3} gone={158} rot={-4} />
          <ListingCard at={152} x={790} y={700} title="Washed black zip hoodie, heavy fleece" price="$45" kind="hoodie" likes={41} sold={160} rot={3} />
          <SoldStack
            pings={[
              { at: 162, title: "Sold on Depop", body: "Washed black zip hoodie · $45" },
              { at: 166, title: "Sold on Vinted", body: "Baggy raw denim · $38" },
              { at: 170, title: "Sold on eBay", body: "Distressed knit · $62" },
            ]}
            y={1180}
          />
        </>
      ) : null}
      <RelistSnap at={140} out={149} />
      <EndCard at={185} />
      <SafeZones />
    </AbsoluteFill>
  );
};
