import React from 'react';
import BackingTrackPage from '../pages/playerPage/BackingTrackPage';
import ChordsPage from '../pages/chordsPage/ChordsPage';
import { Route } from 'react-router-dom';
import MainPage from '../pages/MainPage';

export interface RouteItem {
  path: string;
  element: React.ReactElement;
  exact?: boolean;
  needLogin?: boolean;
  children?: RouteItem[];
}

export function renderRoute(route: RouteItem, index: number) {
  return (
    <Route key={index} path={route.path} element={route.element}>
      {route.children?.map(renderRoute)}
    </Route>
  );
}

const routes: RouteItem[] = [
  {
    path: '/',
    element: <MainPage />,
    exact: true,
  },
  {
    path: '/chords',
    element: <ChordsPage />,
    exact: true,
  },
  {
    path: '/backingTracks',
    element: <BackingTrackPage />,
    exact: true,
  },
];

export default routes;
