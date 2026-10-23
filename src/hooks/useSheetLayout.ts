import {useState} from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import {useBottomSheetInternal} from '@gorhom/bottom-sheet';

/**
 * The live geometry of the bottom sheet around the caller.
 *
 * WHY THIS HOOK EXISTS
 *
 * A snap-point sheet does not resize its content when it moves. The
 * content container is always as tall as the TALLEST detent, and the
 * sheet slides up inside it. So anything pinned to the bottom of that
 * container sits below the screen whenever the sheet is resting at a
 * shorter detent.
 *
 * That is exactly what used to happen to the "Start navigation"
 * button: it was the last child of the sheet's content, so it was
 * laid out at the bottom of a box that was 90 % of the screen tall
 * while only 63 % of that box was actually on screen. The button was
 * not clipped by accident — it was 18 % of the screen below the
 * bottom edge, which is where the debugger reported it.
 *
 * The fix is to lay the content out against the part of the sheet
 * that is really visible, and that means reading the sheet's live
 * position. `@gorhom/bottom-sheet` publishes it through
 * `useBottomSheetInternal`, which the package exports from its root,
 * so this is a supported read and not a reach into private internals.
 *
 * THE THREE NUMBERS IT GIVES BACK
 *
 *   • `visibleHeight` — how much of the sheet is on screen right now.
 *     The sheet's content is laid out against this, so the bottom of
 *     the content always lands on the bottom of the visible sheet.
 *   • `sheetTop` — where the sheet's top edge is, measured down from
 *     the top of the map. The map uses it to size itself, so the map
 *     always ends exactly where the sheet begins.
 *   • `detailProgress` — 0 at the smallest detent and 1 once the
 *     sheet has been dragged past it. The route summary uses it to
 *     fade the turn-by-turn detail away when the sheet is collapsed
 *     down onto the map.
 *
 * HOW THE NUMBERS ARE DERIVED
 *
 * `animatedPosition` is the sheet's top edge, measured from the top of
 * the sheet's container: it is 0 when the sheet is at its tallest and
 * grows as the sheet is dragged down. The container's own height is
 * in `animatedLayoutState`, and the grab handle takes
 * `handleHeight` off the top of the content, so the visible content
 * is what is left between the handle and the bottom of the container.
 */
export const useSheetLayout = (
  publishSheetTop?: SharedValue<number>,
  reservedBottom = 0,
) => {
  const {
    animatedPosition,
    animatedLayoutState,
    animatedDetentsState,
    animatedIndex,
  } = useBottomSheetInternal();

  /**
   * The height of the sheet that is on screen, in pixels.
   *
   * `reservedBottom` is the space at the bottom of the screen that
   * something else owns — for the route screen, the white panel that
   * holds the "Start navigation" button. The sheet's content is laid
   * out above that panel rather than under it, so the panel never
   * covers the last row of the turn-by-turn list.
   */
  const visibleHeight = useDerivedValue(() => {
    const {containerHeight, handleHeight} = animatedLayoutState.get();

    // The container has not been measured yet.
    if (!containerHeight || containerHeight < 0) {
      return 0;
    }

    return Math.max(
      containerHeight -
        animatedPosition.get() -
        Math.max(0, handleHeight) -
        reservedBottom,
      0,
    );
  });

  /**
   * Where the sheet's top edge is, in pixels below the top of the map.
   */
  const sheetTop = useDerivedValue(() => {
    const {containerHeight} = animatedLayoutState.get();

    if (!containerHeight || containerHeight < 0) {
      return 0;
    }

    return Math.max(animatedPosition.get(), 0);
  });

  /**
   * How far the sheet has been dragged away from its smallest detent,
   * as a fraction between 0 and 1.
   *
   * The detents are stored as offsets from the top of the container,
   * so the smallest detent is the one with the LARGEST offset and the
   * first two entries of the list are the two lowest stops.
   */
  const detailProgress = useDerivedValue(() => {
    const detents = animatedDetentsState.get().detents;

    if (!detents || detents.length < 2) {
      return 1;
    }

    const lowest = detents[0];
    const next = detents[1];
    const span = lowest - next;

    if (span <= 0) {
      return 1;
    }

    const progress = (lowest - animatedPosition.get()) / span;

    return Math.min(Math.max(progress, 0), 1);
  });

  /**
   * The style that gives the sheet's content the visible height.
   *
   * The height is animated because the sheet moves on the UI thread:
   * reading it in JavaScript would put the layout one frame behind
   * the sheet, and the content would visibly lag behind the drag.
   */
  const contentStyle = useAnimatedStyle(() => ({
    height: visibleHeight.value,
  }));

  /**
   * The style that fades the route detail in and out.
   */
  const detailStyle = useAnimatedStyle(() => ({
    opacity: detailProgress.value,
  }));

  /**
   * Whether the route detail is on screen.
   *
   * The fade above is enough to hide the detail, but a faded-out
   * list would still swallow touches and still be scrollable, so the
   * pointer events are switched off as well. This is driven by the
   * settled detent rather than by the live position, because the
   * detail only has to be interactive once the sheet has come to
   * rest.
   */
  const [isDetailVisible, setIsDetailVisible] = useState(true);

  useAnimatedReaction(
    () => animatedIndex.get(),
    (index, previous) => {
      if (previous !== null && index !== previous) {
        runOnJS(setIsDetailVisible)(index !== 0);
      }
    },
  );

  /**
   * Hand the sheet's top edge to whoever asked for it.
   *
   * The map is a sibling of the sheet, not a child, so it cannot read
   * the sheet's position for itself. The route screen owns a shared
   * value for it and passes it in here.
   */
  useAnimatedReaction(
    () => sheetTop.value,
    value => {
      if (publishSheetTop) {
        /*
          A Reanimated shared value is mutable BY DESIGN. `.value` is
          the documented write API and it lands on the UI thread, so
          the map's height never crosses the bridge. The React
          Compiler's immutability rule cannot tell a shared value apart
          from a value it must freeze.
        */
        // eslint-disable-next-line react-hooks/immutability
        publishSheetTop.value = value;
      }
    },
    [publishSheetTop],
  );

  return {
    visibleHeight,
    sheetTop,
    detailProgress,
    contentStyle,
    detailStyle,
    isDetailVisible,
  };
};
