/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/minuterie`; params?: Router.UnknownInputParams; } | { pathname: `/miroir`; params?: Router.UnknownInputParams; } | { pathname: `/reglages`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/programme/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/minuterie`; params?: Router.UnknownOutputParams; } | { pathname: `/miroir`; params?: Router.UnknownOutputParams; } | { pathname: `/reglages`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/programme/[id]`, params: Router.UnknownOutputParams & { id: string; } };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/minuterie${`?${string}` | `#${string}` | ''}` | `/miroir${`?${string}` | `#${string}` | ''}` | `/reglages${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/minuterie`; params?: Router.UnknownInputParams; } | { pathname: `/miroir`; params?: Router.UnknownInputParams; } | { pathname: `/reglages`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | `/programme/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ''}` | { pathname: `/programme/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
    }
  }
}
