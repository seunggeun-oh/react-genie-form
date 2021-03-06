import React, { useCallback, useEffect } from 'react';
import {
  Component,
  FunctionComponent,
  forwardRef,
  useState,
  useMemo,
  useImperativeHandle,
  useRef,
} from 'react';
import { get } from 'lodash-es';
import Container from '../Container';
import { ContainerProps } from '../Container/Container';
import useContextProvider from '../../hooks/useContext/useContextProvider';
import { useHandle, useSchema, useValidate } from '../../hooks';
import { hashCode, flattenMessages } from '../../helpers/util';

export interface FormProps extends ContainerProps {
  form?: any[];
  formTypes?: FormType[];
  parseValue?: any;
  plugin?: any;
  customValidate?: StringFunctionMap;
  errors?: any[];
  FormGroup?: Component | FunctionComponent;
  Label?: Component | FunctionComponent;
  Description?: Component | FunctionComponent;
  ErrorMessage?: Component | FunctionComponent;
  ErrorSummary?: Component | FunctionComponent;
  formatLabel?: Function;
  formatErrorMessage?: Function;
  formatEnum?: Function;
  showError?: Boolean | 'always' | 'dirty' | 'touched' | 'dirty+touched';
  required?: string[];
  onChangeWithErrors?: (value: any, errors: any) => void;
  onSubmit?: (value: any) => void;
  context?: any;
}

const enums = {
  layout: ['vertical', 'horizontal'],
  labelAlign: ['right', 'center', 'left'],
  size: ['default', 'small', 'large'],
};

const getPreferredValue = (type: string, value: any) => {
  const values = get(enums, [type], []);
  return values.indexOf(value) !== -1 ? value : values[0];
};

function FormInner(
  {
    form,
    formTypes,
    parseValue,
    plugin,
    schema,
    customValidate,
    defaultValue = {},
    layout,
    labelAlign,
    size,
    errors: errorsReceived,
    showError,
    showErrorSummary,
    required,
    FormGroup,
    Label,
    Description,
    ErrorMessage,
    ErrorSummary,
    formatLabel,
    formatErrorMessage,
    formatEnum,
    onChange,
    onChangeWithErrors,
    onSubmit,
    context,
    ...restProps
  }: FormProps,
  ref: any,
) {
  const _schema = useSchema(schema, required);
  const validate = useValidate(_schema, customValidate, defaultValue);

  const currValue = useRef<any>(defaultValue);

  const [errors, setErrors] = useState<any[]>([]);
  const [asyncValue, setAsyncValue] = useState<any>(defaultValue);

  const asyncValueHash = useMemo(() => hashCode({ asyncValue, errors }), [
    asyncValue,
    errors,
  ]);

  const handleChangeWithErrors = useHandle(onChangeWithErrors);
  useEffect(() => {
    handleChangeWithErrors(
      asyncValue,
      errors && errors.length > 0 ? errors : undefined,
    );
  }, [asyncValueHash]);
  const handleChange = useHandle(async (value: any) => {
    currValue.current = value;
    if (typeof onChange === 'function') {
      onChange(value);
    }

    const _errors: any[] = await validate(value);
    if (
      errors !== _errors &&
      JSON.stringify(errors) !== JSON.stringify(_errors)
    ) {
      setErrors(_errors);
    }
    setAsyncValue(value);
  });

  const _layout = useMemo(() => getPreferredValue('layout', layout), [layout]);
  const _labelAlign = useMemo(
    () => getPreferredValue('labelAlign', labelAlign),
    [labelAlign],
  );
  const _size = useMemo(() => getPreferredValue('size', size), [size]);

  const flattened = useMemo(() => flattenMessages(asyncValue), [asyncValue]);
  const getContext = useHandle(() => context || {});
  const [Provider, value] = useContextProvider({
    form,
    formTypes,
    parseValue,
    plugin,
    schema: _schema,
    layout: _layout,
    labelAlign: _labelAlign,
    size: _size,
    FormGroup,
    Label,
    Description,
    ErrorMessage,
    ErrorSummary,
    formatLabel,
    formatErrorMessage,
    formatEnum,
    onChange,
    errors,
    errorsReceived,
    showError,
    flattened,
    getContext,
  });

  const getValue = useHandle(async () => {
    const value = currValue.current;
    const errors: any[] = await validate(value);
    return { value, errors };
  });

  useImperativeHandle(ref, () => ({
    getValue,
    // getValue: async () => {
    //   const value = currValue.current;
    //   const errors: any[] = await validate(value);
    //   return { value, errors };
    // },
  }));

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    // console.log('get value');

    if (typeof onSubmit === 'function') {
      const { value, errors } = await getValue();
      // console.log(value, errors);
      onSubmit(value);
    }
  };

  return (
    <Provider value={value}>
      {onSubmit ? (
        <form onSubmit={handleSubmit}>
          <Container
            {...restProps}
            schema={_schema}
            defaultValue={defaultValue}
            layout={_layout}
            labelAlign={_labelAlign}
            size={_size}
            plugin={plugin}
            onChange={handleChange}
            showErrorSummary={showErrorSummary}
          />
        </form>
      ) : (
          <Container
            {...restProps}
            schema={_schema}
            defaultValue={defaultValue}
            layout={_layout}
            labelAlign={_labelAlign}
            size={_size}
            plugin={plugin}
            onChange={handleChange}
            showErrorSummary={showErrorSummary}
          />
        )}
    </Provider>
  );
}

const Form = forwardRef<any, FormProps>(FormInner);

export default Form as React.FC<FormProps>;
