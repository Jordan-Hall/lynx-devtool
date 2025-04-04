/*
 * Copyright (C) 2010 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Copyright 2025 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/* eslint-disable rulesdir/no_underscored_properties */

import type * as Common from '../../core/common/common.js'; // eslint-disable-line no-unused-vars
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as IconButton from '../components/icon_button/icon_button.js';

import * as ARIAUtils from './ARIAUtils.js';
import {ContextMenu} from './ContextMenu.js';
import {Constraints, Size} from './Geometry.js';
import {Icon} from './Icon.js';
import {Toolbar} from './Toolbar.js';
import {Tooltip} from './Tooltip.js';
import {installDragHandle, invokeOnceAfterBatchUpdate} from './UIUtils.js';
import type {Widget} from './Widget.js';
import {VBox} from './Widget.js';  // eslint-disable-line no-unused-vars
import {Events as ZoomManagerEvents, ZoomManager} from './ZoomManager.js';

const UIStrings = {
  /**
  *@description The aria label for the button to open more tabs at the right tabbed pane in Elements tools
  */
  moreTabs: 'More tabs',
  /**
  *@description Text in Tabbed Pane
  *@example {tab} PH1
  */
  closeS: 'Close {PH1}',
  /**
  *@description Text to close something
  */
  close: 'Close',
  /**
  *@description Text on a menu option to close other drawers when right click on a drawer title
  */
  closeOthers: 'Close others',
  /**
  *@description Text on a menu option to close the drawer to the right when right click on a drawer title
  */
  closeTabsToTheRight: 'Close tabs to the right',
  /**
  *@description Text on a menu option to close all the drawers except Console when right click on a drawer title
  */
  closeAll: 'Close all',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/TabbedPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TabbedPane extends VBox {
  _headerElement: HTMLElement;
  _headerContentsElement: HTMLElement;
  _tabSlider: HTMLDivElement;
  _tabsElement: HTMLElement;
  _contentElement: HTMLElement;
  _tabs: TabbedPaneTab[];
  _tabsHistory: TabbedPaneTab[];
  _tabsById: Map<string, TabbedPaneTab>;
  _currentTabLocked: boolean;
  _autoSelectFirstItemOnShow: boolean;
  _triggerDropDownTimeout: number|null;
  _dropDownButton: HTMLDivElement;
  _currentDevicePixelRatio: number;
  _shrinkableTabs?: boolean;
  _verticalTabLayout?: boolean;
  _closeableTabs?: boolean;
  _delegate?: TabbedPaneTabDelegate;
  _currentTab?: TabbedPaneTab;
  _sliderEnabled?: boolean;
  _placeholderElement?: Element;
  _focusedPlaceholderElement?: Element;
  _placeholderContainerElement?: HTMLElement;
  _lastSelectedOverflowTab?: TabbedPaneTab;
  _overflowDisabled?: boolean;
  _measuredDropDownButtonWidth?: number;
  _leftToolbar?: Toolbar;
  _rightToolbar?: Toolbar;
  _allowTabReorder?: boolean;
  _automaticReorder?: boolean;

  constructor() {
    super(true);
    this.registerRequiredCSS('ui/legacy/tabbedPane.css');
    this.element.classList.add('tabbed-pane');
    this.contentElement.classList.add('tabbed-pane-shadow');
    this.contentElement.tabIndex = -1;
    this.setDefaultFocusedElement(this.contentElement);
    this._headerElement = this.contentElement.createChild('div', 'tabbed-pane-header');
    this._headerContentsElement = this._headerElement.createChild('div', 'tabbed-pane-header-contents');
    this._tabSlider = document.createElement('div');
    this._tabSlider.classList.add('tabbed-pane-tab-slider');
    this._tabsElement = this._headerContentsElement.createChild('div', 'tabbed-pane-header-tabs');
    this._tabsElement.setAttribute('role', 'tablist');
    this._tabsElement.addEventListener('keydown', this._keyDown.bind(this), false);
    this._contentElement = this.contentElement.createChild('div', 'tabbed-pane-content');
    this._contentElement.createChild('slot');
    this._tabs = [];
    this._tabsHistory = [];
    this._tabsById = new Map();
    this._currentTabLocked = false;
    this._autoSelectFirstItemOnShow = true;

    this._triggerDropDownTimeout = null;
    this._dropDownButton = this._createDropDownButton();
    this._currentDevicePixelRatio = window.devicePixelRatio;
    ZoomManager.instance().addEventListener(ZoomManagerEvents.ZoomChanged, this._zoomChanged, this);
    this.makeTabSlider();
  }

  setAccessibleName(name: string): void {
    ARIAUtils.setAccessibleName(this._tabsElement, name);
  }

  setCurrentTabLocked(locked: boolean): void {
    this._currentTabLocked = locked;
    this._headerElement.classList.toggle('locked', this._currentTabLocked);
  }

  setAutoSelectFirstItemOnShow(autoSelect: boolean): void {
    this._autoSelectFirstItemOnShow = autoSelect;
  }

  get visibleView(): Widget|null {
    return this._currentTab ? this._currentTab.view : null;
  }

  tabIds(): string[] {
    return this._tabs.map(tab => tab._id);
  }

  tabIndex(tabId: string): number {
    return this._tabs.findIndex(tab => tab.id === tabId);
  }

  tabViews(): Widget[] {
    return this._tabs.map(tab => tab.view);
  }

  tabView(tabId: string): Widget|null {
    const tab = this._tabsById.get(tabId);
    return tab ? tab.view : null;
  }

  get selectedTabId(): string|null {
    return this._currentTab ? this._currentTab.id : null;
  }

  setShrinkableTabs(shrinkableTabs: boolean): void {
    this._shrinkableTabs = shrinkableTabs;
  }

  makeVerticalTabLayout(): void {
    this._verticalTabLayout = true;
    this._setTabSlider(false);
    this.contentElement.classList.add('vertical-tab-layout');
    this.invalidateConstraints();
  }

  setCloseableTabs(closeableTabs: boolean): void {
    this._closeableTabs = closeableTabs;
  }

  focus(): void {
    if (this.visibleView) {
      this.visibleView.focus();
    } else {
      this.contentElement.focus();
    }
  }

  focusSelectedTabHeader(): void {
    const selectedTab = this._currentTab;
    if (selectedTab) {
      selectedTab.tabElement.focus();
    }
  }

  headerElement(): Element {
    return this._headerElement;
  }

  isTabCloseable(id: string): boolean {
    const tab = this._tabsById.get(id);
    return tab ? tab.isCloseable() : false;
  }

  setTabDelegate(delegate: TabbedPaneTabDelegate): void {
    const tabs = this._tabs.slice();
    for (let i = 0; i < tabs.length; ++i) {
      tabs[i].setDelegate(delegate);
    }
    this._delegate = delegate;
  }

  appendTab(
      id: string, tabTitle: string, view: Widget, tabTooltip?: string, userGesture?: boolean, isCloseable?: boolean,
      index?: number): void {
    // Display tabs on demand, match according to title, case-sensitive
    const urlParams = new URLSearchParams(location.search);
    const showPanels = urlParams.get('showPanels');
    // TODO: tabTitle is i18n string, but showPanels contains raw string
    if (showPanels && showPanels !== 'undefined' && !showPanels.split(',')?.includes(tabTitle)) {
      return;
    }
    const closeable = typeof isCloseable === 'boolean' ? isCloseable : Boolean(this._closeableTabs);
    const tab = new TabbedPaneTab(this, id, tabTitle, closeable, view, tabTooltip);
    tab.setDelegate((this._delegate as TabbedPaneTabDelegate));
    console.assert(!this._tabsById.has(id), `Tabbed pane already contains a tab with id '${id}'`);
    this._tabsById.set(id, tab);
    if (index !== undefined) {
      this._tabs.splice(index, 0, tab);
    } else {
      this._tabs.push(tab);
    }
    this._tabsHistory.push(tab);
    if (this._tabsHistory[0] === tab && this.isShowing()) {
      this.selectTab(tab.id, userGesture);
    }
    this._updateTabElements();
  }

  closeTab(id: string, userGesture?: boolean): void {
    this.closeTabs([id], userGesture);
  }

  closeTabs(ids: string[], userGesture?: boolean): void {
    const focused = this.hasFocus();
    for (let i = 0; i < ids.length; ++i) {
      this._innerCloseTab(ids[i], userGesture);
    }
    this._updateTabElements();
    if (this._tabsHistory.length) {
      this.selectTab(this._tabsHistory[0].id, false);
    }
    if (focused) {
      this.focus();
    }
  }

  _innerCloseTab(id: string, userGesture?: boolean): true|undefined {
    const tab = this._tabsById.get(id);
    if (!tab) {
      return;
    }
    if (userGesture && !tab._closeable) {
      return;
    }
    if (this._currentTab && this._currentTab.id === id) {
      this._hideCurrentTab();
    }

    this._tabsById.delete(id);

    this._tabsHistory.splice(this._tabsHistory.indexOf(tab), 1);
    this._tabs.splice(this._tabs.indexOf(tab), 1);
    if (tab._shown) {
      this._hideTabElement(tab);
    }

    const eventData: EventData = {prevTabId: undefined, tabId: id, view: tab.view, isUserGesture: userGesture};
    this.dispatchEventToListeners(Events.TabClosed, eventData);
    return true;
  }

  hasTab(tabId: string): boolean {
    return this._tabsById.has(tabId);
  }

  otherTabs(id: string): string[] {
    const result = [];
    for (let i = 0; i < this._tabs.length; ++i) {
      if (this._tabs[i].id !== id) {
        result.push(this._tabs[i].id);
      }
    }
    return result;
  }

  _tabsToTheRight(id: string): string[] {
    let index = -1;
    for (let i = 0; i < this._tabs.length; ++i) {
      if (this._tabs[i].id === id) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      return [];
    }
    return this._tabs.slice(index + 1).map(function(tab) {
      return tab.id;
    });
  }

  _viewHasFocus(): boolean {
    if (this.visibleView && this.visibleView.hasFocus()) {
      return true;
    }
    const root = this.contentElement.getComponentRoot();
    return root instanceof Document && this.contentElement === root.activeElement;
  }

  selectTab(id: string, userGesture?: boolean, forceFocus?: boolean): boolean {
    if (this._currentTabLocked) {
      return false;
    }
    const focused = this._viewHasFocus();
    const tab = this._tabsById.get(id);
    if (!tab) {
      return false;
    }

    const eventData: EventData = {
      prevTabId: this._currentTab ? this._currentTab.id : undefined,
      tabId: id,
      view: tab.view,
      isUserGesture: userGesture,
    };
    this.dispatchEventToListeners(Events.TabInvoked, eventData);
    if (this._currentTab && this._currentTab.id === id) {
      return true;
    }

    this.suspendInvalidations();
    this._hideCurrentTab();
    this._showTab(tab);
    this.resumeInvalidations();
    this._currentTab = tab;

    this._tabsHistory.splice(this._tabsHistory.indexOf(tab), 1);
    this._tabsHistory.splice(0, 0, tab);

    this._updateTabElements();
    if (focused || forceFocus) {
      this.focus();
    }

    this.dispatchEventToListeners(Events.TabSelected, eventData);
    return true;
  }

  selectNextTab(): void {
    const index = this._tabs.indexOf((this._currentTab as TabbedPaneTab));
    const nextIndex = Platform.NumberUtilities.mod(index + 1, this._tabs.length);
    this.selectTab(this._tabs[nextIndex].id, true);
  }

  selectPrevTab(): void {
    const index = this._tabs.indexOf((this._currentTab as TabbedPaneTab));
    const nextIndex = Platform.NumberUtilities.mod(index - 1, this._tabs.length);
    this.selectTab(this._tabs[nextIndex].id, true);
  }

  lastOpenedTabIds(tabsCount: number): string[] {
    function tabToTabId(tab: TabbedPaneTab): string {
      return tab.id;
    }

    return this._tabsHistory.slice(0, tabsCount).map(tabToTabId);
  }

  setTabIcon(id: string, icon: Icon|null): void {
    const tab = this._tabsById.get(id);
    if (!tab) {
      return;
    }
    tab._setIcon(icon);
    this._updateTabElements();
  }

  setTabEnabled(id: string, enabled: boolean): void {
    const tab = this._tabsById.get(id);
    if (tab) {
      tab.tabElement.classList.toggle('disabled', !enabled);
    }
  }

  toggleTabClass(id: string, className: string, force?: boolean): void {
    const tab = this._tabsById.get(id);
    if (tab && tab._toggleClass(className, force)) {
      this._updateTabElements();
    }
  }

  _zoomChanged(_event: Common.EventTarget.EventTargetEvent): void {
    this._clearMeasuredWidths();
    if (this.isShowing()) {
      this._updateTabElements();
    }
  }

  _clearMeasuredWidths(): void {
    for (let i = 0; i < this._tabs.length; ++i) {
      delete this._tabs[i]._measuredWidth;
    }
  }

  changeTabTitle(id: string, tabTitle: string, tabTooltip?: string): void {
    const tab = this._tabsById.get(id);
    if (tab && tabTooltip !== undefined) {
      tab.tooltip = tabTooltip;
    }
    if (tab && tab.title !== tabTitle) {
      tab.title = tabTitle;
      ARIAUtils.setAccessibleName(tab.tabElement, tabTitle);
      this._updateTabElements();
    }
  }

  changeTabView(id: string, view: Widget): void {
    const tab = this._tabsById.get(id);
    if (!tab || tab.view === view) {
      return;
    }

    this.suspendInvalidations();
    const isSelected = this._currentTab && this._currentTab.id === id;
    const shouldFocus = tab.view.hasFocus();
    if (isSelected) {
      this._hideTab(tab);
    }
    tab.view = view;
    if (isSelected) {
      this._showTab(tab);
    }
    if (shouldFocus) {
      tab.view.focus();
    }
    this.resumeInvalidations();
  }

  onResize(): void {
    if (this._currentDevicePixelRatio !== window.devicePixelRatio) {
      // Force recalculation of all tab widths on a DPI change
      this._clearMeasuredWidths();
      this._currentDevicePixelRatio = window.devicePixelRatio;
    }
    this._updateTabElements();
  }

  headerResized(): void {
    this._updateTabElements();
  }

  wasShown(): void {
    const effectiveTab = this._currentTab || this._tabsHistory[0];
    if (effectiveTab && this._autoSelectFirstItemOnShow) {
      this.selectTab(effectiveTab.id);
    }
  }

  makeTabSlider(): void {
    if (this._verticalTabLayout) {
      return;
    }
    this._setTabSlider(true);
  }

  _setTabSlider(enable: boolean): void {
    this._sliderEnabled = enable;
    this._tabSlider.classList.toggle('enabled', enable);
  }

  calculateConstraints(): Constraints {
    let constraints = super.calculateConstraints();
    const minContentConstraints = new Constraints(new Size(0, 0), new Size(50, 50));
    constraints = constraints.widthToMax(minContentConstraints).heightToMax(minContentConstraints);
    if (this._verticalTabLayout) {
      constraints = constraints.addWidth(new Constraints(new Size(120, 0)));
    } else {
      constraints = constraints.addHeight(new Constraints(new Size(0, 30)));
    }
    return constraints;
  }

  _updateTabElements(): void {
    invokeOnceAfterBatchUpdate(this, this._innerUpdateTabElements);
  }

  setPlaceholderElement(element: Element, focusedElement?: Element): void {
    this._placeholderElement = element;
    if (focusedElement) {
      this._focusedPlaceholderElement = focusedElement;
    }
    if (this._placeholderContainerElement) {
      this._placeholderContainerElement.removeChildren();
      this._placeholderContainerElement.appendChild(element);
    }
  }

  async waitForTabElementUpdate(): Promise<void> {
    this._innerUpdateTabElements();
  }

  _innerUpdateTabElements(): void {
    if (!this.isShowing()) {
      return;
    }

    if (!this._tabs.length) {
      this._contentElement.classList.add('has-no-tabs');
      if (this._placeholderElement && !this._placeholderContainerElement) {
        this._placeholderContainerElement = this._contentElement.createChild('div', 'tabbed-pane-placeholder fill');
        this._placeholderContainerElement.appendChild(this._placeholderElement);
        if (this._focusedPlaceholderElement) {
          this.setDefaultFocusedElement(this._focusedPlaceholderElement);
        }
      }
    } else {
      this._contentElement.classList.remove('has-no-tabs');
      if (this._placeholderContainerElement) {
        this._placeholderContainerElement.remove();
        this.setDefaultFocusedElement(this.contentElement);
        delete this._placeholderContainerElement;
      }
    }

    this._measureDropDownButton();
    this._updateWidths();
    this._updateTabsDropDown();
    this._updateTabSlider();
  }

  _showTabElement(index: number, tab: TabbedPaneTab): void {
    if (index >= this._tabsElement.children.length) {
      this._tabsElement.appendChild(tab.tabElement);
    } else {
      this._tabsElement.insertBefore(tab.tabElement, this._tabsElement.children[index]);
    }
    tab._shown = true;
  }

  _hideTabElement(tab: TabbedPaneTab): void {
    this._tabsElement.removeChild(tab.tabElement);
    tab._shown = false;
  }

  _createDropDownButton(): HTMLDivElement {
    const dropDownContainer = document.createElement('div');
    dropDownContainer.classList.add('tabbed-pane-header-tabs-drop-down-container');
    const chevronIcon = Icon.create('largeicon-chevron', 'chevron-icon');
    ARIAUtils.markAsMenuButton(dropDownContainer);
    ARIAUtils.setAccessibleName(dropDownContainer, i18nString(UIStrings.moreTabs));
    dropDownContainer.tabIndex = 0;
    dropDownContainer.appendChild(chevronIcon);
    dropDownContainer.addEventListener('click', this._dropDownClicked.bind(this));
    dropDownContainer.addEventListener('keydown', this._dropDownKeydown.bind(this));
    dropDownContainer.addEventListener('mousedown', event => {
      if (event.which !== 1 || this._triggerDropDownTimeout) {
        return;
      }
      this._triggerDropDownTimeout = window.setTimeout(this._dropDownClicked.bind(this, event), 200);
    });
    return dropDownContainer;
  }

  _dropDownClicked(ev: Event): void {
    const event = (ev as MouseEvent);
    if (event.which !== 1) {
      return;
    }
    if (this._triggerDropDownTimeout) {
      clearTimeout(this._triggerDropDownTimeout);
      this._triggerDropDownTimeout = null;
    }
    const rect = this._dropDownButton.getBoundingClientRect();
    const menu = new ContextMenu(event, false, rect.left, rect.bottom);
    for (const tab of this._tabs) {
      if (tab._shown) {
        continue;
      }
      if (this._numberOfTabsShown() === 0 && this._tabsHistory[0] === tab) {
        menu.defaultSection().appendCheckboxItem(
            tab.title, this._dropDownMenuItemSelected.bind(this, tab), /* checked */ true);
      } else {
        menu.defaultSection().appendItem(tab.title, this._dropDownMenuItemSelected.bind(this, tab));
      }
    }
    menu.show();
  }

  _dropDownKeydown(event: Event): void {
    if (isEnterOrSpaceKey(event)) {
      this._dropDownButton.click();
      event.consume(true);
    }
  }

  _dropDownMenuItemSelected(tab: TabbedPaneTab): void {
    this._lastSelectedOverflowTab = tab;
    this.selectTab(tab.id, true, true);
  }

  _totalWidth(): number {
    return this._headerContentsElement.getBoundingClientRect().width;
  }

  _numberOfTabsShown(): number {
    let numTabsShown = 0;
    for (const tab of this._tabs) {
      if (tab._shown) {
        numTabsShown++;
      }
    }
    return numTabsShown;
  }

  disableOverflowMenu(): void {
    this._overflowDisabled = true;
  }

  _updateTabsDropDown(): void {
    const tabsToShowIndexes = this._tabsToShowIndexes(
        this._tabs, this._tabsHistory, this._totalWidth(), this._measuredDropDownButtonWidth || 0);
    if (this._lastSelectedOverflowTab && this._numberOfTabsShown() !== tabsToShowIndexes.length) {
      delete this._lastSelectedOverflowTab;
      this._updateTabsDropDown();
      return;
    }

    for (let i = 0; i < this._tabs.length; ++i) {
      if (this._tabs[i]._shown && tabsToShowIndexes.indexOf(i) === -1) {
        this._hideTabElement(this._tabs[i]);
      }
    }
    for (let i = 0; i < tabsToShowIndexes.length; ++i) {
      const tab = this._tabs[tabsToShowIndexes[i]];
      if (!tab._shown) {
        this._showTabElement(i, tab);
      }
    }

    if (!this._overflowDisabled) {
      this._maybeShowDropDown(tabsToShowIndexes.length !== this._tabs.length);
    }
  }

  _maybeShowDropDown(hasMoreTabs: boolean): void {
    if (hasMoreTabs && !this._dropDownButton.parentElement) {
      this._headerContentsElement.appendChild(this._dropDownButton);
    } else if (!hasMoreTabs && this._dropDownButton.parentElement) {
      this._headerContentsElement.removeChild(this._dropDownButton);
    }
  }

  _measureDropDownButton(): void {
    if (this._overflowDisabled || this._measuredDropDownButtonWidth) {
      return;
    }
    this._dropDownButton.classList.add('measuring');
    this._headerContentsElement.appendChild(this._dropDownButton);
    this._measuredDropDownButtonWidth = this._dropDownButton.getBoundingClientRect().width;
    this._headerContentsElement.removeChild(this._dropDownButton);
    this._dropDownButton.classList.remove('measuring');
  }

  _updateWidths(): void {
    const measuredWidths = this._measureWidths();
    const maxWidth =
        this._shrinkableTabs ? this._calculateMaxWidth(measuredWidths.slice(), this._totalWidth()) : Number.MAX_VALUE;

    let i = 0;
    for (const tab of this._tabs) {
      tab.setWidth(this._verticalTabLayout ? -1 : Math.min(maxWidth, measuredWidths[i++]));
    }
  }

  _measureWidths(): number[] {
    // Add all elements to measure into this._tabsElement
    this._tabsElement.style.setProperty('width', '2000px');
    const measuringTabElements = new Map<HTMLElement, TabbedPaneTab>();
    for (const tab of this._tabs) {
      if (typeof tab._measuredWidth === 'number') {
        continue;
      }
      const measuringTabElement = tab._createTabElement(true);
      measuringTabElements.set(measuringTabElement, tab);
      this._tabsElement.appendChild(measuringTabElement);
    }

    // Perform measurement
    for (const [measuringTabElement, tab] of measuringTabElements) {
      const width = measuringTabElement.getBoundingClientRect().width;
      tab._measuredWidth = Math.ceil(width);
    }

    // Nuke elements from the UI
    for (const measuringTabElement of measuringTabElements.keys()) {
      measuringTabElement.remove();
    }

    // Combine the results.
    const measuredWidths = [];
    for (const tab of this._tabs) {
      measuredWidths.push(tab._measuredWidth || 0);
    }
    this._tabsElement.style.removeProperty('width');

    return measuredWidths;
  }

  _calculateMaxWidth(measuredWidths: number[], totalWidth: number): number {
    if (!measuredWidths.length) {
      return 0;
    }

    measuredWidths.sort(function(x, y) {
      return x - y;
    });

    let totalMeasuredWidth = 0;
    for (let i = 0; i < measuredWidths.length; ++i) {
      totalMeasuredWidth += measuredWidths[i];
    }

    if (totalWidth >= totalMeasuredWidth) {
      return measuredWidths[measuredWidths.length - 1];
    }

    let totalExtraWidth = 0;
    for (let i = measuredWidths.length - 1; i > 0; --i) {
      const extraWidth = measuredWidths[i] - measuredWidths[i - 1];
      totalExtraWidth += (measuredWidths.length - i) * extraWidth;

      if (totalWidth + totalExtraWidth >= totalMeasuredWidth) {
        return measuredWidths[i - 1] +
            (totalWidth + totalExtraWidth - totalMeasuredWidth) / (measuredWidths.length - i);
      }
    }

    return totalWidth / measuredWidths.length;
  }

  _tabsToShowIndexes(
      tabsOrdered: TabbedPaneTab[], tabsHistory: TabbedPaneTab[], totalWidth: number,
      measuredDropDownButtonWidth: number): number[] {
    const tabsToShowIndexes = [];

    let totalTabsWidth = 0;
    const tabCount = tabsOrdered.length;
    const tabsToLookAt = tabsOrdered.slice(0);
    if (this._currentTab !== undefined) {
      tabsToLookAt.unshift(tabsToLookAt.splice(tabsToLookAt.indexOf(this._currentTab), 1)[0]);
    }
    if (this._lastSelectedOverflowTab !== undefined) {
      tabsToLookAt.unshift(tabsToLookAt.splice(tabsToLookAt.indexOf(this._lastSelectedOverflowTab), 1)[0]);
    }
    for (let i = 0; i < tabCount; ++i) {
      const tab = this._automaticReorder ? tabsHistory[i] : tabsToLookAt[i];
      totalTabsWidth += tab.width();
      let minimalRequiredWidth = totalTabsWidth;
      if (i !== tabCount - 1) {
        minimalRequiredWidth += measuredDropDownButtonWidth;
      }
      if (!this._verticalTabLayout && minimalRequiredWidth > totalWidth) {
        break;
      }
      tabsToShowIndexes.push(tabsOrdered.indexOf(tab));
    }

    tabsToShowIndexes.sort(function(x, y) {
      return x - y;
    });

    return tabsToShowIndexes;
  }

  _hideCurrentTab(): void {
    if (!this._currentTab) {
      return;
    }

    this._hideTab(this._currentTab);
    delete this._currentTab;
  }

  _showTab(tab: TabbedPaneTab): void {
    tab.tabElement.tabIndex = 0;
    tab.tabElement.classList.add('selected');
    ARIAUtils.setSelected(tab.tabElement, true);
    tab.view.show(this.element);
    this._updateTabSlider();
  }

  _updateTabSlider(): void {
    if (!this._sliderEnabled) {
      return;
    }
    if (!this._currentTab) {
      this._tabSlider.style.width = '0';
      return;
    }
    let left = 0;
    for (let i = 0; i < this._tabs.length && this._currentTab !== this._tabs[i]; i++) {
      if (this._tabs[i]._shown) {
        left += this._tabs[i]._measuredWidth || 0;
      }
    }
    const sliderWidth = this._currentTab._shown ? this._currentTab._measuredWidth : this._dropDownButton.offsetWidth;
    const scaleFactor = window.devicePixelRatio >= 1.5 ? ' scaleY(0.75)' : '';
    this._tabSlider.style.transform = 'translateX(' + left + 'px)' + scaleFactor;
    this._tabSlider.style.width = sliderWidth + 'px';

    if (this._tabSlider.parentElement !== this._headerContentsElement) {
      this._headerContentsElement.appendChild(this._tabSlider);
    }
  }

  _hideTab(tab: TabbedPaneTab): void {
    tab.tabElement.removeAttribute('tabIndex');
    tab.tabElement.classList.remove('selected');
    tab.tabElement.setAttribute('aria-selected', 'false');
    tab.view.detach();
  }

  elementsToRestoreScrollPositionsFor(): Element[] {
    return [this._contentElement];
  }

  _insertBefore(tab: TabbedPaneTab, index: number): void {
    this._tabsElement.insertBefore(tab.tabElement, this._tabsElement.childNodes[index]);
    const oldIndex = this._tabs.indexOf(tab);
    this._tabs.splice(oldIndex, 1);
    if (oldIndex < index) {
      --index;
    }
    this._tabs.splice(index, 0, tab);

    const eventData: EventData = {prevTabId: undefined, tabId: tab.id, view: tab.view, isUserGesture: undefined};
    this.dispatchEventToListeners(Events.TabOrderChanged, eventData);
  }

  leftToolbar(): Toolbar {
    if (!this._leftToolbar) {
      this._leftToolbar = new Toolbar('tabbed-pane-left-toolbar');
      this._headerElement.insertBefore(this._leftToolbar.element, this._headerElement.firstChild);
    }
    return this._leftToolbar;
  }

  rightToolbar(): Toolbar {
    if (!this._rightToolbar) {
      this._rightToolbar = new Toolbar('tabbed-pane-right-toolbar');
      this._headerElement.appendChild(this._rightToolbar.element);
    }
    return this._rightToolbar;
  }

  setAllowTabReorder(allow: boolean, automatic?: boolean): void {
    this._allowTabReorder = allow;
    this._automaticReorder = automatic;
  }

  _keyDown(ev: Event): void {
    if (!this._currentTab) {
      return;
    }
    const event = (ev as KeyboardEvent);
    let nextTabElement: (Element|null)|null = null;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextTabElement = this._currentTab.tabElement.previousElementSibling;
        if (!nextTabElement && !this._dropDownButton.parentElement) {
          nextTabElement = this._currentTab.tabElement.parentElement ?
              this._currentTab.tabElement.parentElement.lastElementChild :
              null;
        }
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextTabElement = this._currentTab.tabElement.nextElementSibling;
        if (!nextTabElement && !this._dropDownButton.parentElement) {
          nextTabElement = this._currentTab.tabElement.parentElement ?
              this._currentTab.tabElement.parentElement.firstElementChild :
              null;
        }
        break;
      case 'Enter':
      case ' ':
        this._currentTab.view.focus();
        return;
      default:
        return;
    }
    if (!nextTabElement) {
      this._dropDownButton.click();
      return;
    }
    const tab = this._tabs.find(tab => tab.tabElement === nextTabElement);
    if (tab) {
      this.selectTab(tab.id, true);
    }
    (nextTabElement as HTMLElement).focus();
  }
}
export interface EventData {
  prevTabId?: string;
  tabId: string;
  view?: Widget;
  isUserGesture?: boolean;
}

// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export enum Events {
  TabInvoked = 'TabInvoked',
  TabSelected = 'TabSelected',
  TabClosed = 'TabClosed',
  TabOrderChanged = 'TabOrderChanged',
}


export class TabbedPaneTab {
  _closeable: boolean;
  _tabbedPane: TabbedPane;
  _id: string;
  _title: string;
  _tooltip: string|undefined;
  _view: Widget;
  _shown: boolean;
  _measuredWidth!: number|undefined;
  _tabElement!: HTMLElement|undefined;
  _iconContainer: Element|null;
  _icon?: Icon|null;
  _width?: number;
  _delegate?: TabbedPaneTabDelegate;
  _titleElement?: HTMLElement;
  _dragStartX?: number;
  constructor(tabbedPane: TabbedPane, id: string, title: string, closeable: boolean, view: Widget, tooltip?: string) {
    this._closeable = closeable;
    this._tabbedPane = tabbedPane;
    this._id = id;
    this._title = title;
    this._tooltip = tooltip;
    this._view = view;
    this._shown = false;
    this._iconContainer = null;
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    if (title === this._title) {
      return;
    }
    this._title = title;
    if (this._titleElement) {
      this._titleElement.textContent = title;
    }
    delete this._measuredWidth;
  }

  isCloseable(): boolean {
    return this._closeable;
  }

  _setIcon(icon: Icon|null): void {
    this._icon = icon;
    if (this._tabElement && this._titleElement) {
      this._createIconElement(this._tabElement, this._titleElement, false);
    }
    delete this._measuredWidth;
  }

  _toggleClass(className: string, force?: boolean): boolean {
    const element = this.tabElement;
    const hasClass = element.classList.contains(className);
    if (hasClass === force) {
      return false;
    }
    element.classList.toggle(className, force);
    delete this._measuredWidth;
    return true;
  }

  get view(): Widget {
    return this._view;
  }

  set view(view: Widget) {
    this._view = view;
  }

  get tooltip(): string|undefined {
    return this._tooltip;
  }

  set tooltip(tooltip: string|undefined) {
    this._tooltip = tooltip;
    if (this._titleElement) {
      Tooltip.install(this._titleElement, tooltip || '');
    }
  }

  get tabElement(): HTMLElement {
    if (!this._tabElement) {
      this._tabElement = this._createTabElement(false);
    }

    return this._tabElement;
  }

  width(): number {
    return this._width || 0;
  }

  setWidth(width: number): void {
    this.tabElement.style.width = width === -1 ? '' : (width + 'px');
    this._width = width;
  }

  setDelegate(delegate: TabbedPaneTabDelegate): void {
    this._delegate = delegate;
  }

  _createIconElement(tabElement: Element, titleElement: Element, measuring: boolean): void {
    const iconElement = tabIcons.get(tabElement);
    if (iconElement) {
      iconElement.remove();
      tabIcons.delete(tabElement);
    }
    if (!this._icon) {
      return;
    }

    const iconContainer = document.createElement('span');
    iconContainer.classList.add('tabbed-pane-header-tab-icon');
    const iconNode = measuring ? this._icon.cloneNode(true) : this._icon;
    iconContainer.appendChild(iconNode);
    tabElement.insertBefore(iconContainer, titleElement);
    tabIcons.set(tabElement, iconContainer);
  }

  _createTabElement(measuring: boolean): HTMLElement {
    const tabElement = document.createElement('div');
    tabElement.classList.add('tabbed-pane-header-tab');
    tabElement.id = 'tab-' + this._id;
    ARIAUtils.markAsTab(tabElement);
    ARIAUtils.setSelected(tabElement, false);
    ARIAUtils.setAccessibleName(tabElement, this.title);

    const titleElement = tabElement.createChild('span', 'tabbed-pane-header-tab-title');
    titleElement.textContent = this.title;
    Tooltip.install(titleElement, this.tooltip || '');
    this._createIconElement(tabElement, titleElement, measuring);
    if (!measuring) {
      this._titleElement = titleElement;
    }

    if (this._closeable) {
      const closeIcon = this.createCloseIconButton();
      tabElement.appendChild(closeIcon);
      tabElement.classList.add('closeable');
    }

    if (measuring) {
      tabElement.classList.add('measuring');
    } else {
      tabElement.addEventListener('click', this._tabClicked.bind(this), false);
      tabElement.addEventListener('auxclick', this._tabClicked.bind(this), false);
      tabElement.addEventListener('mousedown', this._tabMouseDown.bind(this), false);
      tabElement.addEventListener('mouseup', this._tabMouseUp.bind(this), false);

      tabElement.addEventListener('contextmenu', this._tabContextMenu.bind(this), false);
      if (this._tabbedPane._allowTabReorder) {
        installDragHandle(
            tabElement, this._startTabDragging.bind(this), this._tabDragging.bind(this),
            this._endTabDragging.bind(this), '-webkit-grabbing', 'pointer', 200);
      }
    }

    return tabElement as HTMLElement;
  }

  private createCloseIconButton(): HTMLDivElement {
    const closeIconContainer = document.createElement('div');
    closeIconContainer.classList.add('close-button', 'tabbed-pane-close-button');
    const closeIcon = new IconButton.Icon.Icon();
    closeIcon.data = {
      iconName: 'close-icon',
      color: 'var(--tabbed-pane-close-icon-color)',
      width: '7px',
    };
    closeIconContainer.appendChild(closeIcon);
    closeIconContainer.setAttribute('role', 'button');
    closeIconContainer.setAttribute('title', i18nString(UIStrings.closeS, {PH1: this.title}));
    closeIconContainer.setAttribute('aria-label', i18nString(UIStrings.closeS, {PH1: this.title}));
    return closeIconContainer;
  }

  private isCloseIconClicked(element: HTMLElement): boolean {
    return element?.classList.contains('tabbed-pane-close-button') ||
        element?.parentElement?.classList.contains('tabbed-pane-close-button') || false;
  }

  _tabClicked(ev: Event): void {
    const event = (ev as MouseEvent);
    const middleButton = event.button === 1;
    const shouldClose = this._closeable && (middleButton || this.isCloseIconClicked(event.target as HTMLElement));
    if (!shouldClose) {
      this._tabbedPane.focus();
      return;
    }
    this._closeTabs([this.id]);
    event.consume(true);
  }

  _tabMouseDown(ev: Event): void {
    const event = ev as MouseEvent;
    if (this.isCloseIconClicked(event.target as HTMLElement) || event.button !== 0) {
      return;
    }
    this._tabbedPane.selectTab(this.id, true);
  }

  _tabMouseUp(ev: Event): void {
    const event = (ev as MouseEvent);
    // This is needed to prevent middle-click pasting on linux when tabs are clicked.
    if (event.button === 1) {
      event.consume(true);
    }
  }

  _closeTabs(ids: string[]): void {
    if (this._delegate) {
      this._delegate.closeTabs(this._tabbedPane, ids);
      return;
    }
    this._tabbedPane.closeTabs(ids, true);
  }

  _tabContextMenu(event: Event): void {
    function close(this: TabbedPaneTab): void {
      this._closeTabs([this.id]);
    }

    function closeOthers(this: TabbedPaneTab): void {
      this._closeTabs(this._tabbedPane.otherTabs(this.id));
    }

    function closeAll(this: TabbedPaneTab): void {
      this._closeTabs(this._tabbedPane.tabIds());
    }

    function closeToTheRight(this: TabbedPaneTab): void {
      this._closeTabs(this._tabbedPane._tabsToTheRight(this.id));
    }

    const contextMenu = new ContextMenu(event);
    if (this._closeable) {
      contextMenu.defaultSection().appendItem(i18nString(UIStrings.close), close.bind(this));
      contextMenu.defaultSection().appendItem(i18nString(UIStrings.closeOthers), closeOthers.bind(this));
      contextMenu.defaultSection().appendItem(i18nString(UIStrings.closeTabsToTheRight), closeToTheRight.bind(this));
      contextMenu.defaultSection().appendItem(i18nString(UIStrings.closeAll), closeAll.bind(this));
    }
    if (this._delegate) {
      this._delegate.onContextMenu(this.id, contextMenu);
    }
    contextMenu.show();
  }

  _startTabDragging(ev: Event): boolean {
    const event = (ev as MouseEvent);
    if (this.isCloseIconClicked(event.target as HTMLElement)) {
      return false;
    }
    this._dragStartX = event.pageX;
    if (this._tabElement) {
      this._tabElement.classList.add('dragging');
    }
    this._tabbedPane._tabSlider.remove();
    return true;
  }

  _tabDragging(ev: Event): void {
    const event = (ev as MouseEvent);
    const tabElements = this._tabbedPane._tabsElement.childNodes;
    for (let i = 0; i < tabElements.length; ++i) {
      let tabElement: HTMLElement = (tabElements[i] as HTMLElement);
      if (!this._tabElement || tabElement === this._tabElement) {
        continue;
      }

      const intersects = tabElement.offsetLeft + tabElement.clientWidth > this._tabElement.offsetLeft &&
          this._tabElement.offsetLeft + this._tabElement.clientWidth > tabElement.offsetLeft;
      if (!intersects) {
        continue;
      }

      const dragStartX = (this._dragStartX as number);
      if (Math.abs(event.pageX - dragStartX) < tabElement.clientWidth / 2 + 5) {
        break;
      }

      if (event.pageX - dragStartX > 0) {
        tabElement = (tabElement.nextSibling as HTMLElement);
        ++i;
      }

      const oldOffsetLeft = this._tabElement.offsetLeft;
      this._tabbedPane._insertBefore(this, i);
      this._dragStartX = dragStartX + this._tabElement.offsetLeft - oldOffsetLeft;
      break;
    }

    const dragStartX = (this._dragStartX as number);
    const tabElement = (this._tabElement as HTMLElement);
    if (!tabElement.previousSibling && event.pageX - dragStartX < 0) {
      tabElement.style.setProperty('left', '0px');
      return;
    }
    if (!tabElement.nextSibling && event.pageX - dragStartX > 0) {
      tabElement.style.setProperty('left', '0px');
      return;
    }

    tabElement.style.setProperty('left', (event.pageX - dragStartX) + 'px');
  }

  _endTabDragging(_event: Event): void {
    const tabElement = (this._tabElement as HTMLElement);
    tabElement.classList.remove('dragging');
    tabElement.style.removeProperty('left');
    delete this._dragStartX;
    this._tabbedPane._updateTabSlider();
  }
}

const tabIcons = new WeakMap<Element, Element>();

export interface TabbedPaneTabDelegate {
  closeTabs(tabbedPane: TabbedPane, ids: string[]): void;
  onContextMenu(tabId: string, contextMenu: ContextMenu): void;
}
