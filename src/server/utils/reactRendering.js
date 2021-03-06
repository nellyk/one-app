/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { Helmet } from 'react-helmet';

Helmet.canUseDOM = false;

const renderBuilder = (renderMethod) => (...args) => {
  // clear out any data that might exist
  // ex: an error thrown during React rendering left the Helmet singleton in a middle state
  Helmet.renderStatic();
  const renderedString = renderMethod(...args);
  // important to release the memory, even if the data isn't used
  const helmetInfo = Helmet.renderStatic();
  return {
    renderedString,
    helmetInfo,
  };
};

export const renderForString = renderBuilder(renderToString);
export const renderForStaticMarkup = renderBuilder(renderToStaticMarkup);

export const getRenderMethodName = (state) => {
  const disableScripts = state.getIn(['rendering', 'disableScripts']);
  const renderPartialOnly = state.getIn(['rendering', 'renderPartialOnly']);
  const renderTextOnly = state.getIn(['rendering', 'renderTextOnly']);
  return disableScripts || renderPartialOnly || renderTextOnly
    ? 'renderForStaticMarkup' : 'renderForString';
};
