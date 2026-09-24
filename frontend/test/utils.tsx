import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { store } from '../src/store';

interface RenderWithProvidersOptions extends RenderOptions {
  initialState?: Partial<ReturnType<typeof store.getState>>;
  routerProps?: MemoryRouterProps;
}

const defaultRouterProps: MemoryRouterProps = {
  initialEntries: ['/'],
};

export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderWithProvidersOptions = {}
) {
  const { initialState, routerProps = {}, ...renderOptions } = options;

  if (initialState) {
    store.replaceReducer((state, action) => {
      if (action.type === '@@redux/INIT') {
        return { ...store.getState(), ...initialState };
      }
      return store.getState();
    });
  }

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter {...defaultRouterProps} {...routerProps}>
        {children}
      </MemoryRouter>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
export { store } from '../src/store';