import {useCallback, useEffect, useRef} from 'react';
import {
  Keyboard,
  type LayoutChangeEvent,
  type ScrollViewInstance,
  type ViewInstance,
} from 'react-native';

/**
 * Keeps the focused field of a form clear of the soft keyboard.
 *
 * WHY THIS IS NEEDED AT ALL
 *
 * `adjustResize` in the manifest does not do what its name suggests
 * on a modern Android: edge-to-edge is enforced from Android 15
 * onwards, and under it the app window is never resized for the
 * keyboard. The keyboard is a separate window that floats over the
 * app. So the form has to move out of the way itself — which is what
 * the `KeyboardAvoidingView` in `AppScreen` does — and the field the
 * user is typing into has to be scrolled into the space that is left.
 *
 * React Native used to offer `scrollToFocusedInput` on the ScrollView
 * for exactly that, but it was removed: it only ever worked on iOS,
 * and the modern scroll-to-the-focused-child behaviour lives in the
 * native view, where it runs when the child asks for focus. On
 * Android that ask happens when the user taps the field — BEFORE the
 * keyboard has appeared and before the viewport has shortened — so
 * the native scroll has nothing to do, and the field is left under
 * the keyboard once the viewport shrinks.
 *
 * So the scroll is done here instead: the viewport's height is
 * watched, and when it changes while the keyboard is up, the focused
 * field is measured against the scroll content and scrolled into
 * view.
 *
 * HOW A SCREEN USES IT
 *
 *   const {scrollRef, onViewportLayout, field} = useKeyboardAwareForm();
 *
 *   <ScrollView ref={scrollRef} onLayout={onViewportLayout}>
 *     <AppTextInput {...field('email')} ... />
 *
 * `field(key)` hands back the two props a field needs: a ref to the
 * native text field and an `onFocus` that records which field is the
 * live one. The same object is returned every time for a given key,
 * so React does not detach and re-attach the ref on every render.
 */
export interface KeyboardAwareForm {
  /** Ref for the form's ScrollView. */
  scrollRef: React.RefObject<ScrollViewInstance | null>;
  /** `onLayout` for the form's ScrollView. */
  onViewportLayout: (event: LayoutChangeEvent) => void;
  /**
   * The props a field needs: a ref to its native text field and an
   * `onFocus` that records it as the focused one.
   */
  field: (key: string) => KeyboardAwareField;
}

/** The props `field()` hands back for one field. */
export interface KeyboardAwareField {
  /** Ref for the field's white input box. */
  fieldRef: (node: ViewInstance | null) => void;
  /** Focus handler that records this field as the focused one. */
  onFocus: () => void;
}

/**
 * The breathing room left between the focused field and the keyboard.
 *
 * It is the same `spacing.md` the form uses between its fields, so
 * the focused field ends up the same distance from the keyboard as
 * two fields are from each other.
 */
const FIELD_GAP = 16;

export const useKeyboardAwareForm = (): KeyboardAwareForm => {
  const scrollRef = useRef<ScrollViewInstance>(null);

  /** The white box of every field, by key. */
  const inputs = useRef(new Map<string, ViewInstance>());

  /** The key of the field that currently has focus. */
  const focusedKey = useRef<string | null>(null);

  /** The height of the scroll viewport, in layout pixels. */
  const viewportHeight = useRef(0);

  /** Whether the soft keyboard is on screen. */
  const keyboardVisible = useRef(false);

  /**
   * Scroll the focused field into the viewport.
   *
   * The field is measured against the scroll CONTENT rather than the
   * window, so the number that comes back is the field's offset in
   * the scrollable content — which is exactly the number `scrollTo`
   * wants. Scrolling to `fieldBottom − viewportHeight` puts the
   * bottom of the field on the bottom of the viewport, with the gap
   * above it.
   */
  const scrollFocusedIntoView = useCallback(() => {
    const scrollView = scrollRef.current;
    const key = focusedKey.current;

    if (!scrollView || !key) {
      return;
    }

    const input = inputs.current.get(key);
    if (!input) {
      return;
    }

    const viewport = viewportHeight.current;

    if (!viewport) {
      return;
    }

    /*
     * The field is measured against the SCROLL VIEW, not against the
     * content view.
     *
     * `getInnerViewNode()` hands back a raw node handle, and
     * `measureLayout` refuses anything that is not a host-component
     * ref — it logs a warning and returns without measuring anything.
     * The ScrollView itself is a host component and it IS an ancestor
     * of the field, so it is the one to measure against.
     *
     * What comes back is the field's offset in the scroll CONTENT,
     * because that is what the layout tree knows: the scroll offset
     * is applied by the native scroll view at paint time and is not
     * part of the layout. So the number is exactly what `scrollTo`
     * wants.
     */
    input.measureLayout(
      scrollView,
      (_x, y, _width, height) => {
        const target = Math.max(0, y + height - viewport + FIELD_GAP);
        scrollView.scrollTo({y: target, animated: true});
      },
      () => {
        /*
         * The measurement failed — the field is not laid out yet, or
         * the scroll view is not its ancestor. Nothing to do: the
         * viewport is already clear of the keyboard, so the field is
         * at worst half-covered rather than unreachable.
         */
      },
    );
  }, []);

  /**
   * Watch the viewport.
   *
   * The viewport only changes height when the keyboard arrives or
   * leaves, because `AppScreen` shortens the content for it. So a
   * layout pass while the keyboard is up means the space under the
   * focused field just got smaller — and the field has to be moved
   * back into it.
   */
  const onViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewportHeight.current = event.nativeEvent.layout.height;

      if (keyboardVisible.current) {
        scrollFocusedIntoView();
      }
    },
    [scrollFocusedIntoView],
  );

  /**
   * The field registry.
   *
   * The props for a key are built once and then reused, so the ref
   * callback keeps the same identity across renders. A ref callback
   * whose identity changes is called with `null` and then with the
   * node again on every render, which would tear the measurement
   * down and set it up again for nothing.
   */
  const fields = useRef(new Map<string, KeyboardAwareField>());

  const field = useCallback((key: string): KeyboardAwareField => {
    const existing = fields.current.get(key);
    if (existing) {
      return existing;
    }

    const created: KeyboardAwareField = {
      fieldRef: (node: ViewInstance | null) => {
        if (node) {
          inputs.current.set(key, node);
        } else {
          inputs.current.delete(key);
        }
      },
      onFocus: () => {
        focusedKey.current = key;

        /*
         * If the keyboard is ALREADY up — the user tapped a second
         * field without dismissing the first — the viewport has not
         * changed, so nothing will trigger a layout pass. Scroll the
         * new field into view by hand, after the focus has landed so
         * that the measurement is taken against the settled layout.
         */
        if (keyboardVisible.current) {
          requestAnimationFrame(scrollFocusedIntoView);
        }
      },
    };

    fields.current.set(key, created);
    return created;
  }, [scrollFocusedIntoView]);

  /**
   * Track the keyboard.
   *
   * The keyboard's own events are the only reliable signal that it is
   * up: on Android the app window is not resized, so the viewport
   * shrinking is the shell reacting to these events, not the window
   * changing underneath.
   */
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      keyboardVisible.current = true;
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardVisible.current = false;
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return {scrollRef, onViewportLayout, field};
};
