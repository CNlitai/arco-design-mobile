/* eslint-disable react/no-unused-class-component-methods */
import React, { PureComponent, ReactNode, useContext, useRef, useState } from 'react';
import { cls } from '@arco-design/mobile-utils';
import { schemaValidate } from './validator';
import { FormItemContextParams } from './formItemContext';
import { GlobalContext } from '../context-provider';
import {
    FieldError,
    FieldValue,
    IFormDataMethods,
    InternalFormInstance,
    IRules,
    ValidateStatus,
} from './type';

export type TLayout = 'horizontal' | 'vertical' | 'inline';
export type IShouldUpdateFunc = (data: {
    preStore: Record<string, any>;
    curStore: Record<string, any>;
}) => boolean;
export interface IFormItemProps {
    label: ReactNode;
    style?: React.CSSProperties;
    field: string;
    required: boolean;
    defaultValue: any;
    disabled?: boolean;
    layout?: TLayout;
    children: JSX.Element;
    shouldUpdate?: boolean | IShouldUpdateFunc;
    rules?: IRules[];
    extra: JSX.Element;
    trigger?: string;
}

enum InternalComponentType {
    Input = 'ADMInput',
    Textarea = 'ADMTextarea',
    Checkbox = 'ADMCheckbox',
    CheckboxGroup = 'ADMCheckboxGroup',
    DatePicker = 'ADMDatePicker',
    Picker = 'ADMPicker',
    Radio = 'ADMRadio',
    RadioGroup = 'ADMRadioGroup',
    Slider = 'ADMSlider',
    Switch = 'ADMSwitch',
}
export interface IFormItemInnerProps {
    field: string;
    children: JSX.Element;
    shouldUpdate?: boolean | IShouldUpdateFunc;
    rules?: IRules[];
    trigger?: string;
    onValidateStatusChange: (data: { errors: any; warnings: any }) => void;
    getFormItemRef: () => HTMLDivElement | null;
}

interface IFromItemInnerState {
    validateStatus: ValidateStatus;
    errors?: FieldError[];
    _touched: boolean;
}

class FormItemInner extends PureComponent<IFormItemInnerProps, IFromItemInnerState> {
    // eslint-disable-next-line react/static-property-placement
    static contextType = FormItemContextParams;

    destroyField: () => void;

    private _errors: ReactNode[] = [];

    private _touched = false;

    constructor(props) {
        super(props);
        this.destroyField = () => {};
    }

    componentDidMount() {
        const { getInternalHooks }: InternalFormInstance = this.context;
        const { registerField } = getInternalHooks();
        this.destroyField = registerField(this.props.field, this);
    }

    componentWillUnmount() {
        this.destroyField();
    }

    onValueChange(preStore: Record<string, any>, curStore: Record<string, any>) {
        this._touched = true;
        // this.validateField();
        const { shouldUpdate } = this.props;
        if (true) {
            if (typeof shouldUpdate === 'function') {
                shouldUpdate({ preStore, curStore }) && this.forceUpdate();
                return;
            }
            this.forceUpdate();
        }
    }

    getFieldError() {
        return this._errors;
    }

    isFieldTouched() {
        return this._touched;
    }

    validateField(): Promise<{
        errors: ReactNode[];
        value: FieldValue;
        field: string;
        dom: HTMLDivElement | null;
    }> {
        const { getFieldValue } = this.context;
        const { field, rules, onValidateStatusChange } = this.props;
        const value = getFieldValue(field);
        if (rules?.length && field) {
            const fieldDom = this.props.getFormItemRef();
            return schemaValidate(value, rules).then(({ errors, warnings }) => {
                this._errors = errors;
                onValidateStatusChange({
                    errors,
                    warnings,
                });
                return Promise.resolve({ errors, value, field, dom: fieldDom });
            });
        }
        return Promise.resolve({ errors: [], value, field, dom: null });
    }

    renderChildren() {
        const { children, field, trigger = 'onChange' } = this.props;
        const { getFieldValue, setFieldValue } = this.context as IFormDataMethods;
        let props: Record<string, any> = {
            value: getFieldValue(field),
            onChange: (_, newValue) => {
                children.props?.onChange(_, newValue);
                setFieldValue(field, newValue);
            },
        };

        // eslint-disable-next-line default-case
        switch (children.type.displayName) {
            case InternalComponentType.Input:
            case InternalComponentType.Textarea:
                props = {
                    value: getFieldValue(field) || '',
                    onInput: (_, newValue) => setFieldValue(field, newValue),
                    onClear: () => setFieldValue(field, ''),
                };
                break;
            case InternalComponentType.Checkbox:
            case InternalComponentType.Radio:
            case InternalComponentType.Slider:
            case InternalComponentType.RadioGroup:
                props = {
                    value: getFieldValue(field),
                    onChange: newValue => setFieldValue(field, newValue),
                };
                break;
            case InternalComponentType.DatePicker:
                props = {
                    currentTs: getFieldValue(field),
                    onChange: (_, newValue) => setFieldValue(field, newValue),
                };
                break;
            case InternalComponentType.Picker:
                props = {
                    data: getFieldValue(field),
                    onPickerChange: (_, newValue) => setFieldValue(field, newValue),
                };
                break;

            case InternalComponentType.Switch:
                props = {
                    checked: Boolean(getFieldValue(field)),
                    onChange: checked => setFieldValue(field, checked),
                };
                break;
        }
        const originTrigger = props[trigger];
        props[trigger] = (...args: any) => {
            originTrigger && originTrigger(...args);
            this.validateField();
        };
        return React.cloneElement(children, props);
    }

    render() {
        return this.renderChildren();
    }
}

export default function FormItem(props: IFormItemProps) {
    const { label, field, disabled = false, layout = 'horizontal', style, extra, ...rest } = props;
    const { prefixCls } = useContext(GlobalContext);
    const [errors, setErrors] = useState<ReactNode | null>(null);
    const [warnings, setWarnings] = useState<ReactNode[]>([]);
    const formItemRef = useRef<HTMLDivElement | null>(null);

    const onValidateStatusChange = (validateResult: {
        errors: ReactNode[];
        warnings: ReactNode[];
    }) => {
        const { errors: _errors, warnings: _warnings } = validateResult;
        setErrors(_errors.length ? _errors[0] : null);
        setWarnings(_warnings);
    };
    const getFormItemRef = () => {
        return formItemRef.current;
    };

    return (
        <div
            className={cls(`${prefixCls}-form-item`, `${prefixCls}-form-item-${layout}`, {
                disabled,
            })}
            ref={formItemRef}
        >
            <div className={cls(`${prefixCls}-form-label-item`)}>{label}</div>
            <div className={cls(`${prefixCls}-form-item-control-wrapper`)}>
                <div className={cls(`${prefixCls}-form-item-control`)}>
                    <FormItemInner
                        {...rest}
                        field={field}
                        onValidateStatusChange={onValidateStatusChange}
                        getFormItemRef={getFormItemRef}
                    />
                </div>
                {errors && (
                    <div className={cls(`${prefixCls}-form-message`)}>
                        {errors}
                        {warnings.map((warning, index) => (
                            <p key={index}>{warning}</p>
                        ))}
                    </div>
                )}
            </div>
            {extra}
        </div>
    );
}
