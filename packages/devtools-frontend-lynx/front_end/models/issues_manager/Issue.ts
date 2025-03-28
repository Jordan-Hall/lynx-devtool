// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import type * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';

import type {MarkdownIssueDescription} from './MarkdownIssueDescription.js';

// eslint-disable-next-line rulesdir/const_enum
export enum IssueCategory {
  CrossOriginEmbedderPolicy = 'CrossOriginEmbedderPolicy',
  MixedContent = 'MixedContent',
  SameSiteCookie = 'SameSiteCookie',
  HeavyAd = 'HeavyAd',
  ContentSecurityPolicy = 'ContentSecurityPolicy',
  TrustedWebActivity = 'TrustedWebActivity',
  LowTextContrast = 'LowTextContrast',
  Cors = 'Cors',
  AttributionReporting = 'AttributionReporting',
  QuirksMode = 'QuirksMode',
  Other = 'Other',
}

// eslint-disable-next-line rulesdir/const_enum
export enum IssueKind {
  /**
   * Something is not working in the page right now. Issues of this kind need
   * usually be fixed right away. They usually indicate that a Web API is being
   * used in a wrong way, or that a network request was misconfigured.
   */
  PageError = 'PageError',
  /**
   * The page is using a Web API or relying on browser behavior that is going
   * to change in the future. If possible, the message associated with issues
   * of this kind should include a time when the behavior is going to change.
   */
  BreakingChange = 'BreakingChange',
  /**
   * Anything that can be improved about the page, but isn't urgent and doesn't
   * impair functionality in a major way.
   */
  Improvement = 'Improvement',
}

/**
 * Union two issue kinds for issue aggregation. The idea is to show the most
 * important kind on aggregated issues that union issues of different kinds.
 */
export function unionIssueKind(a: IssueKind, b: IssueKind): IssueKind {
  if (a === IssueKind.PageError || b === IssueKind.PageError) {
    return IssueKind.PageError;
  }
  if (a === IssueKind.BreakingChange || b === IssueKind.BreakingChange) {
    return IssueKind.BreakingChange;
  }
  return IssueKind.Improvement;
}

export function getShowThirdPartyIssuesSetting(): Common.Settings.Setting<boolean> {
  return Common.Settings.Settings.instance().createSetting('showThirdPartyIssues', false);
}

export interface AffectedElement {
  backendNodeId: Protocol.DOM.BackendNodeId;
  nodeName: string;
  target: SDK.Target.Target|null;
}

export abstract class Issue<IssueCode extends string = string> {
  private issueCode: IssueCode;
  private issuesModel: SDK.IssuesModel.IssuesModel|null;
  protected issueId: string|undefined = undefined;

  constructor(
      code: IssueCode|{code: IssueCode, umaCode: string}, issuesModel: SDK.IssuesModel.IssuesModel|null = null,
      issueId?: string) {
    this.issueCode = typeof code === 'object' ? code.code : code;
    this.issuesModel = issuesModel;
    this.issueId = issueId;
    Host.userMetrics.issueCreated(typeof code === 'string' ? code : code.umaCode);
  }

  code(): IssueCode {
    return this.issueCode;
  }

  abstract primaryKey(): string;
  abstract getDescription(): MarkdownIssueDescription|null;
  abstract getCategory(): IssueCategory;
  abstract getKind(): IssueKind;

  getBlockedByResponseDetails(): Iterable<Protocol.Audits.BlockedByResponseIssueDetails> {
    return [];
  }

  cookies(): Iterable<Protocol.Audits.AffectedCookie> {
    return [];
  }

  elements(): Iterable<AffectedElement> {
    return [];
  }

  requests(): Iterable<Protocol.Audits.AffectedRequest> {
    return [];
  }

  sources(): Iterable<Protocol.Audits.SourceCodeLocation> {
    return [];
  }

  isAssociatedWithRequestId(requestId: string): boolean {
    for (const request of this.requests()) {
      if (request.requestId === requestId) {
        return true;
      }
    }
    return false;
  }

  /**
   * The model might be unavailable or belong to a target that has already been disposed.
   */
  model(): SDK.IssuesModel.IssuesModel|null {
    return this.issuesModel;
  }

  isCausedByThirdParty(): boolean {
    return false;
  }

  getIssueId(): string|undefined {
    return this.issueId;
  }
}

export function toZeroBasedLocation(location: Protocol.Audits.SourceCodeLocation|undefined):
    {url: string, scriptId: string|undefined, lineNumber: number, columnNumber: number|undefined}|undefined {
  if (!location) {
    return undefined;
  }
  return {
    url: location.url,
    scriptId: location.scriptId,
    lineNumber: location.lineNumber,
    columnNumber: location.columnNumber === 0 ? undefined : location.columnNumber - 1,
  };
}
