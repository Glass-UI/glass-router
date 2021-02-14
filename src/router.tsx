import React from "react";
import {
  Router as Base,
  HashRouter,
  Route,
  Switch,
} from "react-router-dom";
import { createBrowserHistory } from "history";

import ScrollTo from "./utils/ScrollTo";
import { To, PathedRoute, NamedRoute } from "./types/route";
import { IRoute, IParams } from "./interfaces/route";
import { IRouterOptions } from "./interfaces/router";

/**
 * Glass Router
 * --------
 * Easy peasy routing for react.
 * Inspired by vue router.
 */
export default class Router {
  protected _defaultOptions: IRouterOptions = {
    routes: [],
    mode: "history",
    base: "/",
    forceRefresh: false,
    getUserConfirmation: window.confirm,
    hashType: "slash",
    keyLength: 6,
    linkActiveClass: "router-link-active",
    linkExactActiveClass: "router-link-exact-active",
    scrollBehavior: (savedPosition: { x: number; y: number }) => {
      const { x, y } = savedPosition;
      ScrollTo(x, y);
    },
  };

  protected _options: IRouterOptions = {
    routes: [],
    mode: "history",
    base: "/",
    forceRefresh: false,
    getUserConfirmation: window.confirm,
    hashType: "slash",
    keyLength: 6,
    linkActiveClass: "router-link-active",
    linkExactActiveClass: "router-link-exact-active",
    scrollBehavior: (savedPosition: { x: number; y: number }) => {
      const { x, y } = savedPosition;
      ScrollTo(x, y);
    },
  };

  protected beforeHooks = [];

  protected _history: any = null;

  constructor(options: Partial<IRouterOptions> = {}) {
    this.options(options);
  }

  options(options: Partial<IRouterOptions>) {
    this._options = {
      ...this._defaultOptions,
      ...options,
    };
  }

  /**
   * Generate JSX from defined routes
   */
  render(): JSX.Element {
    const {
      mode,
      routes,
      base,
      forceRefresh,
      getUserConfirmation,
      keyLength,
      hashType,
    } = this._options;

    let routerProps = {};

    if (mode === "history") {
      routerProps = {
        basename: base,
        forceRefresh,
        getUserConfirmation,
        keyLength,
      };

      this._history = createBrowserHistory(routerProps);
    } else {
      routerProps = {
        basename: base,
        hashType,
        getUserConfirmation,
      };
    }

    const children = (
      <>
        {/* <ScrollTo /> */}
        <Switch>
          {routes.map((route, index) => {
            const props: Exclude<IRoute, "name"> = route;
            return <Route {...props} key={index} />;
          })}
        </Switch>
      </>
    );

    return mode === "hash" ? (
      <HashRouter {...routerProps}>{children}</HashRouter>
    ) : (
      <Base history={this._history} {...routerProps}>
        {children}
      </Base>
    );
  }

  /**
   * Register a router hook
   */
  registerHook(list: Array<Function | Object>, fn: Function) {
    list.push(fn);

    return function() {
      const i = list.indexOf(fn);

      if (i > -1) {
        list.splice(i, 1);
      }
    };
  }

  /**
   * Define middleware
   */
  beforeEach(fn: Function) {
    return this.registerHook(this.beforeHooks, fn);
  }

  /**
   * Internal route handler
   */
  getRoutePath(route: To | string): string {
    let rp: string = "";

    if (typeof route === "string") {
      rp = route[0] === "/" ? route : this.findNamedPath(route);
    } else {
      const name = (route as NamedRoute).name;
      const params = (route as NamedRoute).params;
      const path = (route as PathedRoute).path;

      if (path) rp = path;
      if (name) rp = this.findNamedPath(name);
      if (params) rp = this.findNamedPath(name, params);
    }
    return rp;
  }

  protected findNamedPath(path: string, params?: IParams): string {
    let route = this._options.routes.find((route) => {
      return route.name === path;
    })?.path;

    if (route === undefined) {
      throw new Error(`Route ${path} does not exist`);
    }

    if (params !== undefined) {
      let routePath: string = `${route}`;

      for (let key in params) {
        routePath += `/${params[key]}`;
      }

      route = routePath;
    }

    return route;
  }

  /**
   * Get the number of entries in the history stack
   */
  entries() {
    return this._history.length;
  }

  /**
   * Get the The current action (PUSH, REPLACE, or POP)
   */
  action() {
    return this._history.action;
  }

  /**
   * Navigate to a specific path
   */
  push(to: To | string, state: any = null) {
    const path = this.getRoutePath(to);

    return this._history.push(path, state);
  }

  /**
   * Replaces the current entry on the history stack
   */
  replace(options: any, state: any = null) {
    const path = this.getRoutePath(options);

    return this._history.replace(path, state);
  }

  /**
   * Moves the pointer in the history stack by n entries
   */
  go(n: number) {
    return this._history.go(n);
  }

  /**
   * Go back
   */
  back() {
    return this._history.go(-1);
  }

  /**
   * Go forward
   */
  forward() {
    return this._history.go(1);
  }

  /**
   * Go back
   */
  disable(prompt: any) {
    return this._history.block(prompt);
  }

  history() {
    return this._history;
  }
}
