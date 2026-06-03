import React from 'react';

type CaseFunction<State> = (data: State, payload: void) => State;

type CaseWithPayloadFunction<State, Payload = any> = (data: State, payload: Payload) => State;

type GetPayloadType<T> = T extends CaseWithPayloadFunction<any, infer P> ? P : never;

type MapActions<T extends object> = T extends {[K in keyof T]: any}
    ? {[K in keyof T]: {type: K; payload: GetPayloadType<T[K]>}}
    : never;

type ActionsMap<T extends object> = MapActions<T>;

type ActionKeys<T extends object> = Extract<keyof ActionsMap<T>, string>;

type UserActions<T extends object> = ActionsMap<T>[ActionKeys<T>];

type CaseReducer<State> = {
    [key: string]: CaseWithPayloadFunction<State>;
};

type ActionsType<Reducer> = {
    [key in keyof Reducer]: Reducer[key] extends CaseFunction<any>
        ? () => void
        : (payload: GetPayloadType<Reducer[key]>) => void;
};

type SetNewEditorAction = {
    type: 'service/set_new_editor';
    payload: any;
};

type ResetEditorAction = {
    type: 'service/reset_editor';
    payload?: never;
};

type ServiceActions = SetNewEditorAction | ResetEditorAction;

type UseEditorReturnType<S, R> = {
    state: S;
    actions: ActionsType<R>;
    setNewEditor: (data: S) => void;
    resetEditor: () => void;
};

export const useEditor = <S, R extends CaseReducer<S>>(initialData: S, caseReducer: R): UseEditorReturnType<S, R> => {
    const reducer = (data: S, action: UserActions<R> | ServiceActions) => {
        switch (action.type) {
            case 'service/set_new_editor':
                return action.payload;
            case 'service/reset_editor':
                return initialData;
            default:
                return caseReducer[action.type](data, action.payload);
        }
    };

    const actions = Object.keys(caseReducer).reduce(
        (acc, name) => ({
            ...acc,
            [name]: <key extends keyof R>(payload: GetPayloadType<R[key]>) =>
                dispatch({type: name, payload} as UserActions<R>),
        }),
        {},
    ) as ActionsType<R>;

    const [state, dispatch] = React.useReducer(reducer, initialData);

    const setNewEditor = React.useCallback((data: S) => dispatch({type: 'service/set_new_editor', payload: data}), []);

    const resetEditor = React.useCallback(() => dispatch({type: 'service/reset_editor'}), []);

    return {
        state,
        actions,
        setNewEditor,
        resetEditor,
    };
};
