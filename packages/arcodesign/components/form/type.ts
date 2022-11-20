import { IRules } from '@arco-design/mobile-utils/utils/validator/type';
import { ReactNode } from 'react';

export type FieldValue = any;
export type FieldItem = Record<string, any>;
export type ILayout = 'horizontal' | 'vertical' | 'inline';
export interface FormProps {
    /** 自定义类名 */
    className?: string;
    /** 自定义样式 */
    style?: React.CSSProperties;
    layout?: ILayout;
    form?: IFormInstance;
    initialValues?: FieldItem;
    children: React.ReactNodeArray | ReactNode;
    onValuesChange?: Callbacks['onValuesChange'];
    onSubmit?: Callbacks['onSubmit'];
    onSubmitFailed?: Callbacks['onSubmitFailed'];
}

export type FieldError = {
    value?: FieldValue;
    errors?: ReactNode[];
    field?: string;
    dom?: HTMLDivElement | null;
};
export interface IFormDataMethods {
    setFieldsValue: (values: FieldItem) => boolean;
    setFieldValue: (name: string, value: FieldValue) => boolean;
    getFieldsValue: (names?: string[]) => FieldItem;
    getFieldValue: (name: string) => FieldValue;
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
    setInitialValues: (values: FieldItem, init: boolean) => void;
    setCallbacks: (callbacks: Callbacks) => void;
}

export interface IFormInstance {
    getFieldValue: (name: string) => FieldValue;
    getFieldsValue(name?: string[]): FieldItem;
    resetFields: () => void;
    setFieldsValue: (value: FieldItem) => void;
    validateFields: () => Promise<FieldItem>;
    submit: () => void;
}

export type InternalFormInstance = Omit<IFormInstance, 'validateFields'> & {
    validateFields: () => Promise<FieldItem>;
    getInternalHooks: () => InternalHooks;
};

export interface IFormItemContext {
    form: InternalFormInstance;
    layout: ILayout;
}

export type IShouldUpdateFunc = (data: { preStore: FieldItem; curStore: FieldItem }) => boolean;
export interface IFormItemProps {
    label: ReactNode;
    style?: React.CSSProperties;
    field: string;
    required: boolean;
    defaultValue: FieldValue;
    disabled?: boolean;
    layout?: ILayout;
    children: JSX.Element;
    shouldUpdate?: boolean | IShouldUpdateFunc;
    rules?: IRules[];
    extra: JSX.Element;
    trigger?: string;
    requiredIcon: ReactNode;
}
export interface IFormItemInnerProps {
    field: string;
    children: JSX.Element;
    shouldUpdate?: boolean | IShouldUpdateFunc;
    rules?: IRules[];
    trigger?: string;
    onValidateStatusChange: (data: { errors: any; warnings: any }) => void;
    getFormItemRef: () => HTMLDivElement | null;
    triggerPropsField?: string;
}
