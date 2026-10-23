import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import Animated, {type SharedValue} from 'react-native-reanimated';

import {colors, radius, spacing} from '../../../theme';
import {STRINGS} from '../../../constants';
import {AppText} from '../../core/AppText';
import {ModeTabs} from '../../layout/ModeTabs';
import {TurnByTurnList} from '../../layout/TurnByTurnList';
import {useSheetLayout} from '../../../hooks/useSheetLayout';
import type {Place, RouteLeg, RouteSummary, TravelMode} from '../../../types';

/**
 * The route summary sheet that slides up over the map.
 *
 * Everything in here comes from the Figma "Route view" frame:
 *
 *   • a grab handle
 *   • "Fastest route" over the big duration, with the distance and
 *     the arrival time right-aligned on the same line
 *   • the Drive / Ride / Walk tabs
 *   • a muted card that repeats the two ends of the trip on a rail,
 *     the same rail the location card uses
 *   • the "Turn by turn" list
 *
 * THE SHEET'S HEIGHT IS THE VISIBLE HEIGHT
 *
 * The sheet is a snap-point sheet with three stops: collapsed onto the
 * map, the Figma's own resting height, and dragged up to read the
 * whole list. A snap-point sheet does not resize its content when it
 * moves — the content is laid out against the tallest stop and the
 * sheet slides up inside it — so laying this content out normally
 * would push everything at the bottom of it off the screen at the
 * shorter stops.
 *
 * So the content is laid out against `visibleHeight`, the part of the
 * sheet that is really on screen, which `useSheetLayout` reads from
 * the sheet's live position. That is what keeps the bottom of the
 * sheet's content on the bottom of the screen at every stop.
 *
 * WHAT SCROLLS AND WHAT DOES NOT
 *
 * Only the turn-by-turn rows scroll. The summary and the mode tabs
 * stay put, so the numbers never scroll away. The list is a
 * `BottomSheetFlatList`, the gesture-handler-aware list: it hands the
 * scroll back to the sheet when it is at the top, which is what lets
 * a swipe on the rows drag the sheet up to its expanded stop.
 *
 * THE ROUTE DETAIL FADES AWAY
 *
 * At the lowest stop the sheet is collapsed onto the map, and the
 * turn-by-turn list is the one thing that gets out of the way: it is
 * the longest block and the least useful at a glance, and at that
 * stop the map is the point. The mode tabs and the two ends of the
 * trip stay, because they are the route's headline facts.
 *
 * `detailProgress` fades that one block out as the sheet is dragged
 * down to the lowest stop.
 *
 * THE SHEET'S OWN CHROME
 *
 * The white surface, the rounded top and the grab handle belong to
 * the `BottomSheet` that wraps this, so this component is only the
 * content. So is the "Start navigation" button: it is pinned to the
 * bottom of the screen by the route screen, outside the sheet, so
 * that it is on screen at every stop.
 */
export interface RouteSummarySheetProps {
  /** The headline numbers for the active travel mode. */
  summary: RouteSummary;
  /** The travel modes offered by the tabs. */
  modes: {key: TravelMode; label: string}[];
  /** The active travel mode. */
  mode: TravelMode;
  /** Called when a mode tab is pressed. */
  onModeChange: (mode: TravelMode) => void;
  /** The trip's origin. */
  pickup: Place | null;
  /** The trip's destination. */
  dropoff: Place | null;
  /**
   * The space at the bottom of the screen that the "Start navigation"
   * panel owns.
   *
   * The sheet's content is laid out above that panel rather than
   * under it, so the panel never covers the last row of the
   * turn-by-turn list and the two ends of the trip stay readable at
   * the shortest stop.
   */
  reservedBottom?: number;
  /**
   * Where the sheet's top edge is.
   *
   * The map is a sibling of the sheet rather than a child, so it
   * cannot read the sheet's position for itself; the route screen
   * owns this shared value and the sheet writes into it.
   */
  sheetTop?: SharedValue<number>;
}

export const RouteSummarySheet: React.FC<RouteSummarySheetProps> = ({
  summary,
  modes,
  mode,
  onModeChange,
  pickup,
  dropoff,
  reservedBottom = 0,
  sheetTop,
}) => {
  const renderLeg = useCallback(
    ({item}: {item: RouteLeg}) => <TurnByTurnList legs={[item]} />,
    [],
  );

  const {contentStyle, detailStyle, isDetailVisible} = useSheetLayout(
    sheetTop,
    reservedBottom,
  );

  return (
    /*
      The content is sized against the visible part of the sheet, not
      against the tallest stop, so that the bottom of the content
      always lands on the bottom of the screen. See the note above.
    */
    <Animated.View style={[styles.content, contentStyle]}>
      {/* ── Duration + distance ── */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <AppText variant="eyebrowLarge" tone="tertiary">
            {STRINGS.route.fastestRoute}
          </AppText>
          <AppText variant="metric">{summary.duration}</AppText>
        </View>

        <View style={styles.summaryRight}>
          <AppText variant="meta" tone="secondary">
            {summary.distance}
          </AppText>
          <AppText variant="meta" tone="tertiary" style={styles.separator}>
            ·
          </AppText>
          <AppText variant="meta" tone="secondary">
            arrive
          </AppText>
          <AppText variant="meta" tone="tertiary" style={styles.arrival}>
            {summary.arrival.replace('arrive ', '')}
          </AppText>
        </View>
      </View>

      {/*
        The mode tabs and the two ends of the trip stay on screen at
        every stop: they are the route's headline facts, and a sheet
        collapsed onto the map should still say where the trip goes.
      */}
      <View style={styles.tabs}>
        <ModeTabs modes={modes} active={mode} onChange={onModeChange} />
      </View>

      <View style={styles.endpointsCard}>
        <View style={styles.endpointsRail} pointerEvents="none">
          <View style={styles.endpointsDotOrigin} />
          <View style={styles.endpointsConnector} />
          <View style={styles.endpointsDotDestination} />
        </View>

        <View style={styles.endpointsText}>
          <AppText variant="label" numberOfLines={1}>
            {pickup
              ? `${pickup.name} · ${pickup.address.split(',')[0]}`
              : 'Pickup'}
          </AppText>
          <AppText variant="label" numberOfLines={1} style={styles.endpointsGap}>
            {dropoff
              ? `${dropoff.name} · ${dropoff.address.split(',')[0]}`
              : 'Drop-off'}
          </AppText>
        </View>
      </View>

      {/*
        The turn-by-turn list is the one thing that is hidden when the
        sheet is collapsed onto the map. It is the longest block and
        the least useful at a glance, and at the collapsed stop the
        map is the point.

        The whole block fades rather than collapsing, so the sheet's
        layout does not jump as it is dragged.
      */}
      <Animated.View
        style={[styles.listBlock, detailStyle]}
        pointerEvents={isDetailVisible ? 'auto' : 'none'}>
        <AppText
          variant="eyebrowLarge"
          tone="tertiary"
          style={styles.turnByTurnLabel}>
          {STRINGS.route.turnByTurn}
        </AppText>

        {/*
          The only scrollable part of the sheet. `BottomSheetFlatList`
          is the gesture-handler-aware list: it hands the scroll back
          to the sheet when it is at the top, which is what lets a
          swipe on the rows drag the sheet up to its expanded stop.
        */}
        <BottomSheetFlatList
          data={summary.legs}
          keyExtractor={leg => leg.id}
          renderItem={renderLeg}
          ItemSeparatorComponent={LegDivider}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            /*
             * The list stops above the "Start navigation" panel, so
             * it only needs the design's own bottom padding here —
             * the panel's height is already taken out of the sheet's
             * content, not out of the list.
             */
            {paddingBottom: spacing.xl},
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

/**
 * The hairline between two turn-by-turn rows.
 *
 * In the Figma the divider is the top border of every list item after
 * the first — `1px 0px 0px` in `#E6EBEF`, spanning the full row width
 * including the manoeuvre glyph's column.
 */
const LegDivider: React.FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  /**
   * The content fills the visible part of the sheet.
   *
   * There is no `flex` here on purpose: the height comes from the
   * sheet's live position, and a flex basis would fight it.
   */
  content: {
    flexDirection: 'column',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 26,
  },
  separator: {
    marginHorizontal: spacing.xs,
  },
  arrival: {
    marginLeft: spacing.xs,
  },
  /**
   * The turn-by-turn block.
   *
   * It takes the space left over by the summary, the mode tabs and
   * the card, and the list inside it takes the space left over by its
   * own label, so the rows fill the sheet exactly.
   */
  listBlock: {
    flex: 1,
    overflow: 'hidden',
  },
  tabs: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  endpointsCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.background.canvas,
  },
  endpointsRail: {
    width: 10,
    alignItems: 'center',
  },
  endpointsDotOrigin: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
    marginTop: 6,
  },
  endpointsConnector: {
    width: 2,
    height: 21,
    marginTop: 4,
    backgroundColor: colors.overlay.dashedConnector,
  },
  endpointsDotDestination: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.marker.destination,
    marginTop: 4,
  },
  endpointsText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  /**
   * The 10 px gap between the two lines of the card.
   *
   * The Figma's text container ("Container" #1:389) is 55 px tall and
   * holds two 22.5 px lines: the first at y=0 and the second at
   * y=32.5. The gap between them is therefore 32.5 − 22.5 = 10 px.
   *
   * Without it the two lines sit on their own 22.5 px line boxes and
   * the block is only 45 px tall, which pulls the second line up
   * towards the first one and leaves the destination square on the
   * rail hanging below the "Home" text instead of level with the
   * bottom of it — the rail's square is meant to sit on the same
   * line as the end of the destination label (Figma node #1:388 at
   * y=45 inside a 55 px rail container).
   */
  endpointsGap: {
    marginTop: 10,
  },
  turnByTurnLabel: {
    marginTop: spacing.xxl,
    marginHorizontal: spacing.xl,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },
});
