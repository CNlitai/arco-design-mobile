import { ReactNode } from 'react';

export interface IRules {
    type?: string;
    min?: number;
    max?: number;
    required?: boolean;
    length?: number;
    match?: RegExp;
    validator?: (value: any, callback: (err?: ReactNode) => void) => void;
    asyncValidator?: (value: any, callback: (err?: ReactNode) => void) => void;
    message?: string;
    level?: 'warning' | 'error';
}
export type FieldValue = any;
export type FieldItem = Record<string, any>;

export type FieldError = {
    value?: FieldValue;
    message?: ReactNode;
    type?: string;
    requiredError?: boolean;
};
export interface IFormDataMethods {
    setFieldsValue: (values: FieldItem) => boolean;
    setFieldValue: (name: string, value: any) => boolean;
    getFieldsValue: (names?: string[]) => FieldItem;
    getFieldValue: (name: string) => any;
    registerField: (name: string, self: ReactNode) => () => void;
}

export enum ValidateStatus {
    Init = 'init',
    Error = 'error',
    Warning = 'warning',
    Validating = 'validating',
    Success = 'success',
}

export interface Callbacks {
    onValuesChange?: (changedValues: FieldValue, values: FieldValue) => void;
    onSubmit?: (values: FieldValue) => void;
    onSubmitFailed?: (errorInfo: FieldError) => void;
}

export interface InternalHooks {
    registerField: (name: string, self: ReactNode) => () => void;
    setInitialValues: (values: Record<string, any>, init: boolean) => void;
    setCallbacks: (callbacks: Callbacks) => void;
}

export interface IFormInstance {
    getFieldValue: (name: string) => FieldValue;
    getFieldsValue(name?: string[]): FieldItem;
    resetFields: () => void;
    setFieldsValue: (value: FieldItem) => void;
    validateFields: any;
    submit: () => void;
}

export type InternalFormInstance = Omit<IFormInstance, 'validateFields'> & {
    validateFields: any;
    getInternalHooks: () => InternalHooks;
};
